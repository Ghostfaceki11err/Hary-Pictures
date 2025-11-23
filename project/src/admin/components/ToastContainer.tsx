import React from 'react';
import { ToastItem } from '../types';

interface ToastContainerProps {
  toasts: ToastItem[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`min-w-[260px] max-w-xs px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md animate-[fadeIn_.2s_ease-out] text-sm
            ${t.type === 'success' ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200' : ''}
            ${t.type === 'error' ? 'bg-red-500/15 border-red-400/30 text-red-200' : ''}
            ${t.type === 'info' ? 'bg-blue-500/15 border-blue-400/30 text-blue-200' : ''}
          `}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
};

