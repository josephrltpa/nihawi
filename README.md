# Nihawi Puan × Jaui Instagram Giveaway Comment Picker

A comprehensive web application for managing Instagram giveaways with transparent, auditable winner selection.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black)

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

---

## 🚀 Deploy to Vercel (Step-by-Step)

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not done yet)
git init
git add .
git commit -m "✨ Initial commit - Nihawi Puan x Jaui Giveaway Picker"

# Create a new repo on GitHub, then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nihawi-jaui-giveaway.git
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select your repository: `nihawi-jaui-giveaway`
4. Vercel auto-detects **Vite** — settings should be:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Click **"Deploy"**

### Step 3: Done! 🎉

Your app is live at `https://your-project.vercel.app`

**Login:** Click **"Enter Demo Mode"** button (no account needed for demo).

---

## 🔄 Updating Your Deployment

After any code changes:

```bash
git add .
git commit -m "your update message"
git push
```

Vercel auto-deploys on every push to `main`.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📦 Architecture

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

---

## 🔐 Compliance Notes

- ✅ Does NOT scrape Instagram
- ✅ Does NOT access private data
- ✅ Does NOT store passwords
- ✅ Manual verification for follow/repost (API limitations)
- ✅ Full audit trail for transparency
- ✅ Admin responsible for local giveaway law compliance

---

## 📋 Eligibility Rules

1. Comment must contain ≥3 distinct @mentions (not self, not target accounts)
2. Mentioned friends must follow BOTH target accounts (manually verified)
3. Entrant must repost reel to Story for 24h (proof verified)
4. No duplicate/spam entries
5. 5 winners + 3 backups selected via seeded random draw

---

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS v4**
- **React Router** (HashRouter for static hosting)
- **canvas-confetti** (winner celebration)
- **lucide-react** (icons)
- **date-fns** (date formatting)

---

## 📄 License

MIT — Use freely for your giveaways.

---

**Built with ❤️ for fair and transparent giveaways.**
