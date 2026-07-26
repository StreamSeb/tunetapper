/**
 * Re-checks the studio builder's gear prices against Thomann and reports drift.
 *
 * The catalog in src/data/gear.json carries a `verified` date per merchant price.
 * This script reloads each item's Thomann product page in a real browser (their
 * search listings and product pages are JS-rendered, and plain HTTP fetches get
 * rate-limited or blocked), compares the live price, and prints a diff.
 *
 * Usage:
 *   pnpm add -D playwright-core          # once
 *   npx playwright install chromium      # once
 *   node scripts/gear-price-check.mjs            # report only
 *   node scripts/gear-price-check.mjs --write    # also update gear.json in place
 *
 * Gear4music sits behind a bot challenge and cannot be checked this way. Once the
 * Awin publisher account is live, their product datafeed is the supported source
 * for Gear4music prices and deep links - see docs/studio-builder-plan.md.
 */

import { readFileSync, writeFileSync } from "fs"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const GEAR_PATH = join(ROOT, "src/data/gear.json")
const WRITE = process.argv.includes("--write")

let chromium
try {
  ;({ chromium } = await import("playwright-core"))
} catch {
  console.error(
    "playwright-core is not installed.\n" +
      "  pnpm add -D playwright-core && npx playwright install chromium"
  )
  process.exit(1)
}

const gear = JSON.parse(readFileSync(GEAR_PATH, "utf8"))
const targets = gear.items.filter((i) => i.merchants?.thomann?.slug)
console.log("Checking %d of %d items against Thomann...\n", targets.length, gear.items.length)

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] })
const ctx = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  // Ireland is English-language and prices in EUR, matching the catalog.
  locale: "en-IE",
  timezoneId: "Europe/Dublin",
  viewport: { width: 1440, height: 1000 },
})
const page = await ctx.newPage()
await page.route("**/*", (r) =>
  ["image", "font", "media"].includes(r.request().resourceType()) ? r.abort() : r.continue()
)

const today = new Date().toISOString().slice(0, 10)
const changed = []
const failed = []

for (const item of targets) {
  const listing = item.merchants.thomann
  const url = `https://www.thomann.ie/${listing.slug}`
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 })
    await page.waitForTimeout(900)
    const raw = await page.evaluate(() => {
      const el =
        document.querySelector(".price-group__primary") ||
        document.querySelector("[class*='price-primary']") ||
        document.querySelector(".price")
      return el?.textContent?.replace(/\s+/g, " ").trim() ?? null
    })
    const live = parsePrice(raw)
    if (live == null) {
      failed.push({ id: item.id, reason: `could not parse price (saw ${JSON.stringify(raw)})` })
    } else {
      const was = listing.priceEur
      const delta = was != null ? live - was : null
      const moved = was == null || Math.abs(delta) >= 0.01
      console.log(
        "%s %s  was %s  now %s%s",
        moved ? "~" : " ",
        item.id.padEnd(26),
        was == null ? "  -  " : String(was).padStart(7),
        String(live).padStart(7),
        delta ? `  (${delta > 0 ? "+" : ""}${round2(delta)})` : ""
      )
      if (moved) changed.push({ item, listing, was, live })
      listing.priceEur = live
      listing.verified = today
    }
  } catch (e) {
    failed.push({ id: item.id, reason: String(e).slice(0, 100) })
    console.log("! %s  %s", item.id.padEnd(26), String(e).slice(0, 60))
  }
  // Be a polite guest: one page at a time, with a pause.
  await sleep(1600 + Math.random() * 1400)
}

await browser.close()

console.log("\n%d price change(s), %d failure(s)", changed.length, failed.length)
for (const f of failed) console.log("  FAILED %s - %s", f.id, f.reason)

// The allocator budgets on unitPriceEur, so flag where it no longer matches the
// merchant price rather than silently rewriting the build maths.
const drifted = changed.filter(({ item, live }) => Math.abs(item.unitPriceEur - live) >= 1)
if (drifted.length) {
  console.log("\nunitPriceEur now differs from Thomann by 1 EUR or more:")
  for (const { item, live } of drifted) {
    console.log("  %s  catalog %s  Thomann %s", item.id.padEnd(26), item.unitPriceEur, live)
  }
}

if (WRITE) {
  if (drifted.length) {
    for (const { item, live } of drifted) item.unitPriceEur = live
  }
  gear.priceCheckedAt = today
  writeFileSync(GEAR_PATH, JSON.stringify(gear, null, 2) + "\n")
  console.log("\nWrote %s", GEAR_PATH)
} else if (changed.length || drifted.length) {
  console.log("\nRe-run with --write to apply these to gear.json.")
}

function parsePrice(text) {
  if (!text) return null
  // Thomann renders e.g. "€1,444" or "€17.90"; take the first amount only.
  const m = text.match(/(\d[\d.,]*)/)
  if (!m) return null
  const n = Number(m[1].replace(/,/g, ""))
  return Number.isFinite(n) ? n : null
}

function round2(n) {
  return Math.round(n * 100) / 100
}
