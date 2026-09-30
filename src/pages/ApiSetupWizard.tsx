// ============================================================
// API SETUP WIZARD - Interactive step-by-step guide
// ============================================================

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Circle, ArrowRight, ArrowLeft, ExternalLink, 
  Copy, Check, AlertTriangle, Instagram, Facebook, Key, Zap, 
  Eye, EyeOff, RefreshCw
} from 'lucide-react';
import { Card, Button, Modal } from '../components/ui';

interface Step {
  id: number;
  title: string;
  description: string;
  action?: string;
  link?: string;
  tip?: string;
  warning?: string;
}

export default function ApiSetupWizard() {
  const { giveawayId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showToken, setShowToken] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [mediaId, setMediaId] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const steps: Step[] = [
    {
      id: 1,
      title: '✅ Connect Instagram to Facebook Page',
      description: 'You already converted to Creator account — great! Now connect it to a Facebook Page.',
      action: 'Open Instagram → Settings → Account → Sharing → Connect to Facebook Page',
      tip: 'If you don\'t have a Facebook Page, create one first at facebook.com/pages/create',
      warning: 'This is REQUIRED — the API won\'t work without a Facebook Page connection',
    },
    {
      id: 2,
      title: 'Create Facebook Developer Account',
      description: 'Go to Facebook Developers and sign up as a developer (free).',
      action: 'Click the button below to open Facebook Developers',
      link: 'https://developers.facebook.com/',
      tip: 'Use the same Facebook account that your Instagram is connected to',
    },
    {
      id: 3,
      title: 'Create a New App',
      description: 'Create a new app in the Facebook Developer dashboard.',
      action: 'Click "My Apps" → "Create App" → Choose "Business" type',
      tip: 'Name it something like "Nihawi Giveaway Picker"',
      warning: 'Choose "Business" not "Consumer" — you need Business type for Instagram API',
    },
    {
      id: 4,
      title: 'Add Instagram Graph API Product',
      description: 'Add the Instagram Graph API to your app.',
      action: 'In your app dashboard → "Add Product" → Find "Instagram" → Set up Instagram Graph API',
      tip: 'It might be listed as "Instagram Graph API" or just "Instagram"',
    },
    {
      id: 5,
      title: 'Get Your Access Token',
      description: 'Use the Graph API Explorer to generate an access token with the right permissions.',
      action: 'Go to Graph API Explorer → Select your app → Get Instagram Token',
      link: 'https://developers.facebook.com/tools/explorer/',
      tip: 'Required permissions: instagram_basic, instagram_manage_comments, pages_show_list, pages_read_engagement',
      warning: 'The token expires in 1 hour. For longer access, see Step 7.',
    },
    {
      id: 6,
      title: 'Get Your Media ID',
      description: 'Get the unique ID for your giveaway reel.',
      action: 'Use the oEmbed API or find it in your Instagram insights',
      tip: 'Your reel URL: https://www.instagram.com/reel/DdQur5BugOd/',
      warning: 'You need the NUMERIC media ID, not the URL',
    },
    {
      id: 7,
      title: 'Get Long-Lived Token (Optional)',
      description: 'Exchange your 1-hour token for a 60-day token.',
      action: 'Use the token debugger or make an API call',
      link: 'https://developers.facebook.com/tools/debug/access-token/',
      tip: 'For this giveaway, a 1-hour token is fine since you\'ll import once',
    },
    {
      id: 8,
      title: '🎉 Import Your Comments!',
      description: 'You\'re ready! Paste your token and media ID into the app.',
      action: 'Go to Import Guide → Click "Import via API" → Paste credentials → Fetch!',
    },
  ];

  const markComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Instagram API Setup Wizard</h1>
        <p className="text-sm text-gray-400 mt-1">Follow these steps to get your API credentials</p>
        <div className="mt-3 flex items-center justify-center gap-1">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep ? 'w-8 bg-pink-500' :
                completedSteps.includes(step.id) ? 'w-4 bg-emerald-500' :
                'w-4 bg-gray-700'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Step {currentStep + 1} of {steps.length}</p>
      </div>

      {/* Current Step */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            completedSteps.includes(currentStepData.id) 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-pink-500/20 text-pink-400'
          }`}>
            {completedSteps.includes(currentStepData.id) ? <CheckCircle size={20} /> : <span className="font-bold">{currentStep + 1}</span>}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{currentStepData.title}</h2>
            <p className="text-sm text-gray-400 mt-1">{currentStepData.description}</p>
          </div>
        </div>

        {/* Action */}
        {currentStepData.action && (
          <div className="ml-13 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50 mb-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">What to do:</p>
            <p className="text-sm text-gray-200">{currentStepData.action}</p>
          </div>
        )}

        {/* Link */}
        {currentStepData.link && (
          <a
            href={currentStepData.link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-13 flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors mb-3"
          >
            <ExternalLink size={16} />
            <span className="text-sm">Open Link</span>
            <span className="text-xs text-blue-400/60 ml-auto truncate">{currentStepData.link}</span>
          </a>
        )}

        {/* Tip */}
        {currentStepData.tip && (
          <div className="ml-13 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-3">
            <p className="text-xs text-emerald-300">💡 <strong>Tip:</strong> {currentStepData.tip}</p>
          </div>
        )}

        {/* Warning */}
        {currentStepData.warning && (
          <div className="ml-13 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-3">
            <p className="text-xs text-amber-300">⚠️ <strong>Important:</strong> {currentStepData.warning}</p>
          </div>
        )}

        {/* Step-specific content */}
        {currentStep === 4 && (
          <div className="ml-13 space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Required Permissions:</p>
            <div className="space-y-1.5">
              {['instagram_basic', 'instagram_manage_comments', 'pages_show_list', 'pages_read_engagement'].map(perm => (
                <div key={perm} className="flex items-center gap-2 p-2 bg-gray-800/50 rounded text-sm">
                  <code className="text-pink-400 font-mono text-xs">{perm}</code>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="ml-13 space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Your Access Token:</p>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={accessToken}
                onChange={e => setAccessToken(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 pr-10 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                placeholder="Paste your access token here..."
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {accessToken && (
              <Button size="sm" variant="success" onClick={() => markComplete(6)}>
                <CheckCircle size={12} className="mr-1" /> Got my token!
              </Button>
            )}
          </div>
        )}

        {currentStep === 6 && (
          <div className="ml-13 space-y-3">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Your Media ID:</p>
            <input
              type="text"
              value={mediaId}
              onChange={e => setMediaId(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              placeholder="e.g., 17854360229135871"
            />
            <div className="p-3 bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-400 mb-2">How to find your Media ID:</p>
              <ol className="text-xs text-gray-400 space-y-1 list-decimal ml-4">
                <li>Go to Graph API Explorer</li>
                <li>Enter: <code className="text-pink-400">GET /me/accounts</code></li>
                <li>Find your page ID</li>
                <li>Then: <code className="text-pink-400">GET /{'{'}page-id{'}'}/media</code></li>
                <li>Find your reel in the results → copy the <code className="text-pink-400">id</code> field</li>
              </ol>
            </div>
            {mediaId && (
              <Button size="sm" variant="success" onClick={() => markComplete(7)}>
                <CheckCircle size={12} className="mr-1" /> Got my Media ID!
              </Button>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700/50">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ArrowLeft size={14} className="mr-1" /> Previous
          </Button>
          
          <div className="flex gap-2">
            {!completedSteps.includes(currentStepData.id) && currentStep < 5 && (
              <Button
                variant="secondary"
                onClick={() => markComplete(currentStepData.id)}
              >
                <CheckCircle size={14} className="mr-1" /> Mark Done
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button
                variant="primary"
                onClick={() => {
                  markComplete(currentStepData.id);
                  setCurrentStep(currentStep + 1);
                }}
              >
                Next <ArrowRight size={14} className="ml-1" />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => navigate(`/giveaways/${giveawayId}/import-guide`)}
              >
                <Zap size={14} className="mr-1" /> Import Comments Now!
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Progress Summary */}
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">Progress</h3>
        <div className="space-y-2">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(idx)}
              className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all ${
                idx === currentStep ? 'bg-pink-500/10 border border-pink-500/20' : 'hover:bg-gray-800/50'
              }`}
            >
              {completedSteps.includes(step.id) ? (
                <CheckCircle size={16} className="text-emerald-400 shrink-0" />
              ) : (
                <Circle size={16} className="text-gray-600 shrink-0" />
              )}
              <span className={`text-sm ${idx === currentStep ? 'text-white' : 'text-gray-400'}`}>
                {step.title}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Quick Help */}
      <Card className="p-4 border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-amber-400 mt-0.5 shrink-0" size={18} />
          <div>
            <h3 className="text-sm font-medium text-amber-300">Need Help?</h3>
            <p className="text-xs text-amber-400/70 mt-1">
              If you get stuck, the easiest alternative is to use <strong>Phantombuster</strong> (~$30/month) 
              or <strong>Apify</strong> (~$5-10 one-time). They handle all the API complexity for you — 
              just paste your reel URL and get a CSV of all comments.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
