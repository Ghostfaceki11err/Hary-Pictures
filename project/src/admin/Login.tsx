import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { LogIn, Eye, EyeOff, Mail, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signInError) throw signInError;
    } catch (err) {
      const msg = (err as Error).message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-20" />
        <div className="relative w-full rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="text-sm text-gray-400 mt-2">Sign in to access the Admin Panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-2">Email</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onInvalid={(e) => {
                    const el = e.target as HTMLInputElement;
                    if (!el.value) el.setCustomValidity('Please enter your email address.');
                    else el.setCustomValidity('Please enter a valid email address.');
                  }}
                  onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-800/70 text-white placeholder-gray-400 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition invalid:border-red-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-300">Password</label>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onInvalid={(e) => {
                    const el = e.target as HTMLInputElement;
                    if (!el.value) el.setCustomValidity('Please enter your password.');
                  }}
                  onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                  placeholder="Your password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-800/70 text-white placeholder-gray-400 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition invalid:border-red-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:from-blue-900 disabled:to-cyan-900 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-800/30"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-500 mt-2">
              Protected area • Authorized users only
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
