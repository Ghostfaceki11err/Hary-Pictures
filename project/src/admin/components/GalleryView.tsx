import React, { useRef } from 'react';
import { Camera, Trash2, Eye, Video } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow';
import VideoPlugin from 'yet-another-react-lightbox/plugins/video';
import { Category, Picture, SortMode } from '../types';
import { OptimizedImage } from './OptimizedImage';
import { isAboutMeCategory } from '../utils/categoryHelpers';
import { isVideoUrl, getMediaType } from '../utils/mediaTypeDetection';

interface GalleryViewProps {
  pictures: Picture[];
  categories: Category[];
  filteredPictures: Picture[];
  selectedFilterCategoryId: string;
  sortMode: SortMode;
  onCategoryFilter: (categoryId: string) => void;
  onSortChange: (sort: SortMode) => void;
  categoryIdToCount: Record<string, number>;
  categoryIdToPreview: Record<string, string>;
  lightboxOpen: boolean;
  lightboxIndex: number;
  customLightboxSlides: Array<{ src?: string; type?: 'video'; sources?: Array<{ src: string; type: string }>; title?: string; description?: string }> | null;
  onImageClick: (index: number) => void;
  onCloseLightbox: () => void;
  onDeleteClick: (pictureId: string, imageUrl: string) => void;
  deletingPictureId: string | null;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  pictures,
  categories,
  filteredPictures,
  selectedFilterCategoryId,
  sortMode,
  onCategoryFilter,
  onSortChange,
  categoryIdToCount,
  categoryIdToPreview,
  lightboxOpen,
  lightboxIndex,
  customLightboxSlides,
  onImageClick,
  onCloseLightbox,
  onDeleteClick,
  deletingPictureId,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  const lightboxSlides = filteredPictures.map(pic => {
    const isVideo = isVideoUrl(pic.image_url);
    const baseSlide = {
      title: pic.title,
      description: pic.categories?.name_am
    };
    
    if (isVideo) {
      return {
        ...baseSlide,
        type: 'video' as const,
        sources: [
          {
            src: pic.image_url,
            type: 'video/webm'
          }
        ]
      };
    }
    
    return {
      ...baseSlide,
      src: pic.image_url
    };
  });

  return (
    <>
      <div ref={gridRef} className="relative overflow-hidden rounded-3xl">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 rounded-3xl blur opacity-10" />
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-fuchsia-500/20 to-purple-500/20 rounded-xl border border-fuchsia-500/30">
                <Camera className="w-6 h-6 text-fuchsia-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Visual Gallery</h2>
                <p className="text-sm text-gray-400">{pictures.length} pictures across {categories.length} categories</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={sortMode}
                onChange={(e) => onSortChange(e.target.value as SortMode)}
                className="px-4 py-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 focus:outline-none transition-all duration-300 hover:bg-slate-700"
              >
                <option value="newest" className="bg-slate-800 text-white">🕒 Newest First</option>
                <option value="oldest" className="bg-slate-800 text-white">🕐 Oldest First</option>
                <option value="title" className="bg-slate-800 text-white">🔤 Alphabetical</option>
              </select>
            </div>
          </div>
          
          {/* Enhanced Category Filters */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-300 mb-4 text-center">Filter by Category</h3>
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center px-2 sm:px-0">
              <button
                onClick={() => onCategoryFilter('')}
                className={`group relative overflow-hidden px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 border-2 flex items-center gap-2 sm:gap-3 touch-manipulation ${
                  selectedFilterCategoryId === ''
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-blue-500 shadow-lg scale-105'
                    : 'bg-white/5 text-gray-200 border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95 sm:hover:scale-105'
                }`}
              >
                <div className="p-2 bg-white/20 rounded-lg">
                  <Camera className="h-4 w-4" />
                </div>
                <span>All Pictures</span>
                <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                  {pictures.filter(pic => !pic.categories || !isAboutMeCategory(pic.categories)).length}
                </span>
              </button>
              
              {categories.filter(cat => !isAboutMeCategory(cat)).map((cat) => {
                const preview = categoryIdToPreview[cat.id] || '';
                const count = categoryIdToCount[cat.id] || 0;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onCategoryFilter(cat.id)}
                    className={`group relative overflow-hidden px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 border-2 flex items-center gap-2 sm:gap-3 touch-manipulation ${
                      selectedFilterCategoryId === cat.id
                        ? 'bg-gradient-to-r from-fuchsia-600 to-purple-500 text-white border-fuchsia-500 shadow-lg scale-105'
                        : 'bg-white/5 text-gray-200 border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95 sm:hover:scale-105'
                    }`}
                    title={cat.name_am}
                  >
                    <div className="relative h-8 w-8 rounded-lg overflow-hidden bg-gradient-to-br from-fuchsia-600/40 to-purple-500/40 border border-white/10">
                      {preview ? (
                        <OptimizedImage src={preview} alt={cat.name_am} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Camera className="h-4 w-4 text-fuchsia-300" />
                        </div>
                      )}
                    </div>
                    <span className="truncate max-w-[8rem]">{cat.name_am}</span>
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Enhanced Gallery Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {filteredPictures.map((pic, index) => (
              <div 
                key={pic.id} 
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:border-white/20 transition-all duration-300 shadow-lg hover:shadow-xl sm:hover:scale-105" 
                onClick={() => onImageClick(index)}
              >
                {/* Image/Video Container */}
                <div className="relative aspect-square overflow-hidden">
                  {isVideoUrl(pic.image_url) ? (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <video 
                        src={pic.image_url}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 sm:group-hover:scale-110"
                        muted={true}
                        playsInline
                        preload="metadata"
                        loop
                        onMouseEnter={(e) => {
                          // Optional: play on hover for preview
                          // e.currentTarget.play().catch(() => {});
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="p-3 bg-black/50 rounded-full backdrop-blur-sm">
                          <Video className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <OptimizedImage 
                      src={pic.image_url} 
                      alt={pic.title} 
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 sm:group-hover:scale-110" 
                    />
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-gradient-to-r from-fuchsia-600/90 to-purple-500/90 text-white rounded-full text-xs font-semibold backdrop-blur-sm">
                      {pic.categories?.name_am}
                    </span>
                  </div>
                  
                  {/* Delete Button */}
                  <button 
                    onClick={(e) => { 
                      e.preventDefault();
                      e.stopPropagation(); 
                      onDeleteClick(pic.id, pic.image_url);
                    }} 
                    onMouseDown={(e) => e.stopPropagation()}
                    disabled={deletingPictureId === pic.id} 
                    className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 shadow-lg z-10 ${
                      deletingPictureId === pic.id 
                        ? 'bg-red-800/80 cursor-not-allowed' 
                        : 'bg-red-600/80 hover:bg-red-700/80 hover:scale-110'
                    }`}
                  >
                    {deletingPictureId === pic.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                    ) : (
                      <Trash2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                      <Eye className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-lg mb-2 line-clamp-1 group-hover:text-fuchsia-300 transition-colors">
                    {pic.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      {pic.categories?.name_am}
                    </span>
                    <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                      {isVideoUrl(pic.image_url) ? 'WebM' : 'WebP'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {pictures.length === 0 && (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No pictures uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <Lightbox
          open={lightboxOpen}
          close={onCloseLightbox}
          index={lightboxIndex}
          slides={customLightboxSlides || lightboxSlides}
          on={{ view: ({ index }) => onImageClick(index) }}
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
                <div className="text-white text-sm sm:text-base font-semibold bg-black/60 rounded px-3 py-1">
                  {lightboxIndex + 1} / {filteredPictures.length}
                </div>
              </div>
            )
          }}
        />
      )}
    </>
  );
};

