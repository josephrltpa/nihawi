// ============================================================
// LOGIN PAGE
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lock, Mail, ArrowRight, Github, Globe } from 'lucide-react';
import { useApp } from '../store/AppContext';

export default function LoginPage() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@nihawi.com');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleLogin = () => {
    setError('');
    setLoading(true);
    
    // Load seed data and login
    setTimeout(() => {
      try {
        dispatch({ type: 'LOAD_SEED_DATA' });
        setLoading(false);
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to load demo data. Please try again.');
        setLoading(false);
      }
    }, 600);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 shadow-xl shadow-pink-500/20 mb-4">
            <Sparkles className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
            Nihawi × Jaui
          </h1>
          <p className="text-gray-400 text-sm mt-1">Instagram Giveaway Comment Picker</p>
        </div>
        
        {/* Login Form */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Welcome Back</h2>
          <p className="text-sm text-gray-400 mb-6">Sign in to manage your giveaways</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50"
                  placeholder="admin@nihawi.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            {/* Main Sign In Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-500 bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white shadow-lg shadow-pink-500/20 px-6 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading demo data...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight size={16} />
                </span>
              )}
            </button>
          </div>
          
          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-gray-800/50 text-gray-500">Demo Mode</span>
            </div>
          </div>
          
          {/* Quick Demo Access */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 bg-gray-700/50 hover:bg-gray-700 text-gray-200 border border-gray-600 px-4 py-2.5 text-sm disabled:opacity-50"
          >
            <Sparkles size={16} className="text-amber-400" />
            Enter Demo Mode (30 sample entries)
          </button>
          
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <p className="text-xs text-gray-500 text-center">
              No account needed — demo loads sample data locally
            </p>
          </div>
        </div>
        
        {/* Deployment Info */}
        <div className="mt-6 bg-gray-800/30 border border-gray-700/30 rounded-xl p-4">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Deploy This App</h3>
          <div className="grid grid-cols-3 gap-2">
            <a 
              href="https://vercel.com/new" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-500 transition-colors group"
            >
              <Globe size={18} className="text-gray-400 group-hover:text-white" />
              <span className="text-[10px] text-gray-500 group-hover:text-gray-300">Vercel</span>
            </a>
            <a 
              href="https://www.netlify.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-500 transition-colors group"
            >
              <Globe size={18} className="text-gray-400 group-hover:text-white" />
              <span className="text-[10px] text-gray-500 group-hover:text-gray-300">Netlify</span>
            </a>
            <a 
              href="https://pages.github.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-500 transition-colors group"
            >
              <Github size={18} className="text-gray-400 group-hover:text-white" />
              <span className="text-[10px] text-gray-500 group-hover:text-gray-300">GitHub Pages</span>
            </a>
          </div>
        </div>
        
        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6">
          Compliant with Instagram Platform Terms • Fair & Transparent Draws
        </p>
      </div>
    </div>
  );
}
