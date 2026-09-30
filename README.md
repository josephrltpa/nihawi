# Nihawi × Jaui Instagram Giveaway Comment Picker

A comprehensive web application for managing Instagram giveaways with transparent, auditable winner selection.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **Comment Import** — CSV/JSON import or manual entry
- **Mention Parsing** — Robust @mention extraction with duplicate/self/target filtering
- **Manual Verification** — Follow & repost verification workflow (compliant with Instagram ToS)
- **Fraud Detection** — Flags suspicious patterns, bot accounts, duplicate entries
- **Deterministic Draw** — Seeded random selection with full audit trail
- **Winner Management** — Track contacted/claimed/disqualified status
- **Announcement Generator** — Auto-generate Instagram captions
- **Audit Log** — Immutable record of all admin actions
- **Demo Mode** — 30+ sample entries for testing

## 🚀 Quick Start (Local)

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Then open `http://localhost:5173` and click **"Enter Demo Mode"**.

---

## 📦 Deployment Guides

### Option 1: Vercel (Recommended — Easiest)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/nihawi-jaui-giveaway.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Click **Deploy**

3. Your app is live at `https://your-project.vercel.app`

---

### Option 2: Netlify

1. **Push to GitHub** (same as above)

2. **Connect to Netlify:**
   - Go to [netlify.com](https://www.netlify.com/)
   - Click **"Add new site" → "Import an existing project"**
   - Connect your GitHub repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click **Deploy**

3. **Alternative — Drag & Drop:**
   - Run `npm run build` locally
   - Drag the `dist` folder to [app.netlify.com/drop](https://app.netlify.com/drop)

---

### Option 3: GitHub Pages

1. **Install the gh-pages package:**
   ```bash
   npm install -D gh-pages
   ```

2. **Update `vite.config.js`** — add `base` property:
   ```js
   export default defineConfig({
     base: '/nihawi-jaui-giveaway/',  // Your repo name
     // ... rest of config
   })
   ```

3. **Add deploy script to `package.json`:**
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages:**
   - Go to repo Settings → Pages
   - Source: **Deploy from a branch**
   - Branch: **gh-pages** / root
   - Your app is live at `https://YOUR_USERNAME.github.io/nihawi-jaui-giveaway/`

---

### Option 4: Cloudflare Pages

1. Push to GitHub
2. Go to [pages.cloudflare.com](https://pages.cloudflare.com/)
3. Connect repository
4. Build settings:
   - Framework: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy!

---

### Option 5: Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting
# Select: "dist" as public directory
# Single-page app: Yes
# GitHub auto-build: Yes (optional)

# Deploy
npm run build
firebase deploy
```

---

## 🏗️ Architecture

```
src/
├── App.tsx                    # Main app with routing
├── types.ts                   # TypeScript interfaces
├── components/
│   ├── Layout.tsx             # Sidebar + main layout
│   └── ui.tsx                 # Reusable UI components
├── pages/
│   ├── LoginPage.tsx          # Auth / demo entry
│   ├── DashboardPage.tsx      # Overview stats
│   ├── GiveawaysPage.tsx      # List/create giveaways
│   ├── GiveawaySettingsPage.tsx # Settings + import
│   ├── EntriesPage.tsx        # Entries table + filters
│   ├── EntryDetailPage.tsx    # Single entry detail
│   ├── VerificationPage.tsx   # Review queues
│   ├── DrawPage.tsx           # Winner selection
│   ├── WinnersPage.tsx        # Winner management
│   ├── AuditLogPage.tsx       # Immutable audit trail
│   └── AnnouncementPage.tsx   # Caption generator
├── store/
│   └── AppContext.tsx         # State management
└── utils/
    ├── mentionParser.ts       # @mention extraction
    ├── eligibilityEngine.ts   # Eligibility calculation
    ├── winnerSelection.ts     # Seeded random draw
    ├── exportUtils.ts         # CSV export + announcements
    └── seedData.ts            # Demo data generator
```

## 🔐 Compliance Notes

- ✅ Does NOT scrape Instagram
- ✅ Does NOT access private data
- ✅ Does NOT store passwords
- ✅ Manual verification for follow/repost (API limitations)
- ✅ Full audit trail for transparency
- ✅ Admin responsible for local giveaway law compliance

## 📋 Eligibility Rules

1. Comment must contain ≥3 distinct @mentions (not self, not target accounts)
2. Mentioned friends must follow BOTH target accounts (manually verified)
3. Entrant must repost reel to Story for 24h (proof verified)
4. No duplicate/spam entries
5. 5 winners + 3 backups selected via seeded random draw

## 🛠️ Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS v4
- React Router (HashRouter for static hosting)
- canvas-confetti (winner celebration)
- lucide-react (icons)
- date-fns (date formatting)

## 📄 License

MIT — Use freely for your giveaways.

---

**Built with ❤️ for fair and transparent giveaways.**
