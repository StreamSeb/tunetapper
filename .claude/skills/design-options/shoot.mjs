/**
 * Screenshots one page of a local dev server for the design-options skill.
 *
 *   node .claude/skills/design-options/shoot.mjs <url> <out-prefix> [--theme dark|light]
 *
 * Writes <out-prefix>-desktop.png (1440x900, first screen), <out-prefix>-mobile.png
 * (390x844, first screen) and <out-prefix>-full.png (1440 wide, full page).
 *
 * playwright-core is not a project dependency. It is installed once in
 * ~/repos/tunetapper-design/tools (see SKILL.md) and drives the Chromium that is
 * already in ~/.cache/ms-playwright. Only local URLs: the browser runs unsandboxed.
 */
import { createRequire } from "node:module"
import { readdirSync, existsSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

const [url, prefix] = process.argv.slice(2)
const themeFlag = process.argv.indexOf("--theme")
const theme = themeFlag === -1 ? "dark" : process.argv[themeFlag + 1]

if (!url || !prefix) {
  console.error("usage: shoot.mjs <url> <out-prefix> [--theme dark|light]")
  process.exit(1)
}
if (!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/.test(url)) {
  console.error("Refusing to open a non-local URL: " + url)
  process.exit(1)
}

const tools = join(homedir(), "repos/tunetapper-design/tools")
let chromium
try {
  ;({ chromium } = createRequire(join(tools, "package.json"))("playwright-core"))
} catch {
  console.error("playwright-core is missing. Run: cd " + tools + " && npm install playwright-core")
  process.exit(1)
}

const cache = join(homedir(), ".cache/ms-playwright")
const executablePath =
  process.env.CHROME_PATH ||
  readdirSync(cache)
    .filter((d) => /^chromium-\d+$/.test(d))
    .sort((a, b) => Number(b.split("-")[1]) - Number(a.split("-")[1]))
    .map((d) => join(cache, d, "chrome-linux64/chrome"))
    .find(existsSync)

const browser = await chromium.launch({ executablePath, args: ["--no-sandbox", "--disable-gpu"] })

async function shoot(name, viewport, fullPage) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, colorScheme: theme })
  // Declined consent hides the banner without loading GA or ads.
  await ctx.addInitScript((t) => {
    localStorage.setItem("tunetapper_cookie_consent", "declined")
    localStorage.setItem("theme", t)
  }, theme)
  const page = await ctx.newPage()
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 })
  if (!res || !res.ok()) throw new Error(`${url} returned ${res ? res.status() : "no response"}`)
  await page.waitForTimeout(500)
  const out = `${prefix}-${name}.png`
  await page.screenshot({ path: out, fullPage })
  await ctx.close()
  console.log("wrote " + out)
}

try {
  await shoot("desktop", { width: 1440, height: 900 }, false)
  await shoot("mobile", { width: 390, height: 844 }, false)
  await shoot("full", { width: 1440, height: 900 }, true)
} finally {
  await browser.close()
}
