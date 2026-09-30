// ============================================================
// WINNERS PAGE - Winner management
// ============================================================

import React from 'react';
import { useParams } from 'react-router-dom';
import { Trophy, Mail, Check, XCircle, ArrowUp, Download } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Button, StatusBadge } from '../components/ui';
import { exportWinnersCSV } from '../utils/exportUtils';

export default function WinnersPage() {
  const { giveawayId } = useParams();
  const { state, dispatch, addAuditLog } = useApp();
  
  const winners = state.winners.filter(w => w.giveaway_id === giveawayId).sort((a, b) => a.prize_rank - b.prize_rank);
  const backups = state.backupWinners.filter(b => b.giveaway_id === giveawayId);
  
  const handleStatusChange = (winnerId: string, newStatus: 'contacted' | 'claimed' | 'disqualified') => {
    dispatch({ type: 'UPDATE_WINNER', payload: { id: winnerId, updates: { 
      status: newStatus, 
      claimed_at: newStatus === 'claimed' ? new Date().toISOString() : null 
    }}});
    addAuditLog('winner_status_changed', 'winner', winnerId, '', newStatus, `Winner marked as ${newStatus}`);
  };
  
  const promoteBackup = (backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return;
    
    dispatch({ type: 'UPDATE_BACKUP', payload: { id: backupId, updates: { status: 'contacted' }}});
    addAuditLog('backup_promoted', 'backup', backupId, '', 'promoted', `Backup @${backup.entrant_username} promoted`);
  };
  
  const getPrizeIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🎁';
    }
  };
  
  if (winners.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-white">Winners</h1>
        <Card className="p-12 text-center">
          <Trophy className="mx-auto text-gray-600 mb-3" size={40} />
          <h3 className="text-lg font-medium text-gray-300">No winners yet</h3>
          <p className="text-sm text-gray-500 mt-1">Run the draw first to select winners</p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Winners</h1>
          <p className="text-sm text-gray-400">Manage winner status and claims</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => exportWinnersCSV(winners, backups)}>
          <Download size={14} className="mr-1.5" /> Export
        </Button>
      </div>
      
      {/* Winners */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Prize Winners</h3>
        <div className="space-y-3">
          {winners.map((winner, idx) => (
            <div key={winner.id} className={`p-4 rounded-xl border ${
              idx === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-amber-500/5 border-yellow-500/20' :
              idx === 1 ? 'bg-gradient-to-r from-gray-400/10 to-gray-500/5 border-gray-500/20' :
              idx === 2 ? 'bg-gradient-to-r from-amber-700/10 to-amber-800/5 border-amber-700/20' :
              'bg-gradient-to-r from-pink-500/10 to-violet-500/5 border-pink-500/20'
            }`}>
              <div className="flex items-center gap-4">
                <div className="text-3xl">{getPrizeIcon(winner.prize_rank)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-lg">@{winner.entrant_username}</h4>
                    <StatusBadge status={winner.status} type="winner" />
                  </div>
                  <p className="text-sm text-gray-400">{winner.prize_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Selected: {new Date(winner.selected_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-700/30">
                {winner.status === 'selected' && (
                  <>
                    <Button size="sm" variant="secondary" onClick={() => handleStatusChange(winner.id, 'contacted')}>
                      <Mail size={12} className="mr-1" /> Mark Contacted
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleStatusChange(winner.id, 'disqualified')}>
                      <XCircle size={12} className="mr-1" /> Disqualify
                    </Button>
                  </>
                )}
                {winner.status === 'contacted' && (
                  <Button size="sm" variant="success" onClick={() => handleStatusChange(winner.id, 'claimed')}>
                    <Check size={12} className="mr-1" /> Mark Claimed
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Backups */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Backup Winners</h3>
        <div className="space-y-2">
          {backups.map(backup => (
            <div key={backup.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">
                B{backup.backup_rank}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">@{backup.entrant_username}</p>
                <StatusBadge status={backup.status} type="winner" />
              </div>
              <Button size="sm" variant="secondary" onClick={() => promoteBackup(backup.id)}>
                <ArrowUp size={12} className="mr-1" /> Promote
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
