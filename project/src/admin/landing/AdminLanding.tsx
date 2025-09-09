import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FolderKanban, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../supabaseClient';

const STORAGE_BUCKET = 'pictures';
const STORAGE_PREFIX = 'public';

const AdminLanding: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<number>(0);
  const [pictures, setPictures] = useState<number>(0);
  const [storageUsed, setStorageUsed] = useState<number>(0);
  const storageTotal = 1024 * 1024 * 1024; // 1 GB
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { count: catCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
      const { count: picCount } = await supabase.from('pictures').select('*', { count: 'exact', head: true });

      // approximate storage usage by listing subfolders
      const { data: folders } = await supabase.storage.from(STORAGE_BUCKET).list(STORAGE_PREFIX);
      let totalSize = 0;
      if (folders) {
        for (const folder of folders) {
          const { data: files } = await supabase.storage.from(STORAGE_BUCKET).list(`${STORAGE_PREFIX}/${folder.name}`);
          if (files) {
            totalSize += files.reduce((sum, f) => sum + (f.metadata?.size || 0), 0);
          }
        }
      }

      setCategories(catCount || 0);
      setPictures(picCount || 0);
      setStorageUsed(totalSize);
      setLoading(false);
    }
    load();
  }, []);

  const storageText = useMemo(() => formatBytes(storageUsed), [storageUsed]);
  const storagePercent = useMemo(() => {
    const pct = (storageUsed / storageTotal) * 100;
    if (!isFinite(pct)) return 0;
    return Math.max(0, Math.min(100, pct));
  }, [storageUsed]);

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-[pulse_5s_ease-in-out_infinite]" />
      </div>

      <section className="relative py-20 text-center">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4 tracking-tight">
            Welcome, Admin
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Manage your categories, media, and gallery with ease.
          </p>

          {/* Go to Home */}
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/15"
            >
              Go to Home
            </button>
          </div>

          {/* Futuristic Stats */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Categories */}
            <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl" />
              <div className="text-sm text-gray-400 mb-1">Categories</div>
              <div className="text-4xl font-extrabold tracking-tight text-white">{loading ? '—' : categories}</div>
              <div className="mt-2 text-xs text-gray-400">Total content groups</div>
            </div>
            {/* Pictures */}
            <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
              <div className="absolute -bottom-12 -left-10 w-32 h-32 rounded-full bg-fuchsia-500/10 blur-2xl" />
              <div className="text-sm text-gray-400 mb-1">Pictures</div>
              <div className="text-4xl font-extrabold tracking-tight text-white">{loading ? '—' : pictures}</div>
              <div className="mt-2 text-xs text-gray-400">Items in your gallery</div>
            </div>
            {/* Storage Gauge */}
            <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white/5 to-white/10 border border-white/10">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.12),transparent_60%)]" />
              </div>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.08)" strokeWidth="10" fill="none" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      stroke="url(#g1)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - storagePercent / 100)}`}
                      className="transition-all duration-700 drop-shadow-[0_0_12px_rgba(34,197,94,0.5)]"
                    />
                  </svg>
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-white text-lg font-bold">{Math.round(storagePercent)}%</div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-sm text-gray-400">Storage</div>
                  <div className="text-xl font-semibold text-white">{loading ? '—' : `${storageText} / 1 GB`}</div>
                  <div className="mt-1 h-1.5 w-40 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400" style={{ width: `${storagePercent}%` }} />
                  </div>
                  <div className="mt-1 text-xs text-gray-400">Out of 1 GB</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onClick={() => navigate('/admin/categories')} className="group bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-2xl p-5 flex items-center justify-between">
              <div className="text-left">
                <div className="text-lg font-semibold">Create Categories</div>
                <div className="text-sm opacity-80">Organize your media</div>
              </div>
              <FolderKanban className="w-6 h-6 opacity-90 group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={() => navigate('/admin/media')} className="group bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-2xl p-5 flex items-center justify-between">
              <div className="text-left">
                <div className="text-lg font-semibold">Upload Pictures</div>
                <div className="text-sm opacity-80">Profile & Hero images</div>
              </div>
              <Upload className="w-6 h-6 opacity-90 group-hover:scale-110 transition-transform" />
            </button>
            <button onClick={() => navigate('/admin/gallery')} className="group bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-2xl p-5 flex items-center justify-between">
              <div className="text-left">
                <div className="text-lg font-semibold">Visual Gallery</div>
                <div className="text-sm opacity-80">Manage pictures</div>
              </div>
              <ImageIcon className="w-6 h-6 opacity-90 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Secondary actions removed */}

          {/* Pro Tips */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
              <div className="text-white font-semibold mb-1">Use WebP</div>
              <div className="text-sm text-gray-300">All uploads are converted to WebP for optimal performance.</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
              <div className="text-white font-semibold mb-1">Organize by Category</div>
              <div className="text-sm text-gray-300">Create clear slugs to keep storage tidy and predictable.</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
              <div className="text-white font-semibold mb-1">Keep Storage Lean</div>
              <div className="text-sm text-gray-300">Delete unused images to reduce bandwidth and costs.</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminLanding;
