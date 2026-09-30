// ============================================================
// API SETUP WIZARD - Interactive step-by-step guide
// Updated for current Facebook Developer dashboard (2026)
// ============================================================

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, Circle, ArrowRight, ArrowLeft, ExternalLink, 
  Eye, EyeOff, AlertTriangle, Instagram, Key, Zap
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
  substeps?: string[];
}

export default function ApiSetupWizard() {
  const { giveawayId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showToken, setShowToken] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [mediaId, setMediaId] = useState('');
  const [showQuickGuide, setShowQuickGuide] = useState(false);

  const steps: Step[] = [
    {
      id: 1,
      title: '✅ Connect Instagram to Facebook Page',
      description: 'You already have a Creator account — great! Now make sure it\'s connected to a Facebook Page.',
      substeps: [
        'Open Instagram app → Go to your profile',
        'Tap "Edit Profile"',
        'Scroll to "Public Business Information" → Tap "Page"',
        'Connect to an existing Facebook Page or create a new one',
      ],
      tip: 'If you don\'t have a Facebook Page, create one at facebook.com/pages/create first',
      warning: 'This is REQUIRED — the API won\'t work without a Facebook Page connection',
    },
    {
      id: 2,
      title: 'Go to Facebook Developer App Creation',
      description: 'Navigate to the new app creation page. Facebook has updated their interface — there\'s no more "Business type" selection.',
      action: 'Click the button below to open the app creation page',
      link: 'https://developers.facebook.com/apps/creation/',
      tip: 'You\'ll need to log in with the same Facebook account your Instagram is connected to',
    },
    {
      id: 3,
      title: 'Enter App Details',
      description: 'Fill in your app name and contact email.',
      substeps: [
        'App name: "Nihawi Giveaway Picker" (or anything you like)',
        'Contact email: your email address',
        'Click "Next"',
      ],
      tip: 'The app name doesn\'t matter — it\'s just for your reference',
    },
    {
      id: 4,
      title: '⭐ Select Use Case (IMPORTANT)',
      description: 'This is the key step! Facebook now uses "Use Cases" instead of app types.',
      substeps: [
        'Look for: "Manage messaging & content on Instagram"',
        'Select this use case',
        'This automatically adds: instagram_manage_comments, instagram_basic, and other permissions',
        'Click "Next"',
      ],
      warning: 'Do NOT select "Authenticate with Facebook Login" — that\'s the wrong use case. You need the Instagram one!',
      tip: 'If you don\'t see it, scroll through the list. It might say "Manage messaging & content on Instagram" or similar',
    },
    {
      id: 5,
      title: 'Business Portfolio (Skip for Now)',
      description: 'You\'ll see options to connect a business portfolio. For testing/development, you can skip this.',
      substeps: [
        'Select: "I don\'t want to connect a business portfolio yet"',
        'OR select an existing portfolio if you have one',
        'Click "Next"',
      ],
      tip: 'You can always connect a business portfolio later if needed',
    },
    {
      id: 6,
      title: 'Review & Create App',
      description: 'Review your app details and create it.',
      substeps: [
        'Review your app name, use case, and business settings',
        'Accept the Meta Platform Terms',
        'Click "Go to dashboard" or "Create App"',
      ],
      tip: 'Your app is now created! Next step is getting the access token.',
    },
    {
      id: 7,
      title: '🔑 Generate Access Token',
      description: 'Use the Graph API Explorer to generate a token with the right permissions.',
      action: 'Open Graph API Explorer',
      link: 'https://developers.facebook.com/tools/explorer/',
      substeps: [
        'Select your new app from the dropdown (top right)',
        'Click "Generate Access Token"',
        'A popup will appear — click "Continue" then "Done"',
        'If it asks for permissions, make sure these are checked:',
        '  ✅ instagram_basic',
        '  ✅ instagram_manage_comments',
        '  ✅ pages_show_list',
        '  ✅ pages_read_engagement',
        'Copy the generated token (starts with "EAAB...")',
      ],
      warning: 'This token expires in 1 hour. That\'s fine for importing comments once!',
    },
    {
      id: 8,
      title: '🆔 Get Your Media ID',
      description: 'Get the numeric ID for your giveaway reel (not the URL).',
      action: 'Open Graph API Explorer',
      link: 'https://developers.facebook.com/tools/explorer/',
      substeps: [
        'In Graph API Explorer, change endpoint to: GET /me/accounts',
        'Click "Submit"',
        'Find your Facebook Page → copy the "id" value',
        'Now change endpoint to: GET /{page-id}/media?fields=id,permalink',
        '  (replace {page-id} with the ID you just copied)',
        'Click "Submit"',
        'Find your reel in the results (match by permalink or caption)',
        'Copy the "id" field — this is your Media ID!',
      ],
      tip: 'Your reel URL is: https://www.instagram.com/reel/DdQur5BugOd/',
      warning: 'You need the NUMERIC media ID (like 17854360229135871), NOT the URL',
    },
    {
      id: 9,
      title: '🎉 Import Your Comments!',
      description: 'You\'re ready! Paste your token and media ID into the app.',
      substeps: [
        'Go back to the Import Guide page',
        'Click "Import via API"',
        'Paste your Access Token',
        'Paste your Media ID',
        'Click "Fetch All Comments"',
        'Wait a few seconds...',
        'Done! All 5000+ comments imported automatically!',
      ],
      tip: 'The app will automatically parse mentions, detect duplicates, and flag suspicious entries',
    },
  ];

  const markComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = Math.round((completedSteps.length / steps.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Instagram API Setup Wizard</h1>
        <p className="text-sm text-gray-400 mt-1">Step-by-step guide to fetch all comments automatically</p>
        <div className="mt-3 flex items-center justify-center gap-1">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep ? 'w-8 bg-pink-500' :
                completedSteps.includes(step.id) ? 'w-4 bg-emerald-500' :
                'w-4 bg-gray-700 hover:bg-gray-600'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Step {currentStep + 1} of {steps.length} • {progress}% complete
        </p>
      </div>

      {/* Quick Help */}
      <Card className="p-3 border-blue-500/20 bg-blue-500/5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-blue-300">
            💡 Facebook updated their dashboard. The old "Business type" option is gone — now you select a <strong>Use Case</strong>.
          </p>
          <Button size="sm" variant="ghost" onClick={() => setShowQuickGuide(true)}>
            Quick Guide
          </Button>
        </div>
      </Card>

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

        {/* Link */}
        {currentStepData.link && (
          <a
            href={currentStepData.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors mb-3"
          >
            <ExternalLink size={16} />
            <span className="text-sm font-medium">Open Link</span>
            <span className="text-xs text-blue-400/60 ml-auto truncate">{currentStepData.link}</span>
          </a>
        )}

        {/* Substeps */}
        {currentStepData.substeps && (
          <div className="space-y-2 mb-3">
            {currentStepData.substeps.map((substep, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 bg-gray-800/50 rounded-lg">
                <span className="text-pink-400 text-xs font-mono mt-0.5 shrink-0">{idx + 1}.</span>
                <p className="text-sm text-gray-300">{substep}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tip */}
        {currentStepData.tip && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg mb-3">
            <p className="text-xs text-emerald-300">💡 <strong>Tip:</strong> {currentStepData.tip}</p>
          </div>
        )}

        {/* Warning */}
        {currentStepData.warning && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-3">
            <p className="text-xs text-amber-300">⚠️ <strong>Important:</strong> {currentStepData.warning}</p>
          </div>
        )}

        {/* Token input (step 7) */}
        {currentStep === 6 && (
          <div className="space-y-3 mt-4 pt-4 border-t border-gray-700/50">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Paste your Access Token here:</p>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={accessToken}
                onChange={e => setAccessToken(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 pr-10 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                placeholder="EAABwzLixnjYBO..."
              />
              <button
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {accessToken && (
              <Button size="sm" variant="success" onClick={() => markComplete(7)}>
                <CheckCircle size={12} className="mr-1" /> Got my token!
              </Button>
            )}
          </div>
        )}

        {/* Media ID input (step 8) */}
        {currentStep === 7 && (
          <div className="space-y-3 mt-4 pt-4 border-t border-gray-700/50">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Paste your Media ID here:</p>
            <input
              type="text"
              value={mediaId}
              onChange={e => setMediaId(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              placeholder="e.g., 17854360229135871"
            />
            {mediaId && (
              <Button size="sm" variant="success" onClick={() => markComplete(8)}>
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
            {!completedSteps.includes(currentStepData.id) && currentStep < 6 && (
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
        <h3 className="text-sm font-medium text-gray-300 mb-3">All Steps</h3>
        <div className="space-y-1">
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
              <span className={`text-sm ${idx === currentStep ? 'text-white font-medium' : 'text-gray-400'}`}>
                {step.title}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Alternative Options */}
      <Card className="p-4 border-amber-500/20 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-amber-400 mt-0.5 shrink-0" size={18} />
          <div>
            <h3 className="text-sm font-medium text-amber-300">API Setup Too Complex?</h3>
            <p className="text-xs text-amber-400/70 mt-1">
              If this is taking too long, use these easier alternatives:
            </p>
            <div className="mt-2 space-y-1.5">
              <a href="https://phantombuster.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-amber-300 hover:text-amber-200">
                <ExternalLink size={10} /> <strong>Phantombuster</strong> (~$30/mo) — Just paste your reel URL, get CSV
              </a>
              <a href="https://apify.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-amber-300 hover:text-amber-200">
                <ExternalLink size={10} /> <strong>Apify</strong> (~$5-10) — Pay-per-use Instagram scraper
              </a>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Guide Modal */}
      <Modal isOpen={showQuickGuide} onClose={() => setShowQuickGuide(false)} title="Quick Reference">
        <div className="space-y-4 text-sm">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-300 font-medium mb-1">⚡ The Short Version:</p>
            <ol className="text-xs text-blue-200/80 space-y-1 list-decimal ml-4">
              <li>Go to developers.facebook.com/apps/creation/</li>
              <li>Enter app name + email → Next</li>
              <li>Select use case: <strong>"Manage messaging & content on Instagram"</strong></li>
              <li>Skip business portfolio → Next</li>
              <li>Review → Create App</li>
              <li>Go to Graph API Explorer → Generate token</li>
              <li>Get Media ID via /me/accounts → /{'{'}page-id{'}'}/media</li>
              <li>Paste both into the app → Import!</li>
            </ol>
          </div>
          
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-xs text-amber-300 font-medium mb-1">⚠️ Key Changes from Old Facebook:</p>
            <ul className="text-xs text-amber-200/80 space-y-1 list-disc ml-4">
              <li>No more "Business type" — now it's "Use Cases"</li>
              <li>Select "Manage messaging & content on Instagram"</li>
              <li>This gives you instagram_manage_comments permission</li>
              <li>Business portfolio is optional for development</li>
            </ul>
          </div>

          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-xs text-emerald-300 font-medium mb-1">✅ Required Permissions:</p>
            <div className="text-xs text-emerald-200/80 space-y-0.5 font-mono">
              <p>• instagram_basic</p>
              <p>• instagram_manage_comments</p>
              <p>• pages_show_list</p>
              <p>• pages_read_engagement</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end pt-4 border-t border-gray-700 mt-4">
          <Button variant="primary" onClick={() => setShowQuickGuide(false)}>Got it!</Button>
        </div>
      </Modal>
    </div>
  );
}
