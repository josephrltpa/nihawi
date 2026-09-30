// ============================================================
// ENTRY DETAIL PAGE - Full entry view with verification
// ============================================================

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, HelpCircle, AlertTriangle, Save } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Button, StatusBadge, Modal } from '../components/ui';
import { MentionFollowStatus } from '../types';

export default function EntryDetailPage() {
  const { giveawayId, entryId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, getEntryMentions, addAuditLog } = useApp();
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [notes, setNotes] = useState('');
  
  const entry = state.entries.find(e => e.id === entryId);
  const comment = state.comments.find(c => c.id === entry?.comment_id);
  const mentions = getEntryMentions(entryId || '');
  const giveaway = state.giveaways.find(g => g.id === giveawayId);
  
  if (!entry) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Entry not found</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft size={14} className="mr-1" /> Go Back
        </Button>
      </div>
    );
  }
  
  const friendMentions = mentions.filter(m => m.qualifies_as_friend_mention);
  const selfMentions = mentions.filter(m => m.is_self_mention);
  const targetMentions = mentions.filter(m => m.is_target_account_mention);
  
  const handleFollowVerify = (mentionId: string, status: MentionFollowStatus) => {
    dispatch({ type: 'UPDATE_MENTION', payload: { id: mentionId, updates: { 
      follow_verification_status: status,
      verified_by: state.currentUser?.id,
      verified_at: new Date().toISOString(),
    }}});
    addAuditLog('mention_verified', 'mention', mentionId, 'pending', status, `Follow verification for @${entry.entrant_username}`);
    
    // Recalculate entry follow status
    const updatedMentions = mentions.map(m => 
      m.id === mentionId ? { ...m, follow_verification_status: status } : m
    ).filter(m => m.qualifies_as_friend_mention);
    
    const allVerified = updatedMentions.every(m => m.follow_verification_status === 'verified');
    const anyFailed = updatedMentions.some(m => m.follow_verification_status === 'failed');
    
    if (allVerified) {
      dispatch({ type: 'UPDATE_ENTRY', payload: { id: entry.id, updates: { follow_verification_status: 'all_verified' }}});
    } else if (anyFailed) {
      dispatch({ type: 'UPDATE_ENTRY', payload: { id: entry.id, updates: { follow_verification_status: 'failed' }}});
    } else {
      dispatch({ type: 'UPDATE_ENTRY', payload: { id: entry.id, updates: { follow_verification_status: 'partially_verified' }}});
    }
  };
  
  const handleRepostVerify = (status: 'verified' | 'rejected' | 'expired' | 'insufficient_proof') => {
    dispatch({ type: 'UPDATE_ENTRY', payload: { id: entry.id, updates: { repost_verification_status: status }}});
    addAuditLog('repost_verified', 'entry', entry.id, entry.repost_verification_status, status, `Repost verification for @${entry.entrant_username}`);
  };
  
  const handleOverride = () => {
    if (!overrideReason.trim()) return;
    dispatch({ type: 'OVERRIDE_ENTRY', payload: { 
      entryId: entry.id, 
      reason: overrideReason, 
      adminId: state.currentUser?.id || '', 
      adminName: state.currentUser?.name || '' 
    }});
    addAuditLog('eligibility_override', 'entry', entry.id, entry.final_status, 'eligible', overrideReason);
    setShowOverride(false);
    setOverrideReason('');
  };
  
  const handleExclude = () => {
    dispatch({ type: 'UPDATE_ENTRY', payload: { id: entry.id, updates: { final_status: 'excluded' }}});
    addAuditLog('entry_excluded', 'entry', entry.id, entry.final_status, 'excluded', 'Manually excluded');
  };
  
  const handleSaveNotes = () => {
    dispatch({ type: 'UPDATE_ENTRY', payload: { id: entry.id, updates: { admin_notes: notes }}});
    addAuditLog('notes_updated', 'entry', entry.id, '', notes, 'Admin notes updated');
  };
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">@{entry.entrant_username}</h1>
          <p className="text-sm text-gray-400">Entry Detail</p>
        </div>
        <StatusBadge status={entry.final_status} type="final" />
      </div>
      
      {/* Comment */}
      <Card className="p-4">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Comment</h3>
        <p className="text-sm text-gray-200">{comment?.comment_text}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
          <span>Posted: {comment ? new Date(comment.comment_timestamp).toLocaleString() : 'N/A'}</span>
          <span>Source: {comment?.source || 'N/A'}</span>
          {comment?.is_deleted && <span className="text-red-400">⚠️ Deleted</span>}
          {comment?.is_edited && <span className="text-amber-400">⚠️ Edited</span>}
        </div>
      </Card>
      
      {/* Mentions */}
      <Card className="p-4">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Parsed Mentions</h3>
        
        {/* Friend Mentions */}
        <div className="mb-4">
          <p className="text-sm text-gray-300 mb-2">
            Friend Mentions ({friendMentions.length}) — Need {giveaway?.min_required_mentions || 3} minimum
          </p>
          <div className="space-y-2">
            {friendMentions.map(mention => (
              <div key={mention.id} className="flex items-center justify-between p-2.5 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white text-sm">@{mention.username}</span>
                  <StatusBadge status={mention.follow_verification_status} type="follow" />
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleFollowVerify(mention.id, 'verified')}
                    className={`p-1.5 rounded transition-colors ${
                      mention.follow_verification_status === 'verified' 
                        ? 'bg-emerald-500/30 text-emerald-300' 
                        : 'bg-gray-700 text-gray-400 hover:bg-emerald-500/20 hover:text-emerald-400'
                    }`}
                    title="Verified - follows both accounts"
                  >
                    <CheckCircle size={14} />
                  </button>
                  <button
                    onClick={() => handleFollowVerify(mention.id, 'failed')}
                    className={`p-1.5 rounded transition-colors ${
                      mention.follow_verification_status === 'failed' 
                        ? 'bg-red-500/30 text-red-300' 
                        : 'bg-gray-700 text-gray-400 hover:bg-red-500/20 hover:text-red-400'
                    }`}
                    title="Failed - does not follow"
                  >
                    <XCircle size={14} />
                  </button>
                  <button
                    onClick={() => handleFollowVerify(mention.id, 'unable_to_verify')}
                    className={`p-1.5 rounded transition-colors ${
                      mention.follow_verification_status === 'unable_to_verify' 
                        ? 'bg-gray-500/30 text-gray-300' 
                        : 'bg-gray-700 text-gray-400 hover:bg-gray-500/20 hover:text-gray-300'
                    }`}
                    title="Unable to verify"
                  >
                    <HelpCircle size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Other Mentions */}
        {selfMentions.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500">Self mentions (ignored): {selfMentions.map(m => `@${m.username}`).join(', ')}</p>
          </div>
        )}
        {targetMentions.length > 0 && (
          <div>
            <p className="text-xs text-gray-500">Target account mentions (ignored): {targetMentions.map(m => `@${m.username}`).join(', ')}</p>
          </div>
        )}
      </Card>
      
      {/* Status Summary */}
      <Card className="p-4">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Verification Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Mentions</p>
            <p className={`text-sm font-medium ${entry.required_mentions_met ? 'text-emerald-400' : 'text-red-400'}`}>
              {entry.mention_count} found ({entry.required_mentions_met ? '✓ Met' : '✗ Insufficient'})
            </p>
          </div>
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Follow</p>
            <StatusBadge status={entry.follow_verification_status} type="follow" />
          </div>
          <div className="p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Repost</p>
            <StatusBadge status={entry.repost_verification_status} type="repost" />
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Button size="sm" variant="success" onClick={() => handleRepostVerify('verified')}>
            <CheckCircle size={12} className="mr-1" /> Verify Repost
          </Button>
          <Button size="sm" variant="danger" onClick={() => handleRepostVerify('rejected')}>
            <XCircle size={12} className="mr-1" /> Reject Repost
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setShowOverride(true)}>
            <AlertTriangle size={12} className="mr-1" /> Override Eligibility
          </Button>
          <Button size="sm" variant="danger" onClick={handleExclude}>
            Exclude Entry
          </Button>
        </div>
      </Card>
      
      {/* Risk Flags */}
      {entry.risk_flags.length > 0 && (
        <Card className="p-4 border-orange-500/20">
          <h3 className="text-xs font-medium text-orange-400 uppercase tracking-wider mb-2">Risk Flags</h3>
          <div className="flex flex-wrap gap-2">
            {entry.risk_flags.map(flag => (
              <span key={flag} className="px-2 py-1 rounded text-xs bg-orange-500/20 text-orange-400 border border-orange-500/20">
                {flag.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">Risk Score: {entry.risk_score}</p>
        </Card>
      )}
      
      {/* Admin Notes */}
      <Card className="p-4">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Admin Notes</h3>
        <textarea
          value={notes || entry.admin_notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full h-20 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
          placeholder="Add notes about this entry..."
        />
        <Button size="sm" variant="secondary" className="mt-2" onClick={handleSaveNotes}>
          <Save size={12} className="mr-1" /> Save Notes
        </Button>
      </Card>
      
      {/* Override Modal */}
      <Modal isOpen={showOverride} onClose={() => setShowOverride(false)} title="Override Eligibility">
        <div className="space-y-3">
          <p className="text-sm text-gray-400">
            This will mark the entry as eligible regardless of verification status. A reason is required for audit purposes.
          </p>
          <textarea
            value={overrideReason}
            onChange={e => setOverrideReason(e.target.value)}
            className="w-full h-24 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
            placeholder="Reason for override (required)..."
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowOverride(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleOverride} disabled={!overrideReason.trim()}>
              Override
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
