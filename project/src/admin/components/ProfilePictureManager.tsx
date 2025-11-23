import React from 'react';
import { Camera, Upload, X } from 'lucide-react';
import { Category, Picture } from '../types';

interface ProfilePictureManagerProps {
  profilePictureLoading: boolean;
  showCreateProfileCategory: boolean;
  profilePictureCategory: Category | null;
  aboutMePictures: Picture[];
  onCreateCategory: () => void;
  onCancelCreate: () => void;
  onShowUpload: () => void;
  onImageClick: (images: Array<{ src: string; title?: string }>, index: number) => void;
  onDeleteClick: (pictureId: string) => void;
  showToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const ProfilePictureManager: React.FC<ProfilePictureManagerProps> = ({
  profilePictureLoading,
  showCreateProfileCategory,
  profilePictureCategory,
  aboutMePictures,
  onCreateCategory,
  onCancelCreate,
  onShowUpload,
  onImageClick,
  onDeleteClick,
  showToast,
}) => {
  return (
    <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
      <div className="relative">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          Profile Management
        </h3>
        
        {profilePictureLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            <span className="ml-2 text-sm text-gray-300">Loading...</span>
          </div>
        ) : showCreateProfileCategory ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-300 mb-4">
                No "About Me" category found. Create one to manage About Me images.
              </p>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Category Name:</label>
                <div className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm flex items-center justify-between">
                  <span className="text-white">About Me</span>
                  <span className="text-xs text-gray-400 bg-slate-700 px-2 py-1 rounded">Fixed</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Category name cannot be changed</p>
              </div>
              
              <div className="bg-slate-800/50 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Slug (file name):</p>
                <p className="text-sm text-purple-400 font-mono">about-me</p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={onCreateCategory}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Create Category
                </button>
                <button
                  onClick={onCancelCreate}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : profilePictureCategory && aboutMePictures.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-300 mb-2">
                "About Me" category exists but has no images.
              </p>
              <p className="text-xs text-gray-400">
                Upload a WebP image to this category to use as About Me image.
              </p>
            </div>
            
            <button
              onClick={onShowUpload}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload About Me Image
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* About Me Images Grid */}
            <div className="grid grid-cols-1 gap-3">
              {aboutMePictures.map((picture) => (
                <div key={picture.id} className="relative group">
                  <div
                    className="w-48 h-48 mx-auto rounded-lg overflow-hidden border-2 border-white/20 bg-slate-800 cursor-pointer"
                    onClick={() => onImageClick(
                      aboutMePictures.map(p => ({ src: p.image_url, title: p.title })),
                      aboutMePictures.findIndex(p => p.id === picture.id)
                    )}
                  >
                    <img 
                      src={picture.image_url} 
                      alt={picture.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onDeleteClick(picture.id)}
                      className="w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                      title="Delete this image"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-center">{picture.title}</p>
                </div>
              ))}
            </div>

            {/* Upload More Button - Disabled when images exist */}
            <button
              onClick={() => {
                if (aboutMePictures.length > 0) {
                  showToast('info', 'Please delete existing About Me images before uploading new ones. Only one image is allowed in the About Me section.');
                } else {
                  onShowUpload();
                }
              }}
              disabled={aboutMePictures.length > 0}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                aboutMePictures.length > 0 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              <Upload className="w-4 h-4" />
              {aboutMePictures.length > 0 ? 'Delete Existing Image First' : 'Upload Image'}
            </button>
            
            {aboutMePictures.length > 0 && (
              <p className="text-xs text-gray-400 text-center mt-2">
                Only one image is allowed in the About Me section. Delete the current image to upload a new one.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

