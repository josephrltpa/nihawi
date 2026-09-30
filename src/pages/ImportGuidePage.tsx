// ============================================================
// IMPORT GUIDE PAGE - How to get comments from your reel
// ============================================================

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Copy, Check, FileText, Instagram, AlertCircle, Zap, ExternalLink, Key } from 'lucide-react';
import { Card, Button, Modal } from '../components/ui';
import { useApp } from '../store/AppContext';
import { fetchInstagramComments, commentsToCSV, getMediaIdFromUrl, INSTAGRAM_API_SETUP_GUIDE } from '../utils/instagramAPI';
import { parseMentions } from '../utils/mentionParser';
import { v4 as uuidv4 } from 'uuid';

export default function ImportGuidePage() {
  const { giveawayId } = useParams();
  const navigate = useNavigate();
  const { state, dispatch, addAuditLog } = useApp();
  const [copied, setCopied] = useState<string | null>(null);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const [showApiImport, setShowApiImport] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [mediaId, setMediaId] = useState('');
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [fetchSuccess, setFetchSuccess] = useState('');
  
  const giveaway = state.giveaways.find(g => g.id === giveawayId);
  
  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };
  
  const csvTemplate = `username,comment_text,timestamp,comment_id
user1,"@friend1 @friend2 @friend3 great giveaway!",2024-01-15T10:30:00Z,c001
user2,"@bestie1 @bestie2 @bestie3 @nihawi_puan @jauigiggles need this!",2024-01-15T10:31:00Z,c002
user3,"@pal_one @pal_two @pal_three lets go!",2024-01-15T10:32:00Z,c003`;

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'comments_template.csv';
    link.click();
  };
  
  const handleApiFetch = async () => {
    if (!accessToken || !mediaId) {
      setFetchError('Please enter both Access Token and Media ID');
      return;
    }
    
    setFetching(true);
    setFetchError('');
    setFetchSuccess('');
    
    try {
      const comments = await fetchInstagramComments({ accessToken, mediaId });
      
      if (comments.length === 0) {
        setFetchError('No comments found. Check your Media ID and Access Token.');
        setFetching(false);
        return;
      }
      
      // Convert to app format and import
      const targetAccounts = [
        giveaway?.target_account_1?.replace('@', '') || 'nihawi_puan',
        giveaway?.target_account_2?.replace('@', '') || 'jauigiggles'
      ];
      
      const newComments: any[] = [];
      const newEntries: any[] = [];
      const newMentions: any[] = [];
      let duplicates = 0;
      
      for (const comment of comments) {
        // Check for duplicate
        const existing = state.comments.find(c => 
          c.entrant_username === comment.username && 
          c.comment_text === comment.text && 
          c.giveaway_id === giveawayId
        );
        if (existing) {
          duplicates++;
          continue;
        }
        
        const commentId = uuidv4();
        const entryId = uuidv4();
        
        const commentRecord = {
          id: commentId,
          giveaway_id: giveawayId!,
          instagram_comment_id: comment.id,
          entrant_username: comment.username,
          entrant_instagram_id: comment.username,
          comment_text: comment.text,
          comment_timestamp: comment.timestamp,
          source: 'api' as const,
          raw_payload: JSON.stringify(comment),
          is_deleted: false,
          is_edited: false,
          imported_at: new Date().toISOString(),
        };
        newComments.push(commentRecord);
        
        // Parse mentions
        const parsed = parseMentions(comment.text, comment.username, targetAccounts, giveaway?.min_required_mentions || 3);
        
        const riskFlags: string[] = [];
        if (/^[a-z]+[0-9]{5,}$/.test(comment.username) || /^[0-9]+[a-z]+$/.test(comment.username)) {
          riskFlags.push('bot_like_username');
        }
        
        const existingEntry = newEntries.find((e: any) => e.entrant_username === comment.username);
        if (existingEntry) riskFlags.push('multiple_entries');
        
        const entryRecord = {
          id: entryId,
          giveaway_id: giveawayId!,
          comment_id: commentId,
          entrant_username: comment.username,
          entrant_instagram_id: comment.username,
          mention_count: parsed.uniqueMentions.length,
          required_mentions_met: parsed.minRequiredMet,
          follow_verification_status: 'pending' as const,
          repost_verification_status: 'pending' as const,
          duplicate_status: existingEntry ? 'duplicate' as const : 'unique' as const,
          risk_score: riskFlags.length * 20,
          final_status: 'pending' as const,
          admin_notes: '',
          risk_flags: riskFlags,
          created_at: comment.timestamp,
          updated_at: new Date().toISOString(),
        };
        newEntries.push(entryRecord);
        
        parsed.parsedMentions.forEach(pm => {
          newMentions.push({
            id: uuidv4(),
            entry_id: entryId,
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
      addAuditLog('api_import', 'comments', giveawayId!, '', String(newComments.length), 
        `Instagram API import: ${newComments.length} comments, ${duplicates} duplicates skipped`);
      
      if (giveaway?.status === 'draft') {
        dispatch({ type: 'UPDATE_GIVEAWAY', payload: { id: giveawayId!, updates: { status: 'reviewing' }}});
      }
      
      setFetchSuccess(`✅ Successfully imported ${newComments.length} comments (${duplicates} duplicates skipped)`);
      setFetching(false);
    } catch (error: any) {
      setFetchError(error.message || 'Failed to fetch comments. Check your credentials.');
      setFetching(false);
    }
  };
  
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white">Import Comments</h1>
        <p className="text-sm text-gray-400 mt-1">
          Choose how to import comments from your reel
        </p>
      </div>
      
      {/* Method 1: Instagram API (Recommended) */}
      <Card className="p-4 border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <Zap className="text-emerald-400" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Method 1: Instagram Graph API (Recommended)</h3>
            <p className="text-xs text-emerald-400">Official • Free • All 5000+ comments at once</p>
          </div>
        </div>
        <p className="text-sm text-gray-300 mb-3">
          If your Instagram is a <strong>Business/Creator account</strong>, you can fetch ALL comments automatically using the official Instagram API. This is how professional giveaway picker sites work.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="success" size="sm" onClick={() => setShowApiImport(true)}>
            <Key size={14} className="mr-1.5" /> Import via API
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate(`/giveaways/${giveawayId}/api-setup`)}>
            <ExternalLink size={14} className="mr-1.5" /> Step-by-Step Setup Wizard
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowApiSetup(true)}>
            <ExternalLink size={14} className="mr-1.5" /> Quick Guide
          </Button>
        </div>
      </Card>
      
      {/* Method 2: Third-Party Services */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold">2</div>
          <h3 className="text-sm font-medium text-white">Method 2: Third-Party Services (Easiest)</h3>
        </div>
        <p className="text-sm text-gray-300 mb-3">
          Use a service to extract comments without API setup. Just paste your reel URL and get a CSV.
        </p>
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-start gap-2 p-2 bg-gray-800/50 rounded-lg">
            <span className="text-pink-400 font-medium shrink-0">Phantombuster</span>
            <span className="text-gray-400">~$30/mo — Most reliable, exports to CSV</span>
            <a href="https://phantombuster.com" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline ml-auto shrink-0">
              <ExternalLink size={12} />
            </a>
          </div>
          <div className="flex items-start gap-2 p-2 bg-gray-800/50 rounded-lg">
            <span className="text-pink-400 font-medium shrink-0">Apify</span>
            <span className="text-gray-400">~$5-10 one-time — Pay per use</span>
            <a href="https://apify.com" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline ml-auto shrink-0">
              <ExternalLink size={12} />
            </a>
          </div>
          <div className="flex items-start gap-2 p-2 bg-gray-800/50 rounded-lg">
            <span className="text-pink-400 font-medium shrink-0">ScrapeCreators</span>
            <span className="text-gray-400">API service — Developer-friendly</span>
            <a href="https://scrapecreators.com" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline ml-auto shrink-0">
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </Card>
      
      {/* Method 3: CSV Import */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-bold">3</div>
          <h3 className="text-sm font-medium text-white">Method 3: CSV Import</h3>
        </div>
        <p className="text-sm text-gray-300 mb-3">
          If you already have comments in CSV format (from any source), paste them below.
        </p>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => copyText(csvTemplate, 'template')}>
            {copied === 'template' ? <Check size={12} className="mr-1 text-emerald-400" /> : <Copy size={12} className="mr-1" />}
            {copied === 'template' ? 'Copied!' : 'Copy Template'}
          </Button>
          <Button size="sm" variant="secondary" onClick={downloadTemplate}>
            <Download size={12} className="mr-1" /> Download .csv
          </Button>
          <Button size="sm" variant="primary" onClick={() => navigate(`/giveaways/${giveawayId}`)}>
            <FileText size={12} className="mr-1" /> Go to Import
          </Button>
        </div>
        <pre className="bg-gray-900/50 rounded-lg p-3 text-xs text-gray-300 font-mono overflow-x-auto border border-gray-700/50 mt-3">
{csvTemplate}
        </pre>
      </Card>
      
      {/* Follow Verification Guide */}
      <Card className="p-4 border-violet-500/20 bg-violet-500/5">
        <div className="flex items-start gap-3">
          <Instagram className="text-violet-400 mt-0.5 shrink-0" size={20} />
          <div>
            <h3 className="text-sm font-medium text-violet-300">After Import: Follow Verification</h3>
            <p className="text-xs text-violet-400/80 mt-1 leading-relaxed">
              No API (official or third-party) can check if mentioned friends follow @nihawi_puan and @jauigiggles. 
              This is an Instagram privacy restriction. You must verify manually:
            </p>
            <ol className="text-xs text-violet-400/80 mt-2 ml-4 list-decimal space-y-1">
              <li>Open each mentioned friend's profile</li>
              <li>Tap "Following" → Search for @nihawi_puan ✓</li>
              <li>Search for @jauigiggles ✓</li>
              <li>Mark as Verified in the app's Verification Queue</li>
            </ol>
          </div>
        </div>
      </Card>
      
      {/* API Import Modal */}
      <Modal isOpen={showApiImport} onClose={() => setShowApiImport(false)} title="Import via Instagram API">
        <div className="space-y-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-300">
              <strong>Requirements:</strong> Business/Creator Instagram account + Facebook Developer App + Access Token
            </p>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Access Token</label>
            <input
              type="text"
              value={accessToken}
              onChange={e => setAccessToken(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              placeholder="EAABwzLixnjYBO..."
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Media ID</label>
            <input
              type="text"
              value={mediaId}
              onChange={e => setMediaId(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              placeholder="17854360229135871"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get this from: <code className="text-pink-400">graph.facebook.com/v18.0/me/accounts</code> or oEmbed API
            </p>
          </div>
          
          {fetchError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{fetchError}</p>
            </div>
          )}
          
          {fetchSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-sm text-emerald-400">{fetchSuccess}</p>
              <Button size="sm" variant="primary" className="mt-2" onClick={() => { setShowApiImport(false); navigate(`/giveaways/${giveawayId}/entries`); }}>
                View Entries →
              </Button>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowApiImport(false)}>Cancel</Button>
            <Button variant="success" onClick={handleApiFetch} disabled={fetching}>
              {fetching ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Fetching...
                </span>
              ) : (
                <>
                  <Zap size={14} className="mr-1.5" /> Fetch All Comments
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* API Setup Modal */}
      <Modal isOpen={showApiSetup} onClose={() => setShowApiSetup(false)} title="Instagram API Setup Guide">
        <div className="prose prose-sm prose-invert max-h-96 overflow-y-auto">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
            {INSTAGRAM_API_SETUP_GUIDE}
          </pre>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-700 mt-4">
          <Button variant="ghost" onClick={() => setShowApiSetup(false)}>Close</Button>
          <Button variant="success" onClick={() => { setShowApiSetup(false); setShowApiImport(true); }}>
            I'm Ready — Import Now
          </Button>
        </div>
      </Modal>
    </div>
  );
}
