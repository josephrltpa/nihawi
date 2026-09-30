// ============================================================
// VERIFICATION PAGE - Review queue for follow & repost
// ============================================================

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, HelpCircle, Clock, ArrowRight, ArrowLeft, Shield, Camera } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Button, StatusBadge } from '../components/ui';
import { Entry, MentionFollowStatus } from '../types';

type Tab = 'follow' | 'repost' | 'flagged' | 'duplicates';

export default function VerificationPage() {
  const { giveawayId } = useParams();
  const { state, dispatch, getGiveawayEntries, getEntryMentions, addAuditLog } = useApp();
  const [tab, setTab] = useState<Tab>('follow');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const entries = getGiveawayEntries(giveawayId || '');
  const giveaway = state.giveaways.find(g => g.id === giveawayId);
  
  const followQueue = entries.filter(e => 
    e.follow_verification_status === 'pending' || e.follow_verification_status === 'partially_verified'
  );
  const repostQueue = entries.filter(e => e.repost_verification_status === 'pending');
  const flaggedQueue = entries.filter(e => e.risk_flags.length > 0);
  const duplicateQueue = entries.filter(e => e.duplicate_status !== 'unique');
  
  const currentQueue = tab === 'follow' ? followQueue : tab === 'repost' ? repostQueue : tab === 'flagged' ? flaggedQueue : duplicateQueue;
  const currentEntry = currentQueue[currentIndex];
  
  const handleFollowVerification = (entryId: string, mentionId: string, status: MentionFollowStatus) => {
    dispatch({ type: 'UPDATE_MENTION', payload: { id: mentionId, updates: { 
      follow_verification_status: status, 
      verified_by: state.currentUser?.id, 
      verified_at: new Date().toISOString() 
    }}});
    addAuditLog('mention_verified', 'mention', mentionId, 'pending', status, `Follow verification for entry ${entryId}`);
    
    // Check if all mentions are now verified
    const entryMentions = state.mentions.filter(m => m.entry_id === entryId && m.qualifies_as_friend_mention);
    const updatedMentions = entryMentions.map(m => 
      m.id === mentionId ? { ...m, follow_verification_status: status } : m
    );
    const allVerified = updatedMentions.every(m => m.follow_verification_status === 'verified');
    const anyFailed = updatedMentions.some(m => m.follow_verification_status === 'failed');
    
    if (allVerified) {
      dispatch({ type: 'UPDATE_ENTRY', payload: { id: entryId, updates: { follow_verification_status: 'all_verified' }}});
    } else if (anyFailed) {
      dispatch({ type: 'UPDATE_ENTRY', payload: { id: entryId, updates: { follow_verification_status: 'failed' }}});
    } else {
      dispatch({ type: 'UPDATE_ENTRY', payload: { id: entryId, updates: { follow_verification_status: 'partially_verified' }}});
    }
  };
  
  const handleRepostVerification = (entryId: string, status: 'verified' | 'rejected' | 'expired' | 'insufficient_proof') => {
    dispatch({ type: 'UPDATE_ENTRY', payload: { id: entryId, updates: { repost_verification_status: status }}});
    addAuditLog('repost_verified', 'entry', entryId, 'pending', status, `Repost verification`);
    if (currentIndex < currentQueue.length - 1) setCurrentIndex(currentIndex + 1);
  };
  
  const markAllFriendsFollowing = (entryId: string) => {
    const entryMentions = state.mentions.filter(m => m.entry_id === entryId && m.qualifies_as_friend_mention);
    entryMentions.forEach(m => {
      dispatch({ type: 'UPDATE_MENTION', payload: { id: m.id, updates: { 
        follow_verification_status: 'verified', 
        verified_by: state.currentUser?.id, 
        verified_at: new Date().toISOString() 
      }}});
    });
    dispatch({ type: 'UPDATE_ENTRY', payload: { id: entryId, updates: { follow_verification_status: 'all_verified' }}});
    addAuditLog('bulk_follow_verified', 'entry', entryId, 'pending', 'all_verified', 'All friends marked as following');
    if (currentIndex < currentQueue.length - 1) setCurrentIndex(currentIndex + 1);
    else setCurrentIndex(Math.max(0, currentIndex - 1));
  };
  
  const tabs: { value: Tab; label: string; count: number; icon: React.ReactNode }[] = [
    { value: 'follow', label: 'Follow Verification', count: followQueue.length, icon: <Shield size={14} /> },
    { value: 'repost', label: 'Repost Verification', count: repostQueue.length, icon: <Camera size={14} /> },
    { value: 'flagged', label: 'Flagged', count: flaggedQueue.length, icon: <Clock size={14} /> },
    { value: 'duplicates', label: 'Duplicates', count: duplicateQueue.length, icon: <HelpCircle size={14} /> },
  ];
  
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Verification Queue</h1>
        <p className="text-sm text-gray-400">Review and verify entry requirements</p>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(t => (
          <button
            key={t.value}
            onClick={() => { setTab(t.value); setCurrentIndex(0); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              tab === t.value
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}
          >
            {t.icon} {t.label} ({t.count})
          </button>
        ))}
      </div>
      
      {/* Queue Content */}
      {currentQueue.length === 0 ? (
        <Card className="p-12 text-center">
          <CheckCircle className="mx-auto text-emerald-400 mb-3" size={40} />
          <h3 className="text-lg font-medium text-gray-300">All caught up!</h3>
          <p className="text-sm text-gray-500 mt-1">No entries pending in this queue</p>
        </Card>
      ) : currentEntry && (
        <Card className="p-4">
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-500">
              {currentIndex + 1} of {currentQueue.length}
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30"
              >
                <ArrowLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentIndex(Math.min(currentQueue.length - 1, currentIndex + 1))}
                disabled={currentIndex === currentQueue.length - 1}
                className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-30"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-1 mb-4">
            <div 
              className="bg-gradient-to-r from-pink-500 to-violet-500 h-1 rounded-full transition-all"
              style={{ width: `${((currentIndex + 1) / currentQueue.length) * 100}%` }}
            />
          </div>
          
          {/* Entry Info */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-white">@{currentEntry.entrant_username}</span>
              <StatusBadge status={currentEntry.final_status} type="final" />
            </div>
            <p className="text-sm text-gray-400">
              {state.comments.find(c => c.id === currentEntry.comment_id)?.comment_text}
            </p>
            {currentEntry.risk_flags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {currentEntry.risk_flags.map(flag => (
                  <span key={flag} className="px-2 py-0.5 rounded text-xs bg-orange-500/20 text-orange-400">
                    {flag.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Follow Verification Tab */}
          {tab === 'follow' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-300">Required Friend Mentions</h3>
                <Button size="sm" variant="success" onClick={() => markAllFriendsFollowing(currentEntry.id)}>
                  <CheckCircle size={12} className="mr-1" /> Mark All Following
                </Button>
              </div>
              
              {state.mentions
                .filter(m => m.entry_id === currentEntry.id && m.qualifies_as_friend_mention)
                .map(mention => (
                  <div key={mention.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <div>
                      <span className="font-medium text-white">@{mention.username}</span>
                      <StatusBadge status={mention.follow_verification_status} type="follow" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleFollowVerification(currentEntry.id, mention.id, 'verified')}
                        className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                        title="Verified - follows both"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleFollowVerification(currentEntry.id, mention.id, 'failed')}
                        className="p-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        title="Failed - does not follow"
                      >
                        <XCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleFollowVerification(currentEntry.id, mention.id, 'unable_to_verify')}
                        className="p-1.5 rounded bg-gray-500/20 text-gray-400 hover:bg-gray-500/30"
                        title="Unable to verify"
                      >
                        <HelpCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))
              }
              
              <div className="pt-3 border-t border-gray-700/50">
                <p className="text-xs text-gray-500">
                  Target accounts: {giveaway?.target_account_1} and {giveaway?.target_account_2}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Each mentioned friend must follow BOTH target accounts.
                </p>
              </div>
            </div>
          )}
          
          {/* Repost Verification Tab */}
          {tab === 'repost' && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300">Repost Proof Checklist</h3>
              
              <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 space-y-2">
                <p className="text-xs text-gray-400">Verify the following:</p>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" className="rounded border-gray-600 bg-gray-800 text-pink-500" />
                  Username visible in story
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" className="rounded border-gray-600 bg-gray-800 text-pink-500" />
                  Giveaway reel visible
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" className="rounded border-gray-600 bg-gray-800 text-pink-500" />
                  Timestamp/date visible or story active
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" className="rounded border-gray-600 bg-gray-800 text-pink-500" />
                  Looks genuine (not photoshopped)
                </label>
              </div>
              
              <div className="flex flex-wrap gap-2 pt-2">
                <Button variant="success" onClick={() => handleRepostVerification(currentEntry.id, 'verified')}>
                  <CheckCircle size={14} className="mr-1.5" /> Verify Repost
                </Button>
                <Button variant="danger" onClick={() => handleRepostVerification(currentEntry.id, 'rejected')}>
                  <XCircle size={14} className="mr-1.5" /> Reject
                </Button>
                <Button variant="secondary" onClick={() => handleRepostVerification(currentEntry.id, 'expired')}>
                  <Clock size={14} className="mr-1.5" /> Mark Expired
                </Button>
                <Button variant="secondary" onClick={() => handleRepostVerification(currentEntry.id, 'insufficient_proof')}>
                  Insufficient Proof
                </Button>
              </div>
              
              <div className="pt-3 border-t border-gray-700/50">
                <p className="text-xs text-gray-500">
                  Deadline: {giveaway ? new Date(giveaway.repost_proof_deadline).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          )}
          
          {/* Flagged Tab */}
          {tab === 'flagged' && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300">Risk Flags</h3>
              <div className="space-y-2">
                {currentEntry.risk_flags.map(flag => (
                  <div key={flag} className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <span className="text-orange-400 text-sm">{flag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="danger" size="sm" onClick={() => {
                  dispatch({ type: 'UPDATE_ENTRY', payload: { id: currentEntry.id, updates: { final_status: 'excluded' }}});
                  if (currentIndex < currentQueue.length - 1) setCurrentIndex(currentIndex + 1);
                }}>
                  Exclude Entry
                </Button>
                <Button variant="success" size="sm" onClick={() => {
                  dispatch({ type: 'UPDATE_ENTRY', payload: { id: currentEntry.id, updates: { risk_flags: [], risk_score: 0 }}});
                  if (currentIndex < currentQueue.length - 1) setCurrentIndex(currentIndex + 1);
                }}>
                  Clear Flags
                </Button>
              </div>
            </div>
          )}
          
          {/* Duplicates Tab */}
          {tab === 'duplicates' && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-300">Duplicate Detection</h3>
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-300">
                  This user has <span className="text-amber-400 font-medium">{currentEntry.duplicate_status}</span> status.
                </p>
                {entries.filter(e => e.entrant_username === currentEntry.entrant_username).length > 1 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Found {entries.filter(e => e.entrant_username === currentEntry.entrant_username).length} entries from this user
                  </p>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                <Button variant="danger" size="sm" onClick={() => {
                  dispatch({ type: 'UPDATE_ENTRY', payload: { id: currentEntry.id, updates: { final_status: 'excluded' }}});
                  if (currentIndex < currentQueue.length - 1) setCurrentIndex(currentIndex + 1);
                }}>
                  Exclude
                </Button>
                <Button variant="success" size="sm" onClick={() => {
                  dispatch({ type: 'UPDATE_ENTRY', payload: { id: currentEntry.id, updates: { duplicate_status: 'unique' }}});
                  if (currentIndex < currentQueue.length - 1) setCurrentIndex(currentIndex + 1);
                }}>
                  Mark as Unique
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
