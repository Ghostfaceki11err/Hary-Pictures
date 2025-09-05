import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
      <div className="relative w-full max-w-3xl text-center">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-20" />
        <div className="relative rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-2xl p-10">
          <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-extrabold text-2xl shadow-lg">
            404
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">Page not found</h1>
          <p className="mt-3 text-gray-400 max-w-xl mx-auto">
            The page you’re looking for doesn’t exist or may have been moved. Check the URL or go back to the homepage.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              to="/"
              className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 transition-all shadow-lg hover:shadow-blue-800/30"
            >
              Go Home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 rounded-xl font-semibold text-white/90 bg-white/10 hover:bg-white/15 border border-white/10 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
