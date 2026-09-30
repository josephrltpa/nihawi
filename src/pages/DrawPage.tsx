// ============================================================
// DRAW PAGE - Winner selection with confetti
// ============================================================

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sparkles, Trophy, Shield, AlertTriangle, Copy, Check, Lock } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Button, StatusBadge } from '../components/ui';
import { runDraw, DrawConfig } from '../utils/winnerSelection';
import confetti from 'canvas-confetti';

export default function DrawPage() {
  const { giveawayId } = useParams();
  const { state, dispatch, getGiveawayEntries, addAuditLog } = useApp();
  const [secretPhrase, setSecretPhrase] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const giveaway = state.giveaways.find(g => g.id === giveawayId);
  const entries = getGiveawayEntries(giveawayId || '');
  const eligibleEntries = entries.filter(e => e.final_status === 'eligible');
  
  const handleDraw = () => {
    if (!giveaway) return;
    
    const config: DrawConfig = {
      giveawayId: giveaway.id,
      adminUserId: state.currentUser?.id || '',
      prizes: giveaway.prizes,
      backupCount: 3,
      allowMultipleEntries: giveaway.allow_multiple_entries_per_user,
      multipleEntryStrategy: 'earliest',
      secretPhrase: secretPhrase || undefined,
    };
    
    const result = runDraw(eligibleEntries, config);
    
    // Update entries to winner/backup status
    result.winners.forEach(w => {
      dispatch({ type: 'UPDATE_ENTRY', payload: { id: w.entry_id, updates: { final_status: 'winner' }}});
    });
    result.backups.forEach(b => {
      dispatch({ type: 'UPDATE_ENTRY', payload: { id: b.entry_id, updates: { final_status: 'backup' }}});
    });
    
    // Save winners
    dispatch({
      type: 'SET_WINNERS',
      payload: {
        winners: result.winners,
        backups: result.backups,
        drawResult: {
          giveaway_id: giveaway.id,
          seed: result.seed,
          nonce: result.nonce,
          timestamp: result.timestamp,
          admin_user_id: state.currentUser?.id || '',
          eligible_entry_count: result.eligibleEntryCount,
          winners: result.winners,
          backups: result.backups,
        },
      },
    });
    
    // Update giveaway status
    dispatch({
      type: 'UPDATE_GIVEAWAY',
      payload: { id: giveaway.id, updates: { status: 'completed', draw_seed: result.seed, draw_nonce: result.nonce } },
    });
    
    addAuditLog('draw_executed', 'giveaway', giveaway.id, '', result.seed, 
      `Draw executed: ${result.winners.length} winners, ${result.backups.length} backups from ${result.eligibleEntryCount} eligible entries`);
    
    setDrawn(true);
    setShowConfirm(false);
    
    // Fire confetti!
    fireConfetti();
  };
  
  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;
    
    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ec4899', '#8b5cf6', '#f59e0b', '#10b981'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ec4899', '#8b5cf6', '#f59e0b', '#10b981'],
      });
      
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
    
    // Big burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#ec4899', '#8b5cf6', '#f59e0b', '#10b981', '#3b82f6'],
      });
    }, 200);
  };
  
  const copySeedInfo = () => {
    if (!state.drawResult) return;
    const text = `Draw Seed: ${state.drawResult.seed}\nNonce: ${state.drawResult.nonce}\nTimestamp: ${state.drawResult.timestamp}\nEligible Entries: ${state.drawResult.eligible_entry_count}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const hasExistingDraw = state.winners.length > 0 && state.winners.some(w => w.giveaway_id === giveawayId);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Winner Draw</h1>
        <p className="text-sm text-gray-400">Select winners using transparent, auditable random selection</p>
      </div>
      
      {/* Pre-draw Info */}
      {!drawn && !hasExistingDraw && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Eligible Entries</p>
              <p className="text-3xl font-bold text-emerald-400 mt-1">{eligibleEntries.length}</p>
              <p className="text-xs text-gray-500 mt-1">of {entries.length} total entries</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Winners Needed</p>
              <p className="text-3xl font-bold text-pink-400 mt-1">{giveaway?.prizes.length || 5}</p>
              <p className="text-xs text-gray-500 mt-1">prizes to assign</p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wider">Backups Needed</p>
              <p className="text-3xl font-bold text-blue-400 mt-1">3</p>
              <p className="text-xs text-gray-500 mt-1">backup winners</p>
            </Card>
          </div>
          
          {eligibleEntries.length < 5 && (
            <Card className="p-4 border-amber-500/20 bg-amber-500/5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-amber-400 mt-0.5" size={18} />
                <div>
                  <h3 className="text-sm font-medium text-amber-300">Insufficient Eligible Entries</h3>
                  <p className="text-xs text-amber-400/70 mt-1">
                    You need at least 5 eligible entries for a full draw. You currently have {eligibleEntries.length}.
                    Consider verifying more entries or adjusting requirements.
                  </p>
                </div>
              </div>
            </Card>
          )}
          
          {/* Secret Phrase */}
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Optional Secret Phrase</h3>
            <p className="text-xs text-gray-500 mb-3">
              Add an extra secret phrase to make the seed even more unpredictable.
            </p>
            <input
              type="text"
              value={secretPhrase}
              onChange={e => setSecretPhrase(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              placeholder="Enter secret phrase (optional)..."
            />
          </Card>
          
          {/* Draw Button */}
          <Card className="p-6 text-center">
            <Sparkles className="mx-auto text-pink-400 mb-3" size={32} />
            <h2 className="text-lg font-bold text-white mb-2">Ready to Draw?</h2>
            <p className="text-sm text-gray-400 mb-4">
              This will randomly select {giveaway?.prizes.length || 5} winners and 3 backups from {eligibleEntries.length} eligible entries.
            </p>
            
            {!showConfirm ? (
              <Button variant="primary" size="lg" onClick={() => setShowConfirm(true)} disabled={eligibleEntries.length === 0}>
                <Sparkles size={18} className="mr-2" /> Run Official Draw
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-amber-400">⚠️ This action cannot be undone without admin override.</p>
                <div className="flex items-center justify-center gap-3">
                  <Button variant="primary" size="lg" onClick={handleDraw}>
                    <Trophy size={18} className="mr-2" /> Confirm Draw
                  </Button>
                  <Button variant="ghost" onClick={() => setShowConfirm(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </Card>
        </>
      )}
      
      {/* Post-draw Results */}
      {(drawn || hasExistingDraw) && state.drawResult && (
        <>
          {/* Confetti Header */}
          <Card className="p-6 text-center bg-gradient-to-br from-pink-500/10 to-violet-600/10 border-pink-500/20">
            <Trophy className="mx-auto text-yellow-400 mb-3" size={40} />
            <h2 className="text-xl font-bold text-white">Draw Complete!</h2>
            <p className="text-sm text-gray-400 mt-1">
              {state.drawResult.winners.length} winners and {state.drawResult.backups.length} backups selected
            </p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={fireConfetti}>
              <Sparkles size={14} className="mr-1" /> Replay Confetti
            </Button>
          </Card>
          
          {/* Winners */}
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">🏆 Winners</h3>
            <div className="space-y-2">
              {state.drawResult.winners
                .sort((a, b) => a.prize_rank - b.prize_rank)
                .map((winner, idx) => (
                  <div key={winner.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      idx === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                      idx === 1 ? 'bg-gray-300/20 text-gray-300' :
                      idx === 2 ? 'bg-amber-700/20 text-amber-600' :
                      'bg-pink-500/20 text-pink-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">@{winner.entrant_username}</p>
                      <p className="text-xs text-gray-500">{winner.prize_name}</p>
                    </div>
                    <StatusBadge status={winner.status} type="winner" />
                  </div>
                ))
              }
            </div>
          </Card>
          
          {/* Backups */}
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">🔄 Backup Winners</h3>
            <div className="space-y-2">
              {state.drawResult.backups.map((backup, idx) => (
                <div key={backup.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold">
                    B{idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">@{backup.entrant_username}</p>
                    <p className="text-xs text-gray-500">Backup #{backup.backup_rank}</p>
                  </div>
                  <StatusBadge status={backup.status} type="winner" />
                </div>
              ))}
            </div>
          </Card>
          
          {/* Audit Info */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">🔐 Draw Audit Information</h3>
              <Button size="sm" variant="ghost" onClick={copySeedInfo}>
                {copied ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-gray-800">
                <span className="text-gray-500">Seed</span>
                <span className="text-gray-300 font-mono">{state.drawResult.seed}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-800">
                <span className="text-gray-500">Nonce</span>
                <span className="text-gray-300 font-mono">{state.drawResult.nonce}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-800">
                <span className="text-gray-500">Timestamp</span>
                <span className="text-gray-300">{new Date(state.drawResult.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-800">
                <span className="text-gray-500">Eligible Entries</span>
                <span className="text-gray-300">{state.drawResult.eligible_entry_count}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Admin</span>
                <span className="text-gray-300">{state.currentUser?.name}</span>
              </div>
            </div>
          </Card>
          
          {/* Locked notice */}
          <Card className="p-3 border-amber-500/20 bg-amber-500/5">
            <div className="flex items-center gap-2">
              <Lock className="text-amber-400" size={16} />
              <p className="text-xs text-amber-300">
                Giveaway is now locked. Contacting winners and managing claims can be done from the Winners page.
              </p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
