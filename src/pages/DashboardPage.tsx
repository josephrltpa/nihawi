// ============================================================
// DASHBOARD PAGE
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CheckCircle, Clock, AlertTriangle, Trophy, 
  Download, Upload, Eye, Sparkles, Gift, ArrowRight 
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, StatCard, Button } from '../components/ui';

export default function DashboardPage() {
  const { state } = useApp();
  const navigate = useNavigate();
  
  const currentGiveaway = state.giveaways[0];
  if (!currentGiveaway) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">No giveaways found. Create one to get started.</p>
      </div>
    );
  }
  
  const giveawayEntries = state.entries.filter(e => e.giveaway_id === currentGiveaway.id);
  const totalComments = state.comments.filter(c => c.giveaway_id === currentGiveaway.id).length;
  const eligibleEntries = giveawayEntries.filter(e => e.final_status === 'eligible').length;
  const pendingFollow = giveawayEntries.filter(e => e.follow_verification_status === 'pending' || e.follow_verification_status === 'partially_verified').length;
  const pendingRepost = giveawayEntries.filter(e => e.repost_verification_status === 'pending').length;
  const flaggedEntries = giveawayEntries.filter(e => e.risk_flags.length > 0).length;
  const winners = state.winners.filter(w => w.giveaway_id === currentGiveaway.id).length;
  const backups = state.backupWinners.filter(b => b.giveaway_id === currentGiveaway.id).length;
  
  const stats = [
    { title: 'Total Comments', value: totalComments, icon: <Users size={20} />, color: 'pink' },
    { title: 'Total Entries', value: giveawayEntries.length, icon: <Gift size={20} />, color: 'violet' },
    { title: 'Eligible', value: eligibleEntries, icon: <CheckCircle size={20} />, color: 'emerald' },
    { title: 'Pending Follow', value: pendingFollow, icon: <Clock size={20} />, color: 'amber' },
    { title: 'Pending Repost', value: pendingRepost, icon: <Clock size={20} />, color: 'blue' },
    { title: 'Flagged', value: flaggedEntries, icon: <AlertTriangle size={20} />, color: 'red' },
    { title: 'Winners', value: winners, icon: <Trophy size={20} />, color: 'yellow' },
    { title: 'Backups', value: backups, icon: <Eye size={20} />, color: 'blue' },
  ];
  
  const quickActions = [
    { label: 'Review Entries', icon: <Users size={18} />, to: `/giveaways/${currentGiveaway.id}/entries`, color: 'from-pink-500 to-rose-600' },
    { label: 'Verification Queue', icon: <Shield size={18} />, to: `/giveaways/${currentGiveaway.id}/verification`, color: 'from-violet-500 to-purple-600' },
    { label: 'Run Draw', icon: <Sparkles size={18} />, to: `/giveaways/${currentGiveaway.id}/draw`, color: 'from-amber-500 to-orange-600' },
    { label: 'View Winners', icon: <Trophy size={18} />, to: `/giveaways/${currentGiveaway.id}/winners`, color: 'from-emerald-500 to-green-600' },
  ];
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            {currentGiveaway.name} • {currentGiveaway.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => navigate(`/giveaways/${currentGiveaway.id}/entries`)}>
            <Upload size={14} className="mr-1.5" /> Import
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate(`/giveaways/${currentGiveaway.id}/draw`)}>
            <Sparkles size={14} className="mr-1.5" /> Run Draw
          </Button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(stat => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      
      {/* Quick Actions */}
      <Card className="p-4">
        <h2 className="text-sm font-medium text-gray-300 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map(action => (
            <button
              key={action.label}
              onClick={() => navigate(action.to)}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-all group"
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg`}>
                {action.icon}
              </div>
              <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{action.label}</span>
              <ArrowRight size={14} className="ml-auto text-gray-600 group-hover:text-gray-400 transition-colors" />
            </button>
          ))}
        </div>
      </Card>
      
      {/* Recent Activity */}
      <Card className="p-4">
        <h2 className="text-sm font-medium text-gray-300 mb-3">Recent Activity</h2>
        <div className="space-y-2">
          {state.auditLogs.slice(0, 5).map(log => (
            <div key={log.id} className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-800/30">
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-300 truncate">
                  <span className="font-medium">{log.admin_name}</span> {log.action.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-gray-500">{log.reason}</p>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(log.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Giveaway Reel Link */}
      {currentGiveaway.instagram_post_url && (
        <Card className="p-4 border-pink-500/20 bg-gradient-to-r from-pink-500/5 to-violet-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Giveaway Reel</h3>
                <a 
                  href={currentGiveaway.instagram_post_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-pink-400 hover:underline"
                >
                  {currentGiveaway.instagram_post_url}
                </a>
              </div>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/giveaways/${currentGiveaway.id}/import-guide`)}>
              <Upload size={14} className="mr-1.5" /> Import Comments
            </Button>
          </div>
        </Card>
      )}
      
      {/* Compliance Notice */}
      <Card className="p-4 border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-amber-400 mt-0.5" size={18} />
          <div>
            <h3 className="text-sm font-medium text-amber-300">Compliance Notice</h3>
            <p className="text-xs text-amber-400/70 mt-1">
              This tool assists with giveaway administration. The admin is responsible for complying with 
              Instagram Platform Terms, local giveaway/sweepstakes laws, and ensuring fair practices. 
              Follow and repost verifications require manual review as they cannot be automatically verified 
              through official APIs.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Shield(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
