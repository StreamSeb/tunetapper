# Studio Setup Builder - Plan (issue #31)

Affiliate-monetized interactive tool: enter a budget, use case, and constraints;
get a curated studio setup with merchant links. Revenue comes from affiliate
commissions on outbound clicks - no display ads involved.

## Why this over more AdSense surface

- Affiliate pays at low traffic: one converted ~$600 basket at 3-4% commission
  out-earns a month of display ads at current session volume.
- High commercial intent audience: people using a key analyzer and Camelot
  wheel are buying controllers, monitors, and headphones.
- Matches the GROWTH-PLAN.md thesis: interactive tools survive AI-answer
  absorption; static "best budget studio" listicles are exactly what AI
  overviews are eating (confirmed by the /bars zero-click experiment).

## Design principles

1. **AI is not the picker.** Recommendations come from a hand-curated dataset
   (`src/data/gear.json`) and a deterministic budget allocator
   (`src/lib/studio-builder.ts`). No hallucinated products, no per-visit API
   cost, instant results. An AI layer may later *explain* builds (Phase 4),
   selecting only from the curated catalog.
2. **Never exceed the budget.** Roles that don't fit are skipped with an
   explanatory note rather than blowing past the number.
3. **Prices are approximate by design.** Street prices drift and Amazon ToS
   forbids displaying stale exact prices; the UI shows "~$X" and links out
   for the live price. Quarterly dataset review keeps picks current.
4. **Disclosure everywhere links render.** FTC / EU consumer rules require
   clear affiliate disclosure adjacent to the links.

## Phase 1 - Builder MVP (this PR)

- `src/data/gear.json` - ~30 hand-picked items across six roles (headphones,
  monitors, interface, controller, midi-keyboard, mic), each with approximate
  USD street price, tier, tags, one-line "why", and per-merchant search terms.
- `src/lib/studio-builder.ts` - budget allocator: role weights per use case
  (DJ / producer / hybrid), constraint handling (small room, vocals,
  already-owned gear), cheaper/pricier alternative per slot.
- `src/components/tools/studio-builder-tool.tsx` + `/tools/studio-builder`
  page following existing tool conventions.
- `src/lib/affiliate.ts` - merchant URL builder. Ships as plain search URLs;
  when env vars are set, Amazon links get the Associates tag and
  Gear4music/Thomann links are wrapped in Awin deeplinks:
  - `NEXT_PUBLIC_AMAZON_ASSOC_TAG` - Amazon Associates tracking ID
  - `NEXT_PUBLIC_AWIN_AFFID` - Awin publisher ID
  - `NEXT_PUBLIC_AWIN_MID_GEAR4MUSIC` / `NEXT_PUBLIC_AWIN_MID_THOMANN` -
    Awin merchant IDs
- GA4 events: `studio_build_generated` (budget, use_case) and
  `affiliate_link_clicked` (merchant, item_id). The latter is the revenue
  metric; register both params as custom dimensions in GA4.

## Phase 2 - SEO surface (quality, not scale)

5-6 substantial editorial pages, each embedding the builder with a preset:
under $500 / $1000 / $2000 home studio, first DJ setup, bedroom producer kit.
These are real guide pages, not programmatic leaves - the /bars experiment
proved thin answer pages get zero-clicked. Add the builder to llms.txt
(AI assistants recommending "how do I start DJing on a budget" is a natural
referral path).

## Phase 3 - Affiliate accounts (human steps, in order)

1. **Awin** - covers Gear4music and Thomann (Thomann matters for EU traffic).
2. **Plugin Boutique** - software/plugins; no stock/shipping issues and the
   producer audience converts well on it.
3. **Amazon Associates last** - the account is closed if it doesn't produce
   3 qualifying sales within 180 days, so only apply once the builder has
   real traffic (post-launch).

## Phase 4 - Optional AI layer (only if Phase 1 gets usage)

"Explain my build" / free-text refinement ("I already own headphones, mostly
techno") via a small model that can only re-rank the curated catalog. Adds
personality without hallucination risk or meaningful cost.

## Maintenance

- Quarterly: re-check prices/availability in gear.json, swap discontinued
  items. The dataset is deliberately small (~30 SKUs) to keep this cheap.
- Watch `affiliate_link_clicked` by merchant to decide which affiliate
  programs are worth keeping.

## Non-goals

- Exhaustive gear database or price-comparison engine.
- Live price scraping (ToS risk; PA-API needs an earning Associates account).
- Programmatic per-budget pages ("studio setup for $637") - thin-page trap.
