// ============================================================
// GIVEAWAY SETTINGS PAGE
// ============================================================

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Upload, FileText, AlertCircle } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Card, Button } from '../components/ui';
import { parseMentions } from '../utils/mentionParser';
import { parseCSV } from '../utils/exportUtils';
import { v4 as uuidv4 } from 'uuid';
import { GiveawayStatus } from '../types';

export default function GiveawaySettingsPage() {
  const { giveawayId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, addAuditLog } = useApp();
  
  const giveaway = state.giveaways.find(g => g.id === giveawayId);
  const [importMode, setImportMode] = useState<'csv' | 'manual'>('csv');
  const [csvText, setCsvText] = useState('');
  const [manualUsername, setManualUsername] = useState('');
  const [manualComment, setManualComment] = useState('');
  const [importResult, setImportResult] = useState<string | null>(null);
  
  if (!giveaway) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Giveaway not found</p>
      </div>
    );
  }
  
  const handleCSVImport = () => {
    if (!csvText.trim()) return;
    
    const rows = parseCSV(csvText);
    const newComments = [];
    const newEntries = [];
    const newMentions = [];
    let skipped = 0;
    
    for (const row of rows) {
      const username = row.username || row.entrant_username || '';
      const commentText = row.comment_text || row.text || '';
      const timestamp = row.timestamp || row.comment_timestamp || new Date().toISOString();
      const commentId = row.comment_id || `imported-${uuidv4()}`;
      
      if (!username || !commentText) {
        skipped++;
        continue;
      }
      
      // Check for duplicate
      const existingComment = state.comments.find(c => 
        c.entrant_username === username && c.comment_text === commentText && c.giveaway_id === giveawayId
      );
      if (existingComment) {
        skipped++;
        continue;
      }
      
      const commentRecord = {
        id: uuidv4(),
        giveaway_id: giveawayId!,
        instagram_comment_id: commentId,
        entrant_username: username,
        entrant_instagram_id: `imported_${username}`,
        comment_text: commentText,
        comment_timestamp: timestamp,
        source: 'csv' as const,
        raw_payload: JSON.stringify(row),
        is_deleted: false,
        is_edited: false,
        imported_at: new Date().toISOString(),
      };
      newComments.push(commentRecord);
      
      // Parse mentions
      const parsed = parseMentions(
        commentText, 
        username, 
        [giveaway.target_account_1.replace('@', ''), giveaway.target_account_2.replace('@', '')],
        giveaway.min_required_mentions
      );
      
      const entryRecord = {
        id: uuidv4(),
        giveaway_id: giveawayId!,
        comment_id: commentRecord.id,
        entrant_username: username,
        entrant_instagram_id: `imported_${username}`,
        mention_count: parsed.uniqueMentions.length,
        required_mentions_met: parsed.minRequiredMet,
        follow_verification_status: 'pending' as const,
        repost_verification_status: 'pending' as const,
        duplicate_status: 'unique' as const,
        risk_score: 0,
        final_status: 'pending' as const,
        admin_notes: '',
        risk_flags: [] as string[],
        created_at: timestamp,
        updated_at: new Date().toISOString(),
      };
      newEntries.push(entryRecord);
      
      // Create mention records
      parsed.parsedMentions.forEach(pm => {
        newMentions.push({
          id: uuidv4(),
          entry_id: entryRecord.id,
          username: pm.username,
          is_self_mention: pm.isSelfMention,
          is_target_account_mention: pm.isTargetAccountMention,
          qualifies_as_friend_mention: pm.qualifiesAsFriendMention,
          follow_verification_status: 'pending' as const,
          verified_by: null,
          verified_at: null,
          notes: '',
        });
      });
    }
    
    dispatch({ type: 'ADD_COMMENTS', payload: newComments });
    dispatch({ type: 'ADD_ENTRIES', payload: newEntries });
    addAuditLog('comments_imported', 'comments', giveawayId!, '', String(newComments.length), `CSV import: ${newComments.length} comments, ${skipped} skipped`);
    
    setImportResult(`✅ Imported ${newComments.length} comments (${skipped} skipped as duplicates)`);
    setCsvText('');
    
    // Update giveaway status
    if (giveaway.status === 'draft') {
      dispatch({ type: 'UPDATE_GIVEAWAY', payload: { id: giveawayId!, updates: { status: 'reviewing' as GiveawayStatus }}});
    }
  };
  
  const handleManualEntry = () => {
    if (!manualUsername || !manualComment) return;
    
    const commentId = uuidv4();
    const entryId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const comment = {
      id: commentId,
      giveaway_id: giveawayId!,
      instagram_comment_id: `manual-${uuidv4()}`,
      entrant_username: manualUsername,
      entrant_instagram_id: `manual_${manualUsername}`,
      comment_text: manualComment,
      comment_timestamp: timestamp,
      source: 'manual' as const,
      raw_payload: JSON.stringify({ username: manualUsername, text: manualComment }),
      is_deleted: false,
      is_edited: false,
      imported_at: timestamp,
    };
    
    const parsed = parseMentions(
      manualComment,
      manualUsername,
      [giveaway.target_account_1.replace('@', ''), giveaway.target_account_2.replace('@', '')],
      giveaway.min_required_mentions
    );
    
    const entry = {
      id: entryId,
      giveaway_id: giveawayId!,
      comment_id: commentId,
      entrant_username: manualUsername,
      entrant_instagram_id: `manual_${manualUsername}`,
      mention_count: parsed.uniqueMentions.length,
      required_mentions_met: parsed.minRequiredMet,
      follow_verification_status: 'pending' as const,
      repost_verification_status: 'pending' as const,
      duplicate_status: 'unique' as const,
      risk_score: 0,
      final_status: 'pending' as const,
      admin_notes: '',
      risk_flags: [] as string[],
      created_at: timestamp,
      updated_at: timestamp,
    };
    
    dispatch({ type: 'ADD_COMMENTS', payload: [comment] });
    dispatch({ type: 'ADD_ENTRIES', payload: [entry] });
    addAuditLog('comment_added', 'comment', commentId, '', manualUsername, `Manual entry added`);
    
    setManualUsername('');
    setManualComment('');
    setImportResult(`✅ Entry added for @${manualUsername}`);
  };
  
  const updateSetting = (key: string, value: unknown) => {
    dispatch({ type: 'UPDATE_GIVEAWAY', payload: { id: giveawayId!, updates: { [key]: value }}});
    addAuditLog('setting_changed', 'giveaway', giveawayId!, '', `${key}=${value}`, `Setting updated`);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Giveaway Settings</h1>
        <p className="text-sm text-gray-400">{giveaway.name}</p>
      </div>
      
      {/* Basic Settings */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Giveaway Name</label>
            <input
              type="text"
              defaultValue={giveaway.name}
              onBlur={e => updateSetting('name', e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
            <select
              value={giveaway.status}
              onChange={e => updateSetting('status', e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            >
              <option value="draft">Draft</option>
              <option value="importing">Importing</option>
              <option value="reviewing">Reviewing</option>
              <option value="ready_for_draw">Ready for Draw</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Target Account 1</label>
            <input
              type="text"
              defaultValue={giveaway.target_account_1}
              onBlur={e => updateSetting('target_account_1', e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Target Account 2</label>
            <input
              type="text"
              defaultValue={giveaway.target_account_2}
              onBlur={e => updateSetting('target_account_2', e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Min Required Mentions</label>
            <input
              type="number"
              defaultValue={giveaway.min_required_mentions}
              onBlur={e => updateSetting('min_required_mentions', Number(e.target.value))}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              min={1}
              max={10}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Instagram Post URL</label>
            <input
              type="url"
              defaultValue={giveaway.instagram_post_url}
              onBlur={e => updateSetting('instagram_post_url', e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mt-4">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              defaultChecked={giveaway.strict_mention_mode}
              onChange={e => updateSetting('strict_mention_mode', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-pink-500"
            />
            Strict mention mode (verify ALL mentions)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              defaultChecked={giveaway.allow_multiple_entries_per_user}
              onChange={e => updateSetting('allow_multiple_entries_per_user', e.target.checked)}
              className="rounded border-gray-600 bg-gray-800 text-pink-500"
            />
            Allow multiple entries per user
          </label>
        </div>
      </Card>
      
      {/* Import Section */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-4">Import Comments</h3>
        
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setImportMode('csv')}
            className={`px-3 py-1.5 rounded-lg text-sm ${importMode === 'csv' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
          >
            <FileText size={14} className="inline mr-1.5" /> CSV Import
          </button>
          <button
            onClick={() => setImportMode('manual')}
            className={`px-3 py-1.5 rounded-lg text-sm ${importMode === 'manual' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-gray-800 text-gray-400 border border-gray-700'}`}
          >
            Manual Entry
          </button>
        </div>
        
        {importMode === 'csv' && (
          <div className="space-y-3">
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <p className="text-xs text-gray-400 mb-2">
                CSV format: <code className="text-pink-400">username,comment_text,timestamp,comment_id</code>
              </p>
              <p className="text-xs text-gray-500">
                Paste CSV data below. The first row should be headers.
              </p>
            </div>
            <textarea
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
              placeholder="username,comment_text,timestamp,comment_id&#10;john_doe,@friend1 @friend2 @friend3 great!,2024-01-15T10:30:00Z,c123"
            />
            <Button variant="primary" onClick={handleCSVImport}>
              <Upload size={14} className="mr-1.5" /> Import CSV
            </Button>
          </div>
        )}
        
        {importMode === 'manual' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Username</label>
                <input
                  type="text"
                  value={manualUsername}
                  onChange={e => setManualUsername(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Comment Text</label>
                <input
                  type="text"
                  value={manualComment}
                  onChange={e => setManualComment(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  placeholder="@friend1 @friend2 @friend3 ..."
                />
              </div>
            </div>
            <Button variant="primary" onClick={handleManualEntry}>
              Add Entry
            </Button>
          </div>
        )}
        
        {importResult && (
          <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-sm text-emerald-400">{importResult}</p>
          </div>
        )}
      </Card>
      
      {/* Compliance Notice */}
      <Card className="p-4 border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-amber-400 mt-0.5 shrink-0" size={18} />
          <div>
            <h3 className="text-sm font-medium text-amber-300">Instagram Compliance</h3>
            <p className="text-xs text-amber-400/70 mt-1">
              This tool only processes comments from posts you own or have authorized access to. 
              It does not scrape Instagram, access private data, or violate platform terms. 
              Follow and repost verification requires manual admin review.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
