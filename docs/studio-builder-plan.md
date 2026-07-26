# Studio Setup Builder - Plan (issue #31)

Affiliate-monetized interactive tool: enter a budget, use case, and constraints;
get a curated studio setup with merchant links. Revenue comes from affiliate
commissions on outbound clicks - no display ads involved.

## Why this over more AdSense surface

- Affiliate pays at low traffic: one converted ~600 euro basket at 3-4% commission
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
3. **Never fabricate a price.** Every price in the catalog was read off a
   merchant's own product page, and carries the merchant and date that confirmed
   it. The handful that could not be confirmed are marked
   `"priceSource": "estimate"` and the UI labels them as estimated.
4. **Only recommend what the launch merchants actually stock.** Availability is
   per-merchant; see below.
5. **Disclosure everywhere links render.** FTC / EU consumer rules require
   clear affiliate disclosure adjacent to the links.

## Currency and per-merchant pricing

The canonical currency is **EUR**, because Thomann and Gear4music are the launch
merchants. Prices include VAT and were checked against `thomann.ie` (English
language, EUR pricing).

Each item lists only the merchants that genuinely sell it:

```jsonc
"merchants": {
  "thomann":    { "slug": "sennheiser_hd_25.htm", "priceEur": 119, "verified": "2026-07-26" },
  "gear4music": { "path": "PA-DJ-and-Lighting/Sennheiser-HD-25-Headphones/1GCI" },
  "amazon":     { "search": "Sennheiser HD 25" }
}
```

- `slug` / `path` deep-link to the product page; `search` is the fallback and
  still tracks and pays commission.
- `priceEur` is that merchant's own price for **one unit**. Where two merchants
  both have a known price and they differ, the UI says so and highlights the
  cheaper one.
- Thomann links use `/intl/`, which geo-redirects each visitor to their local
  storefront and currency. Amazon links are marketplace-specific because
  Associates tags are per-marketplace - set `NEXT_PUBLIC_AMAZON_HOST`.

**Known availability gaps found while building the catalog:**

- Thomann does not stock Pioneer DJ / AlphaTheta hardware, only cases and
  accessories for it. The DDJ-FLX4, FLX6-GT and FLX10 are therefore
  Gear4music + Amazon only, and are the three items with estimated prices.
- Gear4music sits behind a bot challenge, so their prices could not be read
  programmatically. Their `priceEur` values are absent rather than guessed.

### Quantities

Most studio monitors are sold **per piece**, so a usable stereo pair costs twice
the listed price. Those items carry `"qty": 2` and the UI shows both the pair
total and the per-unit price. Compact desktop systems (PreSonus Eris 3.5, IK
iLoud Micro / MTM MkII, ADAM D3V) ship as a pair and carry `"qty": 1` with
`"unitLabel": "pair"`. Monitor cables are also `qty: 2` - one per speaker.

## Allocator behaviour

Roles, in display order: headphones, monitors, interface, controller,
midi-keyboard, mic, mic-stand, cables, monitor-isolation, acoustic-treatment.

- **Use case is a hard filter.** `useCases` on an item gates eligibility. This is
  what stops a DJ build being handed an open-back mixing headphone, which is a
  better headphone and completely wrong in a booth.
- **Dependent roles.** `mic-stand` requires a mic, `monitor-isolation` requires
  monitors, `cables` requires either. They are evaluated after the core roles,
  and the allocator **reserves** the cheapest option for each of them up front so
  a core-role upgrade can never leave you with a mic and no cable.
- **Small / shared room** restricts monitors to compact designs, shifts budget
  from monitors to headphones, and increases the treatment weight.
- **Fill before upgrade.** Leftover money first fills roles that had to be
  skipped (most important first), and only then upgrades existing picks.
- **Budget range** is 200-5000 EUR. Above roughly this range the catalog runs out
  of things it is willing to recommend for a home setup, so the UI explains the
  leftover instead of silently under-spending.

Verified by sweeping every budget in 10 EUR steps across all use-case and
constraint combinations: zero budget overruns, zero open-back headphones in DJ
builds, and every catalog item reachable except the Neumann KH 150, which only
appears as an upgrade suggestion.

## Maintenance

- `node scripts/gear-price-check.mjs` re-reads every Thomann price in a real
  browser and reports drift; `--write` applies it and bumps `priceCheckedAt`.
  Needs `pnpm add -D playwright-core` and `npx playwright install chromium`.
  It is deliberately slow and sequential - do not parallelise it.
- Quarterly: run the check, then eyeball for discontinued items.
- Watch `affiliate_link_clicked` by merchant to decide which affiliate
  programs are worth keeping.

## Phase 2 - SEO surface (quality, not scale)

5-6 substantial editorial pages, each embedding the builder with a preset:
under 500 / 1000 / 2000 euro home studio, first DJ setup, bedroom producer kit.
These are real guide pages, not programmatic leaves - the /bars experiment
proved thin answer pages get zero-clicked. Add the builder to llms.txt
(AI assistants recommending "how do I start DJing on a budget" is a natural
referral path).

## Phase 3 - Affiliate accounts (human steps, in order)

1. **Awin** - covers Gear4music and Thomann (Thomann matters for EU traffic).
   Publisher signup takes a small refundable deposit, and each advertiser is
   approved separately, so the builder should be live on production first.
   Once approved, set:
   - `NEXT_PUBLIC_AWIN_AFFID`
   - `NEXT_PUBLIC_AWIN_MID_GEAR4MUSIC`
   - `NEXT_PUBLIC_AWIN_MID_THOMANN`

   These are `NEXT_PUBLIC_*` and inlined at build time, so a redeploy is needed.
   They are not secrets - they appear in every outbound link. The Awin account
   password and API key are, and belong nowhere near the repo.
2. **Awin product datafeed** - the supported way to get Gear4music prices and
   deep links in bulk, plus real per-merchant price comparison. This is what
   finally fills the empty `gear4music.priceEur` fields and replaces the three
   estimated Pioneer DJ prices.
3. **Plugin Boutique** - software/plugins; no stock/shipping issues and the
   producer audience converts well on it.
4. **Amazon Associates last** - the account is closed if it doesn't produce
   3 qualifying sales within 180 days, so only apply once the builder has
   real traffic (post-launch). Set `NEXT_PUBLIC_AMAZON_ASSOC_TAG` and
   `NEXT_PUBLIC_AMAZON_HOST` for the right marketplace.

## Phase 4 - Optional AI layer (only if Phase 1 gets usage)

"Explain my build" / free-text refinement ("I already own headphones, mostly
techno") via a small model that can only re-rank the curated catalog. Adds
personality without hallucination risk or meaningful cost.

## Non-goals

- Exhaustive gear database or price-comparison engine.
- Live price scraping at request time (ToS risk; the datafeed is the answer).
- Programmatic per-budget pages ("studio setup for 637 euros") - thin-page trap.
- Thomann and Gear4music house brands (t.bone, Harley Benton, SubZero, G4M):
  each is exclusive to one retailer, which breaks per-merchant comparison.
