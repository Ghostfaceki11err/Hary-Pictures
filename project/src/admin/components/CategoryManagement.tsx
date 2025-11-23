import React, { FormEvent } from 'react';
import { Plus, X, Edit, Trash2, Camera, BarChart3, Shield } from 'lucide-react';
import { Category } from '../types';
import { isAboutMeCategory, isHeroCategory } from '../utils/categoryHelpers';

interface CategoryManagementProps {
  categories: Category[];
  newCategoryAm: string;
  setNewCategoryAm: (value: string) => void;
  newCategorySlug: string;
  setNewCategorySlug: (value: string) => void;
  editingCategoryId: string | null;
  setEditingCategoryId: (id: string | null) => void;
  isAddingCategory: boolean;
  handleAddCategory: (e: FormEvent) => void;
  deletingCategoryId: string | null;
  categoryIdToCount: Record<string, number>;
  onDeleteCategory: (category: Category) => void;
  onDeleteProfileCategory: (category: Category) => void;
  loadCategoryImageCount: (categoryId: string) => Promise<number | null>;
}

export const CategoryManagement: React.FC<CategoryManagementProps> = ({
  categories,
  newCategoryAm,
  setNewCategoryAm,
  newCategorySlug,
  setNewCategorySlug,
  editingCategoryId,
  setEditingCategoryId,
  isAddingCategory,
  handleAddCategory,
  deletingCategoryId,
  categoryIdToCount,
  onDeleteCategory,
  onDeleteProfileCategory,
  loadCategoryImageCount,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-20" />
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
              <Plus className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {editingCategoryId ? 'Edit Category' : 'Create New Category'}
            </h2>
          </div>
          {editingCategoryId && (
            <button 
              onClick={() => { 
                setEditingCategoryId(null); 
                setNewCategoryAm(''); 
                setNewCategorySlug(''); 
              }} 
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <form onSubmit={handleAddCategory} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <span>Category Name</span>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">Amharic</span>
              </label>
              <input 
                type="text" 
                value={newCategoryAm} 
                onChange={(e) => setNewCategoryAm(e.target.value)} 
                placeholder="Enter category name in Amharic" 
                className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-gray-400 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all duration-300 hover:bg-white/10" 
                required 
              />
              <p className="text-xs text-gray-400">This will be displayed to users</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <span>File Name</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">English</span>
              </label>
              <input 
                type="text" 
                value={newCategorySlug} 
                onChange={(e) => setNewCategorySlug(e.target.value)} 
                placeholder="e.g. wedding, portrait, nature" 
                className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-gray-400 border border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition-all duration-300 hover:bg-white/10" 
                required 
              />
              <p className="text-xs text-gray-400">Used for file storage organization</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              type="submit" 
              disabled={isAddingCategory} 
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:from-blue-900 disabled:to-cyan-900 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-800/30 hover:scale-105 flex items-center justify-center gap-2"
            >
              {isAddingCategory ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  {editingCategoryId ? 'Saving...' : 'Adding...'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {editingCategoryId ? 'Save Changes' : 'Add Category'}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Enhanced Category List */}
        <div className="mt-8 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Categories ({categories.length})
          </h3>
          
          <div className="grid gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="group relative overflow-hidden bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg border border-blue-500/30">
                          <Camera className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-white">{cat.name_am}</h4>
                          <p className="text-sm text-gray-400 font-mono">{cat.slug}</p>
                        </div>
                        {isAboutMeCategory(cat) && (
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
                            Profile
                          </span>
                        )}
                        {isHeroCategory(cat) && (
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                            Hero
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{categoryIdToCount[cat.id] || 0} pictures</span>
                        <span>•</span>
                        <span>Created recently</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {isAboutMeCategory(cat) || isHeroCategory(cat) ? (
                        <button 
                          disabled 
                          className="px-4 py-2 rounded-xl bg-gray-600/50 cursor-not-allowed text-gray-400 flex items-center gap-2 text-sm border border-gray-600/50"
                          title="About Me category cannot be edited"
                        >
                          <Shield className="w-4 h-4" />
                          Protected
                        </button>
                      ) : (
                        <button 
                          onClick={() => { 
                            setEditingCategoryId(cat.id); 
                            setNewCategoryAm(cat.name_am); 
                            setNewCategorySlug(cat.slug); 
                          }} 
                          className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm border border-blue-500/30 hover:border-blue-500/50 transition-all duration-300"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      )}
                      
                      <button 
                        onClick={async () => { 
                          if (isAboutMeCategory(cat)) {
                            onDeleteProfileCategory(cat);
                          } else {
                            const count = await loadCategoryImageCount(cat.id);
                            onDeleteCategory(cat);
                            // Note: The modal state management will be handled by the parent
                          }
                        }} 
                        disabled={deletingCategoryId === cat.id} 
                        className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 text-sm border transition-all duration-300 ${
                          deletingCategoryId === cat.id 
                            ? 'bg-red-800/50 cursor-not-allowed border-red-600/50' 
                            : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50'
                        }`}
                      >
                        {deletingCategoryId === cat.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

