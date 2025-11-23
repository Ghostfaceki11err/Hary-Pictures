import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Camera, X, Video } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import VideoPlugin from 'yet-another-react-lightbox/plugins/video';
import { supabase } from '../admin/supabaseClient';
import { checkEnvironment } from '../utils/envCheck';
import { isVideoUrl, getMediaType } from '../admin/utils/mediaTypeDetection';
// JWT error handling is now built into the fetch function

// Supabase interfaces
interface Category {
  id: string;
  name_am: string;
  slug: string;
}

interface Picture {
  id: string;
  title: string;
  image_url: string;
  categories: Category | null;
}

const Portfolio: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'all');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Update selectedCategory when URL parameter changes
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);
  
  // Supabase state
  const [categories, setCategories] = useState<Category[]>([]);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const headerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  type PortfolioItem = {
    id: number;
    category: string;
    title: string;
    description: string;
    image?: string;
  };

  // Fetch data from Supabase
  useEffect(() => {
    // Check environment in production for debugging
    if (import.meta.env.PROD) {
      checkEnvironment();
    }
    fetchData();
  }, []);


  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we have a valid session, if not, sign out and retry
      const { error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.warn('Session check failed:', sessionError);
        // Clear any invalid session
        await supabase.auth.signOut();
      }
      
      // Fetch categories and pictures in parallel
      const [categoriesResult, picturesResult] = await Promise.all([
        supabase.from('categories').select('id, name_am, slug'),
        supabase.from('pictures').select(`
          id, 
          title, 
          image_url, 
          category_id,
          categories(id, name_am, slug)
        `)
      ]);

      if (categoriesResult.error) {
        // If it's a JWT error, try to refresh the session
        if (categoriesResult.error.message.includes('JWT') || categoriesResult.error.message.includes('expired')) {
          console.warn('JWT expired, attempting to refresh session...');
          await supabase.auth.signOut();
          // Retry the request after clearing the session
          const retryResult = await supabase.from('categories').select('id, name_am, slug');
          if (retryResult.error) {
            throw new Error(`Failed to fetch categories: ${retryResult.error.message}`);
          }
          (categoriesResult as any).data = retryResult.data;
        } else {
          throw new Error(`Failed to fetch categories: ${categoriesResult.error.message}`);
        }
      }

      if (picturesResult.error) {
        // If it's a JWT error, try to refresh the session
        if (picturesResult.error.message.includes('JWT') || picturesResult.error.message.includes('expired')) {
          console.warn('JWT expired, attempting to refresh session...');
          await supabase.auth.signOut();
          // Retry the request after clearing the session
          const retryResult = await supabase.from('pictures').select(`
            id, 
            title, 
            image_url, 
            category_id,
            categories(id, name_am, slug)
          `);
          if (retryResult.error) {
            throw new Error(`Failed to fetch pictures: ${retryResult.error.message}`);
          }
          (picturesResult as any).data = retryResult.data;
        } else {
          throw new Error(`Failed to fetch pictures: ${picturesResult.error.message}`);
        }
      }

      setCategories(categoriesResult.data || []);
      
      // Transform pictures data to handle Supabase's relationship structure
      const transformedPictures = (picturesResult.data || []).map(picture => {
        let category = null;
        
        if (picture.categories) {
          if (Array.isArray(picture.categories)) {
            category = picture.categories[0] || null;
          } else {
            category = picture.categories;
          }
        }
        
        return {
          ...picture,
          categories: category
        };
      });
      
      console.log('Raw pictures data:', picturesResult.data);
      console.log('Transformed pictures:', transformedPictures);
      setPictures(transformedPictures);
    } catch (err) {
      console.error('Error fetching data:', err);
      
      // Enhanced error logging for production debugging
      if (import.meta.env.PROD) {
        console.error('Production error details:', {
          error: err,
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        });
      }
      
      // Set user-friendly error message
      const errorMessage = err instanceof Error ? err.message : 'Failed to load portfolio data';
      setError(errorMessage);
      
      // In production, if it's a network or Supabase error, show a more helpful message
      if (import.meta.env.PROD && (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('Supabase'))) {
        setError('Unable to load portfolio at the moment. Please check your internet connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create dynamic categories from Supabase data (excluding About Me)
  const dynamicCategories = [
    { id: 'all', label: 'All Work' },
    ...categories
      .filter(cat => {
        const name = cat.name_am?.toLowerCase().trim();
        const slug = cat.slug?.toLowerCase().trim();
        return name !== 'about me' && name !== 'hero' && slug !== 'hero';
      }) // Exclude About Me and Hero categories (normalized)
      .map(cat => ({
        id: cat.id,
        label: cat.name_am
      }))
  ];

  // Convert Supabase pictures to PortfolioItems
  const portfolioItems: PortfolioItem[] = pictures
    .filter(picture => {
      const cat = picture.categories;
      const name = cat?.name_am?.toLowerCase().trim();
      const slug = cat?.slug?.toLowerCase().trim();
      return !!name && name !== 'about me' && name !== 'hero' && slug !== 'hero';
    }) // Exclude About Me and Hero (normalized)
    .map((picture, idx) => ({
      id: idx + 1, // Use simple sequential ID based on index
      category: picture.categories!.name_am, // Only use pictures with valid categories
      title: picture.title,
      description: `${picture.categories!.name_am} ፎቶዎች`,
      image: picture.image_url
    }));

  // Debug logging
  console.log('Categories:', categories.map(c => c.name_am));
  console.log('Portfolio items by category:', portfolioItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>));

  const filteredItems = useMemo(() => {
    console.log('Filtering with selectedCategory:', selectedCategory);
    console.log('Available categories:', categories.map(c => ({ id: c.id, name: c.name_am })));
    console.log('Portfolio items:', portfolioItems.map(p => ({ category: p.category, title: p.title })));
    
    if (selectedCategory === 'all') {
      console.log('Returning all items:', portfolioItems.length);
      return portfolioItems;
    }
    
    // Try to find category by ID first (for button clicks), then by name (for URL parameters)
    let category = categories.find(cat => cat.id === selectedCategory);
    if (!category) {
      category = categories.find(cat => cat.name_am === selectedCategory);
    }
    
    console.log('Found category:', category);
    
    if (!category) {
      console.log('No category found, returning empty array');
      return [];
    }
    
    // Filter by category name (since portfolioItems use category names)
    const filtered = portfolioItems.filter(item => item.category === category.name_am);
    console.log('Filtered items:', filtered.length, 'for category:', category.name_am);
    console.log('Filtered items details:', filtered.map(f => ({ title: f.title, category: f.category })));
    return filtered;
  }, [selectedCategory, portfolioItems, categories]);

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section 
        ref={headerRef}
        className="py-20 text-center"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            My Portfolio
          </h1>
          <p className="text-xl text-gray-300 leading-relaxed">
            A collection of my finest work, showcasing the beauty and emotion in every frame
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section 
        ref={filterRef}
        className="pb-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-400">
              <p>Error loading categories: {error}</p>
              <button 
                onClick={fetchData}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
          <div className="flex flex-wrap justify-center gap-4">
              {dynamicCategories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => {
                  console.log('Button clicked for category:', category.id, category.label);
                  setSelectedCategory(category.id);
                }}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    selectedCategory === category.id || selectedCategory === category.label
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-800 text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`
                }}
              >
                {category.label}
              </button>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Portfolio Grid */}
      <section 
        ref={gridRef}
        className="pb-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-300">Loading portfolio...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 mb-4">Error loading portfolio: {error}</p>
              <button 
                onClick={fetchData}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Camera size={64} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Images Yet</h3>
                <p className="text-gray-300 mb-4">
                  This category doesn't have any images yet. Check back later or explore other categories.
                </p>
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View All Images
                </button>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
                style={{
                  transitionDelay: `${index * 50}ms`
                }}
                onClick={() => {
                  if (item.image) {
                    setLightboxIndex(index);
                    setLightboxOpen(true);
                  } else {
                    setSelectedImage(index);
                  }
                }}
              >
                {/* Show image/video if available, else fallback to gradient */}
                {item.image ? (
                  isVideoUrl(item.image) ? (
                    <div className="aspect-square w-full h-full bg-slate-800 relative overflow-hidden">
                      <video
                        src={item.image}
                        className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                        muted
                        playsInline
                        preload="metadata"
                        loop
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="p-3 bg-black/50 rounded-full backdrop-blur-sm">
                          <Video className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="aspect-square w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  )
                ) : (
                <div className="aspect-square bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300"></div>
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-200 text-sm">{item.description}</p>
                </div>

                {/* Camera Icon if no image */}
                {!item.image && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera size={48} className="text-white opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                </div>
                )}

                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-blue-600/80 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
                  {item.category}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal for images and videos */}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={() => setLightboxOpen(false)}
          index={lightboxIndex}
          slides={filteredItems.filter(i => i.image).map(i => {
            const isVideo = isVideoUrl(i.image!);
            const baseSlide = {
              title: i.title,
              description: i.description
            };
            
            if (isVideo) {
              return {
                ...baseSlide,
                type: 'video' as const,
                sources: [
                  {
                    src: i.image!,
                    type: 'video/webm'
                  }
                ]
              };
            }
            
            return {
              ...baseSlide,
              src: i.image!
            };
          })}
          on={{ view: ({ index }) => setLightboxIndex(index) }}
          plugins={[Fullscreen, Zoom, Slideshow, VideoPlugin]}
          slideshow={{ delay: 8000 }}
          video={{
            autoPlay: true,
            playsInline: true,
            controls: true,
            preload: 'auto'
          }}
          render={{
            slideHeader: () => (
              <div className="absolute top-4 left-4 z-50">
                <div className="text-white text-lg font-semibold bg-black/60 rounded px-3 py-1">
                  {lightboxIndex + 1} / {filteredItems.filter(i => i.image).length}
                </div>
              </div>
            )
          }}
        />
      )}
      {/* Lightbox Modal for non-image items */}
      {selectedImage !== null && !filteredItems[selectedImage].image && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-300"
            >
              <X size={32} />
            </button>
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-500 aspect-video rounded-2xl shadow-2xl flex items-center justify-center">
              <div className="text-center text-white">
                <Camera size={64} className="mx-auto mb-4 opacity-80" />
                <h3 className="text-2xl font-bold mb-2">{filteredItems[selectedImage].title}</h3>
                <p className="text-lg opacity-90">{filteredItems[selectedImage].description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;