// ============================================================
// ANNOUNCEMENT PAGE - Generate winner announcement
// ============================================================

import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Megaphone, Copy, Check, RefreshCw } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Button } from '../components/ui';
import { generateAnnouncement } from '../utils/exportUtils';

export default function AnnouncementPage() {
  const { giveawayId } = useParams();
  const { state } = useApp();
  const [copied, setCopied] = useState(false);
  const [claimHours, setClaimHours] = useState(48);
  
  const winners = state.winners.filter(w => w.giveaway_id === giveawayId);
  const backups = state.backupWinners.filter(b => b.giveaway_id === giveawayId);
  const giveaway = state.giveaways.find(g => g.id === giveawayId);
  
  const announcement = useMemo(() => {
    return generateAnnouncement(winners, backups, claimHours);
  }, [winners, backups, claimHours]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(announcement);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (winners.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-white">Announcement</h1>
        <Card className="p-12 text-center">
          <Megaphone className="mx-auto text-gray-600 mb-3" size={40} />
          <h3 className="text-lg font-medium text-gray-300">No winners yet</h3>
          <p className="text-sm text-gray-500 mt-1">Run the draw first to generate an announcement</p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Announcement</h1>
          <p className="text-sm text-gray-400">Generate winner announcement for Instagram</p>
        </div>
      </div>
      
      {/* Settings */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Claim Deadline (hours)</label>
            <input
              type="number"
              value={claimHours}
              onChange={e => setClaimHours(Number(e.target.value))}
              className="w-24 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              min={1}
              max={168}
            />
          </div>
          <Button variant="ghost" size="sm" onClick={copyToClipboard}>
            {copied ? <Check size={14} className="mr-1 text-emerald-400" /> : <Copy size={14} className="mr-1" />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </div>
      </Card>
      
      {/* Preview */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-300">Preview</h3>
          <span className="text-xs text-gray-500">{announcement.length} characters</span>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
          <pre className="whitespace-pre-wrap text-sm text-gray-200 font-sans leading-relaxed">
            {announcement}
          </pre>
        </div>
      </Card>
      
      {/* Instagram Caption Format */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">📱 Instagram Caption Format</h3>
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-4 border border-purple-500/20">
          <p className="text-sm text-gray-200 whitespace-pre-wrap">{announcement}</p>
          <div className="mt-4 pt-3 border-t border-gray-700/30">
            <p className="text-xs text-gray-500">
              Suggested hashtags: #giveaway #winners #{giveaway?.target_account_1?.replace('@', '')} #{giveaway?.target_account_2?.replace('@', '')}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
