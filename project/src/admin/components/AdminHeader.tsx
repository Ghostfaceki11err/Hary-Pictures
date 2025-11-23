import React from 'react';

interface AdminHeaderProps {
  userEmail: string;
  onLogout: () => void;
  categoriesCount: number;
  picturesCount: number;
  storageUsed: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ userEmail, onLogout, categoriesCount, picturesCount, storageUsed }) => {
  return (
    <section className="relative py-20 text-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Profile Card */}
        {userEmail && (
          <div className="flex justify-center mb-8">
            <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10">
              {/* Background Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl font-bold">
                      {userEmail.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>

                {/* User Info */}
                <div className="text-left flex-1">
                  <div className="text-white text-lg font-semibold mb-1">{userEmail}</div>
                  <div className="text-gray-400 text-sm mb-2">Admin User</div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {/* Home Button */}
                  <button
                    onClick={() => window.location.href = '/'}
                    className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-200 hover:text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Home</span>
                    </div>
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={onLogout}
                    className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 hover:border-red-500/50 text-red-200 hover:text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/25"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-6 tracking-tight">
          Admin Hub
        </h1>
        <p className="text-xl sm:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
          Manage your visual content with style and precision
        </p>

        {/* Quick Stats */}
        <div className="flex flex-wrap justify-center gap-6 mt-12">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4">
            <div className="text-2xl font-bold text-white">{categoriesCount}</div>
            <div className="text-sm text-gray-400">Categories</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4">
            <div className="text-2xl font-bold text-white">{picturesCount}</div>
            <div className="text-sm text-gray-400">Pictures</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4">
            <div className="text-2xl font-bold text-white">{storageUsed}</div>
            <div className="text-sm text-gray-400">Storage Used</div>
          </div>
        </div>
      </div>
    </section>
  );
};

