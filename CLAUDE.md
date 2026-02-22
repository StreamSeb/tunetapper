# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # Start dev server with Turbopack (http://localhost:3000)
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

There are no tests. Clear the Next.js cache with `rm -rf .next` if you encounter stale build issues.

## Architecture Overview

TuneTapper is a Next.js 16 App Router site offering free music production tools and programmatic SEO pages targeting DJs and producers. It is monetized via Google AdSense (consent-gated) and uses Vercel Analytics.

### URL Structure

| Route type | Example | Generated from |
|---|---|---|
| Interactive tools | `/tools/bpm-delay` | Static pages |
| Programmatic BPM | `/bpm/128` | `src/data/bpm-list.json` → `phase1[]` |
| Programmatic bars | `/bars/32-at-128-bpm` | `src/data/bars-list.json` → `phase1[]` |
| Programmatic Camelot | `/camelot/8a` | `src/data/camelot-keys.json` → `keys[]` |
| Guides | `/guides/camelot-wheel-guide` | `src/data/guides.json` → `guides[].slug` |
| Hub pages | `/bpm`, `/bars`, `/camelot`, `/guides` | Static pages |

### Programmatic SEO Pattern

Every dynamic route uses `generateStaticParams()` reading from `src/data/*.json` and `generateMetadata()` delegating to helpers in `src/lib/seo.ts`. Adding a new programmatic page means:
1. Add the value to the relevant JSON file
2. The sitemap (`src/app/sitemap.ts`) and static params auto-update — no other changes needed.

### Key Directories

- **`src/lib/`** — Pure utilities: `calculations.ts` (delay/bar math), `camelot.ts` (Camelot wheel logic), `seo.ts` (metadata + JSON-LD schema factories), `utils.ts` (`cn()` helper), `analytics.ts`
- **`src/components/tools/`** — Client-side interactive tool components (one per tool page)
- **`src/components/ads/`** — `Analytics` (GA4, consent-gated), `AdSlot` (AdSense), `AdsenseScript`
- **`src/components/cookie-consent/`** — Cookie banner; persists choice in localStorage and dispatches a `consentChanged` CustomEvent that the `Analytics` component listens to
- **`src/app/guides/[slug]/page.tsx`** — Guide content lives as inline JSX here (not in data files); `guides.json` only holds metadata (slug, title, description, category)

### SEO Conventions

All pages inject structured data via `<script type="application/ld+json">`. Use the schema factories from `src/lib/seo.ts`:
- `generateMetadata()` — base metadata + OG + Twitter + canonical
- `generateFaqSchema()`, `generateToolSchema()`, `generateBreadcrumbSchema()`, `generateOrganizationSchema()`

Breadcrumbs are rendered with `<Breadcrumbs items={[...]} />` from `src/components/layout/breadcrumbs.tsx`.

### Theming

`next-themes` with `attribute="class"`. Use `var(--muted-foreground)` and other CSS variables rather than hardcoded Tailwind color classes to ensure dark/light mode compatibility.

### Environment Variables

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX           # GA4 — only loads after cookie consent
NEXT_PUBLIC_ADSENSE_ID=ca-pub-XXXXXXXX   # AdSense publisher ID
```

Vercel Analytics loads unconditionally (no PII, no consent needed).
