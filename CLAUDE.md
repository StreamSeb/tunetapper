# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What TuneTapper is

TuneTapper (https://tunetapper.com) is a free site of music production tools for DJs and producers: tap tempo, BPM/delay and bar-length calculators, a Camelot wheel, a studio gear builder, plus guides and programmatic SEO pages. It is a solo project. Traffic comes almost entirely from Google Search, so GA4 and Search Console data drive most decisions. The GitHub repo is **public**.

## Rules for every session (including unattended ones)

Sessions may run unattended on the mini-PC through Remote Control, started from a claude.ai project, with nobody watching the terminal. These rules apply whether or not anyone is watching:

1. **Never deploy without asking.** No `vercel deploy`, `vercel --prod`, promotions, rollbacks, or changes to Vercel project settings, env vars or domains. Treat any push to `main` as a production deploy.
2. **Never push to `main` without asking.** That covers `git push` on `main`, merging a PR into `main`, and force-pushes anywhere. Work on a branch and push the branch; open a PR if the work should land. If nobody is there to ask, stop at the pushed branch and say so in your final message.
3. **Never print secrets.** Do not `cat`, `echo`, `grep` or otherwise display values from `.env*`, `~/.tunetapper.env`, `service-account-key.json`, or `printenv`/`env` output. To check configuration, print key *names* and whether each is set. Never put secret values in a commit, report, issue, PR or chat message. `GA4_PROPERTY_ID` counts as a value not to print.
4. **Don't commit ignored files** (`.env*`, `service-account-key.json`, `reports/`) to this repo, on any branch, and never use `git add -f`. Every branch of a public repo is public.
5. **Leave other work alone.** The working tree is shared between sessions and may hold someone else's uncommitted changes. Don't stash, reset, checkout over, or commit changes you didn't make.
6. If a rule blocks the task, stop and report what is blocked. Don't look for a way around it.
7. **Design changes go through the `design-options` skill** (`.claude/skills/design-options/`): three options as screenshots, Seb picks, nothing is built on a timeout. `client-design` and `site-rebuild` are for client leads and don't apply here. Screenshots never go in this repo; if they can't be shown inline they go to the private `tunetapper-reports` repo under `design/<topic>/`.

## Commands

```bash
pnpm dev        # Start dev server with Turbopack (http://localhost:3000)
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # Run ESLint
```

There are no tests. Clear the Next.js cache with `rm -rf .next` if you encounter stale build issues.

Reaching the dev server on anything other than `localhost` (a tailnet or LAN hostname) requires setting `DEV_ORIGINS` in `.env.local`, or the page loads but never hydrates. See `docs/local-dev.md`.

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

## Data and analytics scripts

All scripts are plain Node ESM in `scripts/`. Run them from the repo root (the credentials path is relative to it):

```bash
node --env-file-if-exists=.env.local scripts/<name>.mjs
```

Remote Control sessions on the mini-PC already inherit the variables from `~/.tunetapper.env`; elsewhere they come from `.env.local`. The flag above works in both cases and never overrides variables that are already set.

| Variable | Meaning |
|---|---|
| `GA4_PROPERTY_ID` | Numeric GA4 property ID. Required by the GA4 scripts. |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to the Google service-account JSON key (read-only GA4 + Search Console access). Required by every Google script. |
| `GSC_SITE_URL` | Search Console property. Optional, defaults to `https://tunetapper.com`. |
| `ANTHROPIC_API_KEY` | Only for `agents/weekly-analytics.mjs`. Deliberately **not** in `~/.tunetapper.env`; pass it for that one run. |
| `ANTHROPIC_MODEL` | Optional model override for `agents/weekly-analytics.mjs`. |
| `GH_TOKEN` | Used by the `agents/` scripts in GitHub Actions. Locally they use the existing `gh auth login`. |
| `CHROME_PATH` | Optional browser path for `og-card.mjs`. |

Search Console data lags about 3 days, so every GSC window ends 3 days ago. See `ANALYTICS-SETUP.md` for how the credentials were created.

### Report scripts (read-only, safe to run unattended)

| Script | What it fetches | Needs | Output |
|---|---|---|---|
| `fetch-analytics.mjs` | GA4: last 30 days vs the 30 before (overview, top 20 pages, channels, custom events incl. Buy Me a Coffee clicks). GSC: 28-day summary, top 25 queries, top 25 pages, low-CTR opportunities, sitemap index coverage. | `GA4_PROPERTY_ID`, `GOOGLE_APPLICATION_CREDENTIALS`, `GSC_SITE_URL` | Overwrites `reports/analytics-snapshot.md` |
| `bars-trend.mjs` | GSC weekly impressions and clicks for the whole site vs `/bars*`, about 10 weeks. | `GOOGLE_APPLICATION_CREDENTIALS`, `GSC_SITE_URL` | stdout |
| `tap-tempo-report.mjs` | GSC, about 90 days, for pages containing `tap-tempo`: per-page totals, queries, weekly trend. | same | stdout |
| `page-survival.mjs` | GSC per-page impressions: fixed baseline 2026-04-22..2026-05-05 (before the May 2026 core update) vs the latest 14 days. | same | stdout |
| `inspect-urls.mjs` | GSC URL Inspection (index verdict, coverage, last crawl, canonical) for five URLs hard-coded in the file. | same | stdout |

`reports/` stays gitignored here. Dated reports (`reports/YYYY-MM-DD.md`) are written by the `analytics-report` skill and published only to the private repo `StreamSeb/tunetapper-reports` (cloned at `~/repos/tunetapper-reports`), where the skill commits the one report file and pushes to that repo's `main`; that push is the skill's standing permission and is not covered by rule 2. Because that repo is private a report may include traffic figures, but still never secrets, the GA4 property ID or credentials paths.

### Scripts with side effects (do not run unattended unless the task says so)

| Script | What it does | Needs | Side effects |
|---|---|---|---|
| `agents/weekly-analytics.mjs` | Fetches GA4 + GSC metrics, diffs against `.github/agent-state/analytics.json`, asks Claude which signals deserve a GitHub issue. Runs Mondays 08:00 UTC in `.github/workflows/weekly-analytics.yml`, which commits the state file to `main` as "chore(agent): update analytics baseline". | `GA4_PROPERTY_ID`, `GOOGLE_APPLICATION_CREDENTIALS`, `ANTHROPIC_API_KEY`, `gh` auth | Opens issues labelled `analytics-bot` and rewrites the state file. Locally always add `--dry-run`, which does neither. |
| `agents/nightly-maintenance.mjs` | `pnpm audit` for high/critical vulnerabilities and a forbidden-licence check on production deps. No Google or Anthropic access. | `gh` auth | Opens issues labelled `nightly-maintenance`. Locally add `--dry-run`. |
| `gear-price-check.mjs` | Loads Thomann product pages in a headless browser and compares prices with `src/data/gear.json`. | `playwright-core` + Chromium (not project dependencies) | `--write` edits `gear.json`. Don't run it unattended: it scrapes a merchant site, and the Awin datafeed is the intended price source (`docs/studio-builder-plan.md`). |
| `og-card.mjs` | Not a data script: renders a 1200x630 OG image from the running dev server. | `playwright-core`, dev server on :3000, optional `CHROME_PATH` | Writes into `public/og/`. |

## Project Roadmap

See `PROJECT-STATUS.md` for the full phase breakdown, completed work, and Phase 2 expansion tasks (BPM/bars page targets, guide topics, rollout strategy).
