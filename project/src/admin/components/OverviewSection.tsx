import React from 'react';
import { Category, Picture, StorageUsage, AdminSection } from '../types';
import { Upload, FolderKanban, Image as ImageIcon, Clock, ArrowRight } from 'lucide-react';

interface OverviewSectionProps {
  categories: Category[];
  pictures: Picture[];
  storageUsage: StorageUsage;
  categoryIdToCount: Record<string, number>;
  categoryIdToPreview: Record<string, string>;
  onSectionChange: (section: AdminSection) => void;
  onNewCategory: () => void;
  onUploadClick: () => void;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  categories,
  pictures,
  storageUsage,
  categoryIdToCount,
  categoryIdToPreview,
  onSectionChange,
  onNewCategory,
  onUploadClick,
}) => {
  // Get regular categories (excluding About Me and Hero)
  const regularCategories = categories.filter(cat => {
    const slug = cat.slug.toLowerCase();
    return slug !== 'about-me' && slug !== 'hero';
  });

  // Get recent pictures (last 6)
  const recentPictures = pictures
    .filter(pic => {
      const cat = pic.categories;
      return cat && cat.slug !== 'about-me' && cat.slug !== 'hero';
    })
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onNewCategory}
          className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/25"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white text-lg font-semibold mb-1">Create Category</div>
              <div className="text-white/80 text-sm">Organize your media into categories</div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FolderKanban className="w-6 h-6 text-white" />
            </div>
          </div>
        </button>

        <button
          onClick={onUploadClick}
          className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-2xl p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/25"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white text-lg font-semibold mb-1">Upload Pictures</div>
              <div className="text-white/80 text-sm">Add new images to your gallery</div>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6 text-white" />
            </div>
          </div>
        </button>
      </div>

      {/* Categories Overview */}
      {regularCategories.length > 0 && (
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-xl flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-purple-400" />
                Categories Overview
              </h3>
              <button
                onClick={() => onSectionChange('categories')}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {regularCategories.slice(0, 8).map((category) => {
                const count = categoryIdToCount[category.id] || 0;
                const preview = categoryIdToPreview[category.id];
                return (
                  <div
                    key={category.id}
                    className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                    onClick={() => onSectionChange('gallery')}
                  >
                    {preview ? (
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-3">
                        <img
                          src={preview}
                          alt={category.name_am}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="text-white text-xs font-semibold">{count}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full aspect-square rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-3">
                        <ImageIcon className="w-8 h-8 text-purple-400/50" />
                      </div>
                    )}
                    <div className="text-white text-sm font-medium truncate">{category.name_am}</div>
                    <div className="text-gray-400 text-xs mt-1">{count} pictures</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Pictures */}
      {recentPictures.length > 0 && (
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-bold text-xl flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                Recent Pictures
              </h3>
              <button
                onClick={() => onSectionChange('gallery')}
                className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentPictures.map((picture) => (
                <div
                  key={picture.id}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
                  onClick={() => onSectionChange('gallery')}
                >
                  <img
                    src={picture.image_url}
                    alt={picture.title || 'Picture'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <div className="text-white text-xs font-medium truncate">
                        {picture.title || 'Untitled'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {regularCategories.length === 0 && pictures.length === 0 && (
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Welcome to Admin Hub</h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Get started by creating your first category and uploading pictures to build your gallery.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onNewCategory}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Create Category
              </button>
              <button
                onClick={onUploadClick}
                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Upload Pictures
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

