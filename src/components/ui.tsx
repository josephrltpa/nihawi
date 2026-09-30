// ============================================================
// UI COMPONENTS - Reusable components
// ============================================================

import React, { ReactNode } from 'react';
import { FinalStatus, FollowStatus, RepostStatus, DuplicateStatus, WinnerStatus } from '../types';

// Status Badge
export function StatusBadge({ status, type }: { status: string; type: 'final' | 'follow' | 'repost' | 'duplicate' | 'winner' }) {
  const getColor = () => {
    if (type === 'final') {
      switch (status as FinalStatus) {
        case 'eligible': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        case 'ineligible': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'excluded': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        case 'winner': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'backup': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      }
    }
    if (type === 'follow') {
      switch (status as FollowStatus) {
        case 'all_verified': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'partially_verified': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'unable_to_verify': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      }
    }
    if (type === 'repost') {
      switch (status as RepostStatus) {
        case 'verified': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'expired': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        case 'insufficient_proof': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      }
    }
    if (type === 'duplicate') {
      switch (status as DuplicateStatus) {
        case 'unique': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case 'duplicate': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'suspected_duplicate': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      }
    }
    if (type === 'winner') {
      switch (status as WinnerStatus) {
        case 'selected': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'contacted': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
        case 'claimed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
        case 'disqualified': return 'bg-red-500/20 text-red-400 border-red-500/30';
        default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      }
    }
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const formatStatus = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getColor()}`}>
      {formatStatus(status)}
    </span>
  );
}

// Card Component
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

// Button Component
export function Button({ 
  children, onClick, variant = 'primary', size = 'md', disabled = false, className = '', type = 'button'
}: { 
  children: ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success'; 
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900';
  
  const variants = {
    primary: 'bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white shadow-lg shadow-pink-500/20 focus:ring-pink-500',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    ghost: 'bg-transparent hover:bg-gray-700/50 text-gray-300 focus:ring-gray-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
}

// Stat Card
export function StatCard({ title, value, icon, color = 'pink' }: { title: string; value: string | number; icon: ReactNode; color?: string }) {
  const colorMap: Record<string, string> = {
    pink: 'from-pink-500/20 to-pink-600/5 border-pink-500/20',
    violet: 'from-violet-500/20 to-violet-600/5 border-violet-500/20',
    amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/20',
    emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
    red: 'from-red-500/20 to-red-600/5 border-red-500/20',
    yellow: 'from-yellow-500/20 to-yellow-600/5 border-yellow-500/20',
  };
  
  return (
    <Card className={`p-4 bg-gradient-to-br ${colorMap[color] || colorMap.pink}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </Card>
  );
}

// Toast notification
export function Toast({ message, type = 'success', onClose }: { message: string; type?: 'success' | 'error' | 'info'; onClose: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const colors = {
    success: 'bg-emerald-600 border-emerald-500',
    error: 'bg-red-600 border-red-500',
    info: 'bg-blue-600 border-blue-500',
  };
  
  return (
    <div className={`fixed top-4 right-4 z-50 ${colors[type]} border rounded-lg px-4 py-3 text-white shadow-xl animate-slide-in`}>
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button onClick={onClose} className="text-white/70 hover:text-white">✕</button>
      </div>
    </div>
  );
}

// Modal
export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// Skeleton Loader
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-700/50 rounded ${className}`} />;
}

// Empty State
export function EmptyState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-gray-500 mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-300">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
}
