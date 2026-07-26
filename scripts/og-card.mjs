/**
 * Regenerates a branded 1200x630 OG card into public/og/.
 *
 * The original 11 cards were composed by hand and no generator survived, so
 * this reproduces that layout from measurements taken off public/og/rhythm-game.png.
 * Geometry and colours below are sampled values - change them only if you intend
 * every future card to differ from the existing ones.
 *
 * Needs a browser and playwright-core, neither of which is a project dependency:
 *
 *   npm install --no-save playwright-core
 *   node scripts/og-card.mjs \
 *     --slug studio-builder \
 *     --title "Studio Setup Builder" \
 *     --subtitle "Turn a budget into a complete studio - hand-picked gear." \
 *     --path /tools/studio-builder
 *
 * Assumes the dev server is running on :3000.
 */
import { chromium } from "playwright-core"
import { mkdtemp, writeFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "/home/streamseb/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome",
]

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`)
  if (i === -1) {
    if (fallback === undefined) throw new Error(`missing --${name}`)
    return fallback
  }
  return process.argv[i + 1]
}

const slug = arg("slug")
const title = arg("title")
const subtitle = arg("subtitle")
const pagePath = arg("path")
const origin = arg("origin", "http://localhost:3000")

const executablePath = CHROME_CANDIDATES.find(Boolean)

const browser = await chromium.launch({
  executablePath,
  args: ["--no-sandbox", "--disable-gpu", "--font-render-hinting=none"],
})

// --- 1. Screenshot the live page, dark, with no consent banner ---------------
// 1120 rather than 1280: scaled into the 720px-wide mockup this matches the
// on-card text size of the original cards. Still wide enough for desktop nav.
const ctx = await browser.newContext({
  viewport: { width: 1120, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: "dark",
})
await ctx.addInitScript(() => {
  localStorage.setItem("tunetapper_cookie_consent", "accepted")
  localStorage.setItem("theme", "dark")
})
const page = await ctx.newPage()
await page.goto(origin + pagePath, { waitUntil: "networkidle" })
await page.waitForFunction(
  () => Array.from(document.images).every((i) => i.complete && i.naturalWidth > 0),
  null,
  { timeout: 15000 }
)
await page.waitForTimeout(400)
const shot = await page.screenshot()
await ctx.close()

// --- 2. Compose the card ----------------------------------------------------
const work = await mkdtemp(join(tmpdir(), "og-"))
const shotPath = join(work, "shot.png")
await writeFile(shotPath, shot)

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

const html = `<!doctype html><meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; position: relative; overflow: hidden;
    font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    background: #0b0d12;
  }
  /* The original cards hold a broad flat purple across the top-left, then fall
     off steeply to the right and bottom - not a plain sweep. Two masks
     intersected reproduce that plateau; the mockup's own shadow supplies the
     extra darkening just left of the browser frame. */
  .glow {
    position: absolute; inset: 0; background: #2e1e55;
    -webkit-mask-image:
      linear-gradient(to right, #000 0 36%, rgba(0,0,0,.6) 54%, transparent 74%),
      linear-gradient(to bottom, #000 0 34%, rgba(0,0,0,.42) 55%, transparent 76%);
    -webkit-mask-composite: source-in;
    mask-image:
      linear-gradient(to right, #000 0 36%, rgba(0,0,0,.6) 54%, transparent 74%),
      linear-gradient(to bottom, #000 0 34%, rgba(0,0,0,.42) 55%, transparent 76%);
    mask-composite: intersect;
  }
  /* faint engineering grid, same as the existing cards */
  .grid {
    position: absolute; inset: 0;
    background-image:
      repeating-linear-gradient(to right, rgba(190,180,255,.055) 0 1px, transparent 1px 40px),
      repeating-linear-gradient(to bottom, rgba(190,180,255,.045) 0 1px, transparent 1px 40px);
    -webkit-mask-image: linear-gradient(150deg, #000 0%, rgba(0,0,0,.35) 55%, transparent 80%);
  }
  .logo { position: absolute; left: 64px; top: 58px; display: flex; align-items: center; gap: 14px; }
  .logo svg { width: 34px; height: 34px; }
  .logo span { font-size: 30px; font-weight: 700; color: #fff; letter-spacing: -.01em; }
  /* Stacked rather than absolutely placed: titles that wrap to two lines push
     the subtitle and badges down instead of colliding with them. Tuned so a
     one-line title still lands where the original cards put it. */
  .left {
    position: absolute; left: 64px; top: 168px; width: 505px;
    display: flex; flex-direction: column; align-items: flex-start; gap: 26px;
  }
  h1 {
    font-size: 64px; line-height: 1.06; font-weight: 800; color: #fff;
    letter-spacing: -.025em;
  }
  .sub {
    width: 470px;
    font-size: 29px; line-height: 1.24; color: #b6bcc9; font-weight: 400;
  }
  .badges { display: flex; gap: 14px; }
  .badge {
    height: 40px; padding: 0 20px; border-radius: 999px;
    border: 1.5px solid #584985; color: #c4b0fb;
    font-size: 17px; font-weight: 600;
    display: flex; align-items: center;
  }
  .domain {
    position: absolute; left: 64px; top: 549px;
    font-size: 23px; font-weight: 600; color: #7c8494;
  }
  .mock {
    position: absolute; left: 582px; top: 132px; width: 720px; height: 560px;
    border-radius: 12px 0 0 0; overflow: hidden;
    background: #1a1d24; box-shadow: 0 24px 70px rgba(0,0,0,.55);
  }
  .bar { height: 41px; display: flex; align-items: center; padding: 0 16px; gap: 8px; background: #1a1d24; }
  .dot { width: 12px; height: 12px; border-radius: 50%; }
  .url {
    margin-left: 10px; height: 25px; flex: 1; border-radius: 6px; background: #2a2d33;
    display: flex; align-items: center; padding: 0 12px;
    font-size: 14px; color: #c6cad2;
  }
  .mock img { display: block; width: 720px; }
</style>
<div class="glow"></div>
<div class="grid"></div>

<div class="logo">
  <svg viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
  <span>TuneTapper</span>
</div>

<div class="left">
  <h1>${esc(title)}</h1>
  <div class="sub">${esc(subtitle)}</div>
  <div class="badges">
    <div class="badge">100% Free</div>
    <div class="badge">No signup</div>
    <div class="badge">In your browser</div>
  </div>
</div>

<div class="domain">tunetapper.com</div>

<div class="mock">
  <div class="bar">
    <div class="dot" style="background:#ff5f57"></div>
    <div class="dot" style="background:#febc2e"></div>
    <div class="dot" style="background:#28c840"></div>
    <div class="url">tunetapper.com${esc(pagePath)}</div>
  </div>
  <img src="file://${shotPath}">
</div>`

const htmlPath = join(work, "card.html")
await writeFile(htmlPath, html)

const cardCtx = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
})
const card = await cardCtx.newPage()
await card.goto("file://" + htmlPath, { waitUntil: "networkidle" })
await card.waitForTimeout(300)

const out = `public/og/${slug}.png`
await card.screenshot({ path: out })
console.log(`wrote ${out}`)

await browser.close()
await rm(work, { recursive: true, force: true })
