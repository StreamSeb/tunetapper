# TuneTapper Project Status

## Overview

**TuneTapper** is an SEO-optimized, AdSense-ready website offering free music production and DJ tools. The site is designed to attract organic search traffic through programmatic SEO pages and monetize via Google AdSense.

**Domain:** tunetapper.com  
**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS, shadcn/ui  
**Deployment Target:** Vercel

---

## Purpose & Business Model

### What It Does
- Provides **free interactive tools** for music producers and DJs
- Generates **programmatic SEO pages** targeting long-tail keywords (e.g., "128 BPM delay times", "8A Camelot compatible keys")
- Publishes **educational guides** to build authority and attract backlinks

### Monetization Strategy
- **Google AdSense** integration with consent-aware loading
- Users who accept cookies → personalized ads + Google Analytics
- Users who decline → non-personalized (contextual) ads only
- Cookie consent banner included for EU/US/global compliance

### Growth Strategy
- **Gradual content expansion** to avoid being flagged as low-effort by Google
- Phase-based rollout: start with ~70 pages, expand to 150-200 over time
- Focus on quality tools that provide real value → encourages return visits and shares

---

## Phase 1: MVP (COMPLETED ✅)

### Tools Built (5/5)
| Tool | URL | Status |
|------|-----|--------|
| BPM Delay Calculator | `/tools/bpm-delay` | ✅ Complete |
| Bars to Time Calculator | `/tools/bars-to-time` | ✅ Complete |
| Tap Tempo | `/tools/tap-tempo` | ✅ Complete |
| Camelot Key Compatibility | `/tools/camelot` | ✅ Complete |
| BPM Transition Helper | `/tools/bpm-transition` | ✅ Complete |

### Programmatic SEO Pages
| Type | Count | Status |
|------|-------|--------|
| BPM pages (e.g., `/bpm/128`) | 20 | ✅ Complete |
| Bars pages (e.g., `/bars/32-at-128-bpm`) | 10 | ✅ Complete |
| Camelot pages (e.g., `/camelot/8a`) | 24 | ✅ Complete |
| **Total programmatic pages** | **54** | ✅ Complete |

### Hub Pages
- `/bpm` - BPM reference hub ✅
- `/bars` - Duration reference hub ✅
- `/camelot` - Key reference hub ✅
- `/guides` - Guides landing page ✅

### Guide Pages (3/3)
| Guide | URL | Status |
|-------|-----|--------|
| Delay Times Explained | `/guides/delay-times-explained` | ✅ Complete |
| Camelot Wheel Guide | `/guides/camelot-wheel-guide` | ✅ Complete |
| BPM Genre Reference | `/guides/bpm-genres` | ✅ Complete |

### Static Pages
- Homepage (`/`) ✅
- About (`/about`) ✅
- Contact (`/contact`) ✅
- Privacy & Cookie Policy (`/privacy`) ✅

### Infrastructure
- [x] Sitemap.xml (auto-generated at `/sitemap.xml`)
- [x] Robots.txt (at `/robots.txt`)
- [x] Structured data (FAQ schema, WebApplication schema)
- [x] SEO metadata on all pages (titles, descriptions, Open Graph, Twitter cards)
- [x] Canonical URLs
- [x] Cookie consent banner with localStorage persistence
- [x] AdSense scaffolding (ready for publisher ID)
- [x] Google Analytics scaffolding (ready for measurement ID)
- [x] Dark/light mode theming
- [x] Mobile-responsive design
- [x] Favicon (music note icon)

### Phase 1 Total Page Count: ~68 pages

---

## Phase 2: Expand Coverage (PENDING)

### Goals
- Expand content gradually to look organic to Google
- Target 150-200 total pages

### Remaining Tasks

#### 1. Expand BPM Pages
- **Current:** 20 pages (hand-picked popular BPMs)
- **Target:** 71 pages (60-200 BPM, step of 2)
- **Action:** Update `src/data/bpm-list.json` with expanded list

#### 2. Expand Bars Pages
- **Current:** 10 pages
- **Target:** 50+ pages
- **Action:** Update `src/data/bars-list.json` with more combinations

#### 3. Add More Guides
- **Current:** 3 guides
- **Target:** 8 guides (add 5 more)
- **Suggested topics:**
  - "How to Use Tap Tempo Effectively"
  - "Understanding Time Signatures for Producers"
  - "Sync Your DAW Effects to BPM"
  - "Beatmatching Basics for Beginner DJs"
  - "Using Key Detection Software"

#### 4. Phase 2 Rollout Strategy
- Add pages in batches of 20-30
- Wait for Google to index before adding more
- Monitor Search Console for any issues

---

## Phase 3: Future Enhancements (IDEAS)

These are potential future additions, not committed:

- [ ] User accounts for saving preferences
- [ ] More advanced tools (key detection, waveform analysis)
- [ ] API for developers
- [ ] Embeddable widget versions of tools
- [ ] Community features (comments, user submissions)
- [x] Affiliate integrations (DJ / studio equipment) - shipped as the Studio
      Setup Builder; affiliate accounts still pending. Plan, current status and
      remaining steps live in `docs/studio-builder-plan.md`.

---

## Environment Variables

Create a `.env.local` file in the project root:

```env
# Google Analytics 4 Measurement ID
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Google AdSense Publisher ID (after approval)
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXXXXXXXXXX
```

---

## Deployment Checklist

### Before Deploying
- [ ] Get GA4 Measurement ID from [analytics.google.com](https://analytics.google.com)
- [ ] Add GA4 ID to `.env.local`
- [ ] Set up Google Search Console for tunetapper.com

### Deploying to Vercel
1. Push code to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Add custom domain `tunetapper.com`
5. Configure DNS at domain registrar

### After Deploying
- [ ] Verify site in Google Search Console
- [ ] Submit sitemap: `https://tunetapper.com/sitemap.xml`
- [ ] Apply for Google AdSense (wait until site has traffic)
- [ ] Add AdSense Publisher ID after approval

---

## Project Structure

```
tunetapper/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Homepage
│   │   ├── tools/               # 5 interactive tools
│   │   ├── bpm/                 # BPM hub + programmatic pages
│   │   ├── bars/                # Bars hub + programmatic pages
│   │   ├── camelot/             # Camelot hub + programmatic pages
│   │   ├── guides/              # Guides hub + guide pages
│   │   ├── about/
│   │   ├── contact/
│   │   ├── privacy/
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── tools/               # Tool-specific components
│   │   ├── layout/              # Header, Footer, ThemeToggle
│   │   ├── ads/                 # AdSense components
│   │   └── cookie-consent/      # Cookie banner
│   ├── data/                    # JSON data for page generation
│   └── lib/                     # Utilities (calculations, SEO, Camelot logic)
├── .env.local                   # Environment variables (not in git)
├── package.json
└── PROJECT-STATUS.md            # This file
```

---

## Key Files for Content Expansion

| File | Purpose |
|------|---------|
| `src/data/bpm-list.json` | BPM values for programmatic pages |
| `src/data/bars-list.json` | Bars/BPM combinations |
| `src/data/camelot-keys.json` | Camelot key list |
| `src/data/guides.json` | Guide metadata |
| `src/app/guides/[slug]/page.tsx` | Guide content (inline) |

---

## Commands

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Clear Next.js cache
Remove-Item -Recurse -Force .next
```

---

## Last Updated

**Date:** February 2026  
**Phase:** 1 Complete, Phase 2 Pending  
**Total Pages:** ~68

> **This file is out of date.** It was last revised in February 2026 and does not
> describe several tools shipped since: the rhythm test, the microphone BPM
> detector, the key + BPM analyzer, the embeddable tap-tempo widget, or the
> studio setup builder. The build now generates ~87 static pages, not 68.
>
> Treat the per-feature documents as authoritative until this is rewritten:
> `docs/studio-builder-plan.md` (affiliate tool, current status and next steps),
> `GROWTH-PLAN.md` (traffic strategy), `docs/local-dev.md`, `docs/image-credits.md`.
