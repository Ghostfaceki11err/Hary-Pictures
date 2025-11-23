import React, { ChangeEvent, FormEvent, useRef } from 'react';
import { Upload, Camera, X } from 'lucide-react';
import { Category } from '../types';
import { isAboutMeCategory, isHeroCategory } from '../utils/categoryHelpers';

interface MediaUploadSectionProps {
  title: string;
  setTitle: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  categories: Category[];
  files: File[];
  setFiles: (files: File[]) => void;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  useUrlUpload: boolean;
  setUseUrlUpload: (value: boolean) => void;
  imageUrl: string;
  setImageUrl: (value: string) => void;
  handleUpload: (e: FormEvent) => void;
  isUploading: boolean;
  isConverting: boolean;
  uploadProgress: number;
  uploadProgresses: { [key: string]: number };
  conversionProgress: { [key: string]: number };
  profilePictureCategory: Category | null;
  isValidUUID: (uuid: string) => boolean;
}

export const MediaUploadSection: React.FC<MediaUploadSectionProps> = ({
  title,
  setTitle,
  selectedCategory,
  setSelectedCategory,
  categories,
  files,
  setFiles,
  handleFileChange,
  useUrlUpload,
  setUseUrlUpload,
  imageUrl,
  setImageUrl,
  handleUpload,
  isUploading,
  isConverting,
  uploadProgress,
  uploadProgresses,
  conversionProgress,
  profilePictureCategory,
  isValidUUID,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative overflow-hidden rounded-3xl">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-3xl blur opacity-20" />
      <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30">
            <Upload className="w-6 h-6 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Upload Pictures</h2>
        </div>
        <form onSubmit={handleUpload} className="space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Picture Title (Optional)</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Enter a descriptive title for your pictures" 
              className="w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-gray-400 border border-white/10 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition-all duration-300 hover:bg-white/10" 
            />
            <p className="text-xs text-gray-400">Leave empty to use category name as title</p>
          </div>
          
          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Select Category</label>
            <select 
              value={selectedCategory} 
              onChange={(e) => { 
                const value = e.target.value; 
                if (value === '' || isValidUUID(value)) { 
                  setSelectedCategory(value); 
                } 
              }} 
              className="w-full px-4 py-3 rounded-xl bg-slate-800 text-white border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition-all duration-300 hover:bg-slate-700" 
              required
            >
              <option value="" className="bg-slate-800 text-white">Choose a category for your pictures</option>
              {categories.filter(cat => !isAboutMeCategory(cat) && !isHeroCategory(cat)).map(cat => (
                <option key={cat.id} value={cat.id} className="bg-slate-800 text-white">
                  {cat.name_am} ({cat.slug})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400">Pictures will be organized under the selected category</p>
          </div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-300 text-sm">Upload via URL (WebP only)</span>
              <label htmlFor="useUrlUpload" className="inline-flex items-center cursor-pointer select-none">
                <input
                  id="useUrlUpload"
                  type="checkbox"
                  checked={useUrlUpload}
                  onChange={(e) => setUseUrlUpload(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700/80 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-600 transition-colors relative">
                  <span className="absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full shadow transform transition-transform duration-200 peer-checked:translate-x-5" />
                </div>
              </label>
            </div>
            {useUrlUpload ? (
              <>
                <input 
                  type="url" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)} 
                  placeholder="https://example.com/image.webp" 
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/70 text-white placeholder-gray-400 border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition" 
                  required 
                />
                <p className="text-xs text-gray-400 mt-1">Must be a direct .webp image URL</p>
              </>
            ) : (
              <>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  multiple 
                  onChange={handleFileChange} 
                  accept=".webp,.jpg,.jpeg,.png,.jfif,.jpe,image/webp,image/jpeg,image/png" 
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/70 text-white border border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 focus:outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700" 
                  required 
                />
                <p className="text-xs text-gray-400 mt-1">
                  {selectedCategory === profilePictureCategory?.id 
                    ? "PNG, JPG, JFIF, and WebP images are supported. Images will be automatically converted to WebP format. Only one image is allowed."
                    : "PNG, JPG, JFIF, and WebP images are supported. Images will be automatically converted to WebP format. You can select multiple files."
                  }
                </p>
                
                {/* Display selected files */}
                {files.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-sm text-gray-300 mb-2">Selected files ({files.length}):</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-700/50 rounded px-3 py-2">
                          <div className="flex items-center space-x-2">
                            <Camera size={16} className="text-emerald-400" />
                            <span className="text-sm text-gray-200 truncate">{file.name}</span>
                            <span className="text-xs text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                          </div>
                          <button
                            onClick={() => {
                              const newFiles = files.filter((_, i) => i !== index);
                              setFiles(newFiles);
                              if (newFiles.length === 0 && fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {isUploading && !useUrlUpload && (
            <div className="w-full space-y-3">
              {/* Overall progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">Overall Progress</span>
                  <span className="text-sm text-gray-300">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 border border-slate-700">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </div>
              
              {/* Individual file progress */}
              {files.length > 1 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-400">Individual files:</p>
                  {files.map((file, index) => {
                    const fileKey = `${file.name}-${index}`;
                    const fileUploadProgress = uploadProgresses[fileKey] || 0;
                    const conversionProgressValue = conversionProgress[fileKey] || 0;
                    const isConverting = conversionProgressValue > 0 && conversionProgressValue < 100;
                    const isFileUploading = fileUploadProgress > 0;
                    
                    return (
                      <div key={fileKey} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-300 truncate max-w-[200px]">{file.name}</span>
                          <div className="flex items-center gap-2">
                            {isConverting && (
                              <span className="text-xs text-amber-400">Converting...</span>
                            )}
                            {isFileUploading && !isConverting && (
                              <span className="text-xs text-blue-400">Uploading...</span>
                            )}
                            <span className="text-xs text-gray-400">
                              {isConverting ? Math.round(conversionProgressValue) : Math.round(fileUploadProgress)}%
                            </span>
                          </div>
                        </div>
                        
                        {/* Conversion Progress */}
                        {isConverting && (
                          <div className="w-full bg-slate-800/50 rounded-full h-1 border border-slate-700/50">
                            <div className="bg-gradient-to-r from-amber-500 to-orange-400 h-1 rounded-full transition-all duration-300 ease-out" style={{ width: `${conversionProgressValue}%` }}></div>
                          </div>
                        )}
                        
                        {/* Upload Progress */}
                        {isFileUploading && (
                          <div className="w-full bg-slate-800/50 rounded-full h-1 border border-slate-700/50">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1 rounded-full transition-all duration-300 ease-out" style={{ width: `${fileUploadProgress}%` }}></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isUploading || isConverting || !selectedCategory || (!useUrlUpload && files.length === 0) || (useUrlUpload && !imageUrl)} 
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:from-emerald-900 disabled:to-teal-900 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-800/30"
          >
            {isConverting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Converting to WebP...
              </>
            ) : isUploading && !useUrlUpload ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {useUrlUpload ? 'Add from URL' : files.length > 1 ? `Upload ${files.length} Pictures` : 'Upload Picture'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

