// ============================================================
// COMMENT IMPORT GUIDE - How to get comments from your reel
// ============================================================

import React, { useState } from 'react';
import { Download, Copy, Check, FileText, Instagram, AlertCircle } from 'lucide-react';
import { Card, Button } from '../components/ui';

export default function ImportGuidePage() {
  const [copied, setCopied] = useState<string | null>(null);
  
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
  
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-white">How to Import Comments</h1>
        <p className="text-sm text-gray-400 mt-1">
          Guide for importing comments from your Instagram reel
        </p>
      </div>
      
      {/* Important Notice */}
      <Card className="p-4 border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-amber-400 mt-0.5 shrink-0" size={20} />
          <div>
            <h3 className="text-sm font-medium text-amber-300">Why Can't We Auto-Import?</h3>
            <p className="text-xs text-amber-400/80 mt-1 leading-relaxed">
              Instagram's API does not allow third-party apps to read comments from posts 
              unless the app has been explicitly authorized by the account owner through 
              Facebook's app review process (which takes weeks and requires a business justification). 
              Additionally, Instagram does NOT provide an API to check whether arbitrary users 
              follow specific accounts — this is a privacy restriction.
            </p>
            <p className="text-xs text-amber-400/80 mt-2 leading-relaxed">
              <strong>The solution:</strong> Export comments manually (or use a compliant tool) 
              and import them as CSV. Follow verification must be done manually by checking 
              each mentioned account's profile.
            </p>
          </div>
        </div>
      </Card>
      
      {/* Method 1 */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-bold">1</div>
          <h3 className="text-sm font-medium text-white">Method 1: Manual Copy-Paste (Recommended)</h3>
        </div>
        <ol className="space-y-2 text-sm text-gray-300 ml-8 list-decimal">
          <li>Open your reel: <a href="https://www.instagram.com/reel/DdQur5BugOd/" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">instagram.com/reel/DdQur5BugOd</a></li>
          <li>Scroll through all comments</li>
          <li>For each comment, note down: <strong>username</strong>, <strong>comment text</strong>, and <strong>timestamp</strong></li>
          <li>Enter them into the CSV template below</li>
          <li>Import via the <strong>Giveaway Settings → Import</strong> page</li>
        </ol>
      </Card>
      
      {/* Method 2 */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold">2</div>
          <h3 className="text-sm font-medium text-white">Method 2: Instagram Insights (Business Account)</h3>
        </div>
        <ol className="space-y-2 text-sm text-gray-300 ml-8 list-decimal">
          <li>If your account is a <strong>Business/Creator account</strong>, go to Instagram → Professional Dashboard</li>
          <li>Open the reel → tap "..." → "View Insights"</li>
          <li>You can see comment count but NOT export them directly</li>
          <li>Use a <strong>compliant third-party tool</strong> like:
            <ul className="ml-4 mt-1 space-y-1 text-gray-400">
              <li>• <strong>Not Just Analytics</strong> — free comment viewer</li>
              <li>• <strong>Instagram's own Meta Business Suite</strong> — if connected</li>
              <li>• <strong>Comment export browser extensions</strong> (verify they're compliant!)</li>
            </ul>
          </li>
        </ol>
      </Card>
      
      {/* Method 3 */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">3</div>
          <h3 className="text-sm font-medium text-white">Method 3: Use This App's Manual Entry</h3>
        </div>
        <p className="text-sm text-gray-300 ml-8">
          For smaller giveaways, you can manually enter each comment one-by-one 
          via <strong>Giveaway Settings → Manual Entry</strong>. This is the safest 
          method as no third-party tools are involved.
        </p>
      </Card>
      
      {/* CSV Template */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-white flex items-center gap-2">
            <FileText size={16} className="text-pink-400" />
            CSV Template
          </h3>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => copyText(csvTemplate, 'template')}>
              {copied === 'template' ? <Check size={12} className="mr-1 text-emerald-400" /> : <Copy size={12} className="mr-1" />}
              {copied === 'template' ? 'Copied!' : 'Copy'}
            </Button>
            <Button size="sm" variant="secondary" onClick={downloadTemplate}>
              <Download size={12} className="mr-1" /> Download .csv
            </Button>
          </div>
        </div>
        <pre className="bg-gray-900/50 rounded-lg p-3 text-xs text-gray-300 font-mono overflow-x-auto border border-gray-700/50">
{csvTemplate}
        </pre>
        <p className="text-xs text-gray-500 mt-2">
          <strong>Columns:</strong> username (without @), comment_text, timestamp (ISO format), comment_id (any unique ID)
        </p>
      </Card>
      
      {/* Follow Verification Guide */}
      <Card className="p-4 border-violet-500/20 bg-violet-500/5">
        <div className="flex items-start gap-3">
          <Instagram className="text-violet-400 mt-0.5 shrink-0" size={20} />
          <div>
            <h3 className="text-sm font-medium text-violet-300">How to Verify Follows Manually</h3>
            <p className="text-xs text-violet-400/80 mt-1 leading-relaxed">
              For each mentioned friend in a comment:
            </p>
            <ol className="text-xs text-violet-400/80 mt-2 ml-4 list-decimal space-y-1">
              <li>Open the mentioned user's Instagram profile (e.g., instagram.com/friend1)</li>
              <li>Tap "Following" on their profile</li>
              <li>Search for <strong>@nihawi_puan</strong> — if it appears, they follow ✓</li>
              <li>Search for <strong>@jauigiggles</strong> — if it appears, they follow ✓</li>
              <li>If BOTH are found → mark as "Verified" in the app</li>
              <li>If either is missing → mark as "Failed"</li>
            </ol>
            <p className="text-xs text-violet-400/60 mt-2">
              💡 <strong>Tip:</strong> Use the Verification Queue in the app for a fast one-by-one review flow.
            </p>
          </div>
        </div>
      </Card>
      
      {/* Repost Verification */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-white mb-2">📱 Repost Verification</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Since Instagram Stories expire after 24 hours, you have two options:
        </p>
        <ul className="text-xs text-gray-400 mt-2 ml-4 list-disc space-y-1">
          <li><strong>Option A:</strong> Check each entrant's active story BEFORE it expires (time-sensitive!)</li>
          <li><strong>Option B:</strong> Ask entrants to DM you screenshot proof of their story repost</li>
          <li><strong>Option C:</strong> If the 24h window has passed, mark as "Expired" and decide whether to accept late proof</li>
        </ul>
      </Card>
    </div>
  );
}
