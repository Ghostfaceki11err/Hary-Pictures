import React from 'react';
import { Zap, Plus, Upload, BarChart3, Activity, X } from 'lucide-react';
import { AdminSection, StorageUsage } from '../types';
import { formatBytes } from '../utils/formatBytes';

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  onNewCategory: () => void;
  onUploadClick: () => void;
  categoriesCount: number;
  picturesCount: number;
  storageUsage: StorageUsage;
  onRetryStorage: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeSection,
  onSectionChange,
  onNewCategory,
  onUploadClick,
  categoriesCount,
  picturesCount,
  storageUsage,
  onRetryStorage,
}) => {
  const getStorageUsagePercentage = (): number => {
    return (storageUsage.used / storageUsage.total) * 100;
  };

  return (
    <aside className="space-y-6 sticky top-24 self-start">
      {/* Nav */}
      <nav className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
        <div className="relative grid gap-2">
          {[
            { id: 'overview', label: 'Overview', icon: (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 13h8V3H3v10zM13 21h8v-6h-8v6zM13 3v8h8V3h-8zM3 21h8v-6H3v6z" /></svg>
            ) },
            { id: 'media', label: 'Media', icon: (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16v12H4z" /><path d="M2 20h20" /><path d="M8 10l2.5 3 3.5-5 4 6" /></svg>
            ) },
            { id: 'categories', label: 'Categories', icon: (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            ) },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id as AdminSection)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${
                activeSection === item.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="opacity-90">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
        {activeSection !== 'overview' && (
          <div className="relative mt-3 pt-3 border-t border-white/10">
            <button
              onClick={() => { window.location.href = '/admin'; }}
              className="w-full px-3 py-2 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-colors"
            >
              ← Admin Home
            </button>
          </div>
        )}
      </nav>
      
      {/* Quick Actions - only on overview */}
      {activeSection === 'overview' && (
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
          <div className="relative">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button 
                onClick={onNewCategory} 
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 font-semibold"
              >
                <Plus className="w-4 h-4" />
                New Category
              </button>
              <button 
                onClick={onUploadClick} 
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 font-semibold"
              >
                <Upload className="w-4 h-4" />
                Upload Picture
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Stats - Overview */}
      {activeSection === 'overview' && (
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5"></div>
          <div className="relative">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-sm text-gray-300">Categories</span>
                <span className="text-xl font-bold text-white">{categoriesCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-sm text-gray-300">Pictures</span>
                <span className="text-xl font-bold text-white">{picturesCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-sm text-gray-300">Storage</span>
                <span className="text-lg font-bold text-white">{formatBytes(storageUsage.used)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tips - Overview */}
      {activeSection === 'overview' && (
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
          <div className="relative">
            <h3 className="text-white font-bold mb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-400" />
              Pro Tips
            </h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="font-medium text-white mb-1">Naming Convention</p>
                <p>Use Amharic for display names and English for file storage.</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                <p className="font-medium text-white mb-1">WebP Format</p>
                <p>All images must be in WebP format for optimal performance.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Storage Usage Indicator - Overview */}
      {activeSection === 'overview' && (
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5"></div>
          <div className="relative">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              Storage Analytics
            </h3>
            
            {storageUsage.loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="relative">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500/30 border-t-blue-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-400 animate-pulse" />
                  </div>
                </div>
                <span className="ml-3 text-sm text-gray-300">Analyzing storage...</span>
              </div>
            ) : storageUsage.error ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <X className="w-6 h-6 text-red-400" />
                </div>
                <p className="text-red-400 text-sm mb-3">Storage analysis failed</p>
                <button 
                  onClick={onRetryStorage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                >
                  Retry Analysis
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Storage Overview */}
                <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="text-2xl font-bold text-white mb-1">
                    {formatBytes(storageUsage.used)}
                  </div>
                  <div className="text-sm text-gray-400">
                    of {formatBytes(storageUsage.total)} used
                  </div>
                </div>
                
                {/* Circular Progress */}
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-slate-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="url(#storageGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - getStorageUsagePercentage() / 100)}`}
                      className="transition-all duration-700"
                    />
                    <defs>
                      <linearGradient id="storageGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-white text-lg font-bold">{Math.round(getStorageUsagePercentage())}%</div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-700"
                    style={{ width: `${getStorageUsagePercentage()}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};

