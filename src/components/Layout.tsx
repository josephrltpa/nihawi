// ============================================================
// LAYOUT - Main app layout with sidebar
// ============================================================

import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, Gift, Users, Shield, Trophy, ScrollText, 
  Megaphone, Settings, LogOut, Menu, X, ChevronRight, Sparkles 
} from 'lucide-react';
import { useApp } from '../store/AppContext';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const { giveawayId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const currentGiveaway = state.giveaways.find(g => g.id === giveawayId);
  
  const mainNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/giveaways', icon: Gift, label: 'Giveaways' },
  ];
  
  const giveawayNav = giveawayId ? [
    { to: `/giveaways/${giveawayId}`, icon: Settings, label: 'Settings' },
    { to: `/giveaways/${giveawayId}/entries`, icon: Users, label: 'Entries' },
    { to: `/giveaways/${giveawayId}/verification`, icon: Shield, label: 'Verification' },
    { to: `/giveaways/${giveawayId}/draw`, icon: Sparkles, label: 'Draw' },
    { to: `/giveaways/${giveawayId}/winners`, icon: Trophy, label: 'Winners' },
    { to: `/giveaways/${giveawayId}/audit-log`, icon: ScrollText, label: 'Audit Log' },
    { to: `/giveaways/${giveawayId}/announcement`, icon: Megaphone, label: 'Announcement' },
  ] : [];
  
  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/giveaways') return location.pathname === '/giveaways';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-300">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="text-pink-500" size={20} />
          <span className="font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
            Nihawi × Jaui
          </span>
        </div>
        <div className="w-6" />
      </div>
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-800">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                  Nihawi × Jaui
                </h1>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider">Giveaway Picker</p>
              </div>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {/* Main nav */}
            {mainNav.map(item => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive(item.to) 
                    ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
            
            {/* Giveaway-specific nav */}
            {currentGiveaway && (
              <>
                <div className="pt-4 pb-2 px-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    {currentGiveaway.name}
                  </p>
                </div>
                {giveawayNav.map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      location.pathname === item.to
                        ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                ))}
              </>
            )}
          </nav>
          
          {/* User info */}
          <div className="p-3 border-t border-gray-800">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                {state.currentUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-200 truncate">{state.currentUser?.name}</p>
                <p className="text-xs text-gray-500">{state.currentUser?.role?.replace('_', ' ')}</p>
              </div>
              <button 
                onClick={() => dispatch({ type: 'LOGOUT' })}
                className="text-gray-500 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
    </div>
  );
}
