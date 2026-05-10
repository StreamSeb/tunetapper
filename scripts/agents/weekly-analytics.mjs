/**
 * Weekly Analytics → GitHub Issues Agent
 *
 * Fetches the current week's GA4 + GSC metrics, diffs them against the
 * previous run's state (stored in .github/agent-state/analytics.json),
 * and asks Claude to decide which signals justify opening a GitHub issue.
 *
 * Triggered weekly by .github/workflows/weekly-analytics.yml.
 *
 * Local dry-run:
 *   node --env-file=.env.local scripts/agents/weekly-analytics.mjs --dry-run
 *
 * Env required:
 *   GA4_PROPERTY_ID
 *   GSC_SITE_URL                      (default https://tunetapper.com)
 *   GOOGLE_APPLICATION_CREDENTIALS    path to service account JSON
 *   ANTHROPIC_API_KEY
 *   GH_TOKEN                          provided by GitHub Actions
 */

import { google } from "googleapis";
import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const STATE_DIR = join(ROOT, ".github", "agent-state");
const STATE_PATH = join(STATE_DIR, "analytics.json");

const DRY_RUN = process.argv.includes("--dry-run");
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
const GSC_SITE_URL = process.env.GSC_SITE_URL || "https://tunetapper.com";
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;

for (const key of ["GA4_PROPERTY_ID", "GOOGLE_APPLICATION_CREDENTIALS", "ANTHROPIC_API_KEY"]) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

// ─── Google auth ─────────────────────────────────────────────────────────────

const auth = new google.auth.GoogleAuth({
  scopes: [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/webmasters.readonly",
  ],
});

const authClient = await auth.getClient();
const ad = google.analyticsdata({ version: "v1beta", auth: authClient });
const sc = google.searchconsole({ version: "v1", auth: authClient });

const isoDate = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

// ─── Fetch current metrics ───────────────────────────────────────────────────

async function fetchMetrics() {
  const property = `properties/${GA4_PROPERTY_ID}`;

  // GA4 last 7 days
  const ga4Res = await ad.properties.runReport({
    property,
    requestBody: {
      dateRanges: [{ startDate: isoDate(7), endDate: isoDate(1) }],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "screenPageViews" },
        { name: "bounceRate" },
      ],
    },
  });
  const ga4Vals = ga4Res.data.rows?.[0]?.metricValues || [];

  // GA4 top pages last 7 days
  const ga4PagesRes = await ad.properties.runReport({
    property,
    requestBody: {
      dateRanges: [{ startDate: isoDate(7), endDate: isoDate(1) }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 15,
    },
  });

  // GSC 28-day summary
  const gscSummary = await sc.searchanalytics.query({
    siteUrl: GSC_SITE_URL,
    requestBody: { startDate: isoDate(31), endDate: isoDate(3), type: "web" },
  });
  const gscRow = gscSummary.data.rows?.[0] || {};

  // GSC top pages (28d) — for CTR / position tracking
  const gscPagesRes = await sc.searchanalytics.query({
    siteUrl: GSC_SITE_URL,
    requestBody: {
      startDate: isoDate(31),
      endDate: isoDate(3),
      dimensions: ["page"],
      rowLimit: 20,
      type: "web",
    },
  });

  // GSC top queries (28d)
  const gscQueriesRes = await sc.searchanalytics.query({
    siteUrl: GSC_SITE_URL,
    requestBody: {
      startDate: isoDate(31),
      endDate: isoDate(3),
      dimensions: ["query"],
      rowLimit: 20,
      type: "web",
    },
  });

  return {
    capturedAt: new Date().toISOString(),
    windowStart: isoDate(31),
    windowEnd: isoDate(3),
    ga4: {
      sessions: Number(ga4Vals[0]?.value || 0),
      users: Number(ga4Vals[1]?.value || 0),
      pageviews: Number(ga4Vals[2]?.value || 0),
      bounceRate: Number(ga4Vals[3]?.value || 0),
      topPages: (ga4PagesRes.data.rows || []).map((r) => ({
        path: r.dimensionValues[0].value,
        sessions: Number(r.metricValues[0].value),
      })),
    },
    gsc: {
      impressions: gscRow.impressions || 0,
      clicks: gscRow.clicks || 0,
      ctr: gscRow.ctr || 0,
      position: gscRow.position || 0,
      topPages: (gscPagesRes.data.rows || []).map((r) => ({
        page: r.keys[0].replace(GSC_SITE_URL, "") || "/",
        impressions: r.impressions,
        clicks: r.clicks,
        ctr: r.ctr,
        position: r.position,
      })),
      topQueries: (gscQueriesRes.data.rows || []).map((r) => ({
        query: r.keys[0],
        impressions: r.impressions,
        clicks: r.clicks,
        ctr: r.ctr,
        position: r.position,
      })),
    },
  };
}

// ─── State persistence ──────────────────────────────────────────────────────

function loadPreviousState() {
  if (!existsSync(STATE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(STATE_PATH, "utf8"));
  } catch (err) {
    console.warn(`Could not parse previous state: ${err.message}`);
    return null;
  }
}

function saveState(metrics) {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(STATE_PATH, JSON.stringify(metrics, null, 2) + "\n", "utf8");
}

// ─── GitHub issue helpers ──────────────────────────────────────────────────

const FINGERPRINT_PREFIX = "analytics-bot-fingerprint:";

function listOpenBotIssues() {
  if (DRY_RUN) return [];
  try {
    const out = execSync(
      "gh issue list --label analytics-bot --state open --limit 100 --json number,title,body",
      { encoding: "utf8" }
    );
    return JSON.parse(out);
  } catch (err) {
    console.warn(`gh issue list failed: ${err.message}`);
    return [];
  }
}

function findExistingIssue(openIssues, fingerprint) {
  return openIssues.find((i) => i.body?.includes(`${FINGERPRINT_PREFIX} ${fingerprint}`));
}

function openIssue({ title, body, labels, fingerprint }) {
  const fullBody = `${body}\n\n<!-- ${FINGERPRINT_PREFIX} ${fingerprint} -->`;
  if (DRY_RUN) {
    console.log("─".repeat(60));
    console.log(`[dry-run] would open issue: ${title}`);
    console.log(`labels: ${labels.join(", ")}`);
    console.log(`fingerprint: ${fingerprint}`);
    console.log(fullBody);
    return;
  }
  const labelArgs = labels.map((l) => `--label "${l}"`).join(" ");
  execSync(
    `gh issue create --title ${JSON.stringify(title)} --body ${JSON.stringify(fullBody)} ${labelArgs}`,
    { stdio: "inherit" }
  );
}

// ─── Claude analysis ───────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the TuneTapper analytics monitor.

Each week you receive the site's GA4 + Google Search Console metrics, plus the previous week's metrics for comparison. Your job is to decide which signals justify opening a GitHub issue for the site owner to investigate.

Open an issue ONLY when a signal is meaningful:
- ctr_regression: a page with ≥100 GSC impressions whose CTR dropped by ≥40% week-over-week, OR a page with ≥500 impressions and CTR < 0.5%
- ranking_drop: a top-10 page whose average position got 3+ positions worse
- traffic_drop: GA4 sessions or GSC clicks dropped ≥30% vs prior week (sitewide or for a specific page receiving ≥10 sessions/week)
- indexing: pages appearing in GSC with impressions but not previously seen, OR queries with rising impressions that don't have a clear landing page
- opportunity: a query at position 4-15 with rising impressions — a content improvement could push it into the top 3

Do NOT open issues for:
- Normal week-to-week fluctuation on low-traffic pages (< 10 impressions)
- Trends already flagged in a prior open issue (the owner can see those)
- Vanity metrics with no action attached

For each issue, include:
1. A concrete title naming the affected page/query
2. The exact numbers (current vs previous) so the owner can verify
3. A 1-2 sentence hypothesis on cause
4. A specific suggested action

Be ruthless about signal-to-noise. If nothing meaningful changed, open zero issues. A quiet week is fine.`;

async function analyze(current, previous) {
  const anthropic = new Anthropic();

  const openBotIssues = listOpenBotIssues();
  const existingFingerprints = openBotIssues
    .map((i) => {
      const m = i.body?.match(new RegExp(`${FINGERPRINT_PREFIX}\\s+(\\S+)`));
      return m?.[1];
    })
    .filter(Boolean);

  const userPrompt = [
    `# Current week (${current.windowStart} to ${current.windowEnd})`,
    "",
    "```json",
    JSON.stringify(current, null, 2),
    "```",
    "",
    previous
      ? `# Previous week (${previous.windowStart} to ${previous.windowEnd})\n\n\`\`\`json\n${JSON.stringify(previous, null, 2)}\n\`\`\``
      : "# No previous state — this is the first run. Establish a baseline by opening at most 1-2 issues for the most striking current signals (e.g. very low CTR on a high-impression page).",
    "",
    `# Open issues already filed by this bot (do not duplicate)`,
    existingFingerprints.length === 0
      ? "(none)"
      : existingFingerprints.map((f) => `- \`${f}\``).join("\n"),
    "",
    "Decide which issues to open. Call the `open_issue` tool once per issue, or no times if nothing warrants attention this week.",
  ].join("\n");

  const tools = [
    {
      name: "open_issue",
      description: "Open a GitHub issue flagging an analytics signal",
      input_schema: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["ctr_regression", "ranking_drop", "traffic_drop", "indexing", "opportunity"],
          },
          severity: { type: "string", enum: ["critical", "warning", "info"] },
          affected_page: {
            type: "string",
            description: "Path of the affected page, or 'sitewide', or a query string",
          },
          fingerprint: {
            type: "string",
            description: "Short unique key like 'ctr-regression:/bars' for dedup",
          },
          title: { type: "string", description: "Issue title, ≤80 chars" },
          body: {
            type: "string",
            description: "Markdown body: numbers, hypothesis, suggested action",
          },
        },
        required: ["category", "severity", "affected_page", "fingerprint", "title", "body"],
      },
    },
  ];

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    tools,
    messages: [{ role: "user", content: userPrompt }],
  });

  const issuesToOpen = response.content.filter((b) => b.type === "tool_use" && b.name === "open_issue");

  console.log(`Claude proposed ${issuesToOpen.length} issue(s)`);
  console.log(`Token usage: input=${response.usage.input_tokens}, output=${response.usage.output_tokens}`);

  let openedCount = 0;
  let skippedCount = 0;

  for (const block of issuesToOpen) {
    const { category, severity, fingerprint, title, body } = block.input;

    if (existingFingerprints.includes(fingerprint)) {
      console.log(`Skip duplicate: ${fingerprint}`);
      skippedCount++;
      continue;
    }

    openIssue({
      title,
      body,
      labels: ["analytics-bot", category, severity],
      fingerprint,
    });
    openedCount++;
  }

  return { proposed: issuesToOpen.length, opened: openedCount, skipped: skippedCount };
}

// ─── Main ──────────────────────────────────────────────────────────────────

console.log(`Mode: ${DRY_RUN ? "dry-run" : "live"}`);
console.log(`Model: ${MODEL}`);

const current = await fetchMetrics();
const previous = loadPreviousState();

console.log(`Fetched current metrics: ${current.gsc.impressions} GSC impressions, ${current.ga4.sessions} GA4 sessions`);
console.log(`Previous state: ${previous ? `from ${previous.capturedAt}` : "(none — first run)"}`);

const result = await analyze(current, previous);

if (!DRY_RUN) {
  saveState(current);
  console.log(`State saved to ${STATE_PATH}`);
}

console.log(`Done. Proposed=${result.proposed}, opened=${result.opened}, skipped=${result.skipped}`);
