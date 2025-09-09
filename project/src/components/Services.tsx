import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../admin/supabaseClient';

interface ServicesProps {
  onPageChange: (page: string) => void;
}

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

interface ServiceItem {
  title: string;
  size: 'large' | 'medium' | 'small';
  image: string;
}

const Services: React.FC<ServicesProps> = ({ onPageChange }) => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch services data from Supabase
  const fetchServicesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch pictures with categories (excluding About Me)
      const { data: pictures, error } = await supabase
        .from('pictures')
        .select(`
          id, 
          title, 
          image_url, 
          category_id,
          categories(id, name_am, slug)
        `);

      if (error) {
        throw new Error(`Failed to fetch pictures: ${error.message}`);
      }

      // Transform pictures data to handle Supabase's relationship structure
      const transformedPictures = (pictures || [])
        .map(picture => ({
          ...picture,
          categories: Array.isArray(picture.categories) ? picture.categories[0] || null : picture.categories
        }))
        .filter(picture => {
          const cat = picture.categories;
          const name = cat?.name_am?.toLowerCase().trim();
          const slug = cat?.slug?.toLowerCase().trim();
          return !!name && name !== 'about me' && name !== 'hero' && slug !== 'hero';
        }); // Exclude About Me and Hero categories (normalized)

      // Group pictures by category and get one random representative image per category
      const categoryMap = new Map<string, Picture[]>();
      transformedPictures.forEach(picture => {
        if (picture.categories) {
          const categoryName = picture.categories.name_am;
          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, []);
          }
          categoryMap.get(categoryName)!.push(picture);
        }
      });

      // Select one random image from each category
      const selectedPictures: Picture[] = [];
      categoryMap.forEach((pictures, categoryName) => {
        if (pictures.length > 0) {
          const randomIndex = Math.floor(Math.random() * pictures.length);
          selectedPictures.push(pictures[randomIndex]);
        }
      });

      // Convert to service items with appropriate sizes
      const serviceItems: ServiceItem[] = selectedPictures.map((picture, index) => ({
        title: picture.categories?.name_am || 'Other',
        size: 'medium' as 'large' | 'medium' | 'small', // All items are medium size
        image: picture.image_url
      }));

      console.log('Services - Categories with images:', Array.from(categoryMap.keys()));
      console.log('Services - Random images selected:', selectedPictures.map(p => ({ category: p.categories?.name_am, image: p.image_url })));
      console.log('Services - Service items count:', serviceItems.length);

      setServices(serviceItems);
    } catch (err) {
      console.error('Error fetching services data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load services data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicesData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-green-400 text-sm font-light tracking-widest mb-4">
              — Our Services
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              CAPTURING LIFE'S MOMENTS
            </h1>
            <p className="text-gray-300 text-lg font-light max-w-2xl">
              Exceptional Photography and other Services for Every Occasion
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-gray-300">Loading services...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-400 mb-4">Error loading services: {error}</p>
              <button 
                onClick={fetchServicesData}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
            {services.map((service, index) => (
              <div
                key={index}
                className={`group cursor-pointer transition-all duration-500 hover:scale-105 ${
                  service.size === 'large' ? 'md:col-span-2 lg:col-span-2' : 'md:col-span-1'
                }`}
                onClick={() => {
                  console.log('Service image clicked, redirecting to contact page');
                  navigate('/contact');
                }}
              >
                {/* Image Container */}
                <div className={`relative overflow-hidden mb-4 ${
                  service.size === 'large' ? 'aspect-[16/10]' : 'aspect-[4/5]'
                }`}>
                  <img 
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-all duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-all duration-500"></div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-white text-sm font-light tracking-widest">
                        REQUEST SERVICE
                      </p>
                    </div>
                  </div>
                </div>

                {/* Service Title */}
                <div className="text-left">
                  <h3 className="text-white font-normal text-lg mb-2 group-hover:text-green-400 transition-colors duration-300">
                    {service.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

    

     

      {/* Footer */}
      <section className="py-12 bg-black border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center text-gray-400 text-sm">
            <p>Copyright © 2025.</p>
            <div className="flex gap-6 mt-4 sm:mt-0">
              <a href="https://www.instagram.com/hary_picture7?igsh=MXFqeDFmeGFxdXRzNQ==" className="hover:text-white transition-colors duration-300" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://t.me/harygraphic" className="hover:text-white transition-colors duration-300" target="_blank" rel="noopener noreferrer">Telegram</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;