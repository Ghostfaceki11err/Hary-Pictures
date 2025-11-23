import React from 'react';
import { AdminSection } from '../types';

interface AdminMenuBarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

export const AdminMenuBar: React.FC<AdminMenuBarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as AdminSection,
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v8h8V3H3zm10 0v8h8V3h-8zM3 13v8h8v-8H3zm10 0v8h8v-8h-8z" />
        </svg>
      ),
    },
    {
      id: 'overview' as AdminSection,
      label: 'Overview',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 13h8V3H3v10zM13 21h8v-6h-8v6zM13 3v8h8V3h-8zM3 21h8v-6H3v6z" />
        </svg>
      ),
    },
    {
      id: 'media' as AdminSection,
      label: 'Media',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16v12H4z" />
          <path d="M2 20h20" />
          <path d="M8 10l2.5 3 3.5-5 4 6" />
        </svg>
      ),
    },
    {
      id: 'categories' as AdminSection,
      label: 'Categories',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
    },
  ];

  return (
    <div className="sticky top-14 z-30 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5"></div>
          <div className="relative flex items-center justify-around p-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex-1 max-w-[200px] ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25 scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`${activeSection === item.id ? 'opacity-100' : 'opacity-70'}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {activeSection === item.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 rounded-b-xl"></div>
                )}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

