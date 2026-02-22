/**
 * TuneTapper Analytics Report Generator
 *
 * Fetches data from GA4 Data API + Google Search Console API and writes
 * a markdown snapshot to reports/analytics-snapshot.md.
 *
 * Usage:
 *   node --env-file=.env.local scripts/fetch-analytics.mjs
 *
 * Required .env.local variables:
 *   GA4_PROPERTY_ID          e.g. 123456789  (just the number, no "properties/")
 *   GSC_SITE_URL             e.g. https://tunetapper.com
 *   GOOGLE_APPLICATION_CREDENTIALS  path to service account JSON key file
 *                            e.g. ./service-account-key.json
 *
 * See ANALYTICS-SETUP.md for how to obtain these values.
 */

import { google } from "googleapis";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ─── Config ──────────────────────────────────────────────────────────────────

const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const GSC_SITE_URL = process.env.GSC_SITE_URL || "https://tunetapper.com";

if (!GA4_PROPERTY_ID) {
  console.error("❌  GA4_PROPERTY_ID is not set in .env.local");
  process.exit(1);
}
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    "❌  GOOGLE_APPLICATION_CREDENTIALS is not set in .env.local\n" +
      "   Set it to the path of your service account key JSON file."
  );
  process.exit(1);
}

// ─── Auth ────────────────────────────────────────────────────────────────────

const auth = new google.auth.GoogleAuth({
  scopes: [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/webmasters.readonly",
  ],
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isoDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function pct(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function num(value, decimals = 0) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function trend(current, previous) {
  if (!previous || previous === 0) return "";
  const delta = ((current - previous) / previous) * 100;
  const sign = delta >= 0 ? "+" : "";
  return ` (${sign}${delta.toFixed(0)}% vs prev period)`;
}

function mdTable(headers, rows) {
  const lines = [];
  lines.push("| " + headers.join(" | ") + " |");
  lines.push("| " + headers.map(() => "---").join(" | ") + " |");
  for (const row of rows) {
    lines.push("| " + row.join(" | ") + " |");
  }
  return lines.join("\n");
}

// ─── GA4 ─────────────────────────────────────────────────────────────────────

async function fetchGA4(authClient) {
  const analyticsdata = google.analyticsdata({ version: "v1beta", auth: authClient });
  const property = `properties/${GA4_PROPERTY_ID}`;

  // Overview: last 30 days vs previous 30 days
  const overviewRes = await analyticsdata.properties.runReport({
    property,
    requestBody: {
      dateRanges: [
        { startDate: isoDate(30), endDate: isoDate(1), name: "current" },
        { startDate: isoDate(60), endDate: isoDate(31), name: "previous" },
      ],
      metrics: [
        { name: "sessions" },
        { name: "totalUsers" },
        { name: "screenPageViews" },
        { name: "newUsers" },
        { name: "bounceRate" },
        { name: "averageSessionDuration" },
      ],
    },
  });

  const rows = overviewRes.data.rows || [];
  const cur = rows.find((r) => r.dimensionValues?.[0]?.value === "current")?.metricValues || [];
  const prev = rows.find((r) => r.dimensionValues?.[0]?.value === "previous")?.metricValues || [];

  // When there are no dimension values it's a single row (no date_range dimension)
  // Fallback: first row = current, second row = previous
  const curVals = cur.length ? cur : rows[0]?.metricValues || [];
  const prevVals = prev.length ? prev : rows[1]?.metricValues || [];

  const overview = {
    sessions: Number(curVals[0]?.value || 0),
    sessionsPrev: Number(prevVals[0]?.value || 0),
    users: Number(curVals[1]?.value || 0),
    usersPrev: Number(prevVals[1]?.value || 0),
    pageviews: Number(curVals[2]?.value || 0),
    pageviewsPrev: Number(prevVals[2]?.value || 0),
    newUsers: Number(curVals[3]?.value || 0),
    bounceRate: Number(curVals[4]?.value || 0),
    avgSessionDuration: Number(curVals[5]?.value || 0),
  };

  // Top pages by sessions
  const topPagesRes = await analyticsdata.properties.runReport({
    property,
    requestBody: {
      dateRanges: [{ startDate: isoDate(30), endDate: isoDate(1) }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "sessions" }, { name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 20,
    },
  });

  const topPages = (topPagesRes.data.rows || []).map((r) => ({
    path: r.dimensionValues[0].value,
    sessions: Number(r.metricValues[0].value),
    pageviews: Number(r.metricValues[1].value),
  }));

  // Traffic by channel
  const channelRes = await analyticsdata.properties.runReport({
    property,
    requestBody: {
      dateRanges: [{ startDate: isoDate(30), endDate: isoDate(1) }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    },
  });

  const channels = (channelRes.data.rows || []).map((r) => ({
    channel: r.dimensionValues[0].value,
    sessions: Number(r.metricValues[0].value),
  }));

  return { overview, topPages, channels };
}

// ─── Search Console ───────────────────────────────────────────────────────────

async function fetchGSC(authClient) {
  const searchconsole = google.searchconsole({ version: "v1", auth: authClient });

  // GSC has ~3 day data delay
  const endDate = isoDate(3);
  const startDate = isoDate(31); // 28-day window

  // Summary
  const summaryRes = await searchconsole.searchanalytics.query({
    siteUrl: GSC_SITE_URL,
    requestBody: {
      startDate,
      endDate,
      type: "web",
    },
  });

  const summary = {
    clicks: summaryRes.data.rows?.[0]?.clicks || 0,
    impressions: summaryRes.data.rows?.[0]?.impressions || 0,
    ctr: summaryRes.data.rows?.[0]?.ctr || 0,
    position: summaryRes.data.rows?.[0]?.position || 0,
  };

  // Top queries by impressions
  const queriesRes = await searchconsole.searchanalytics.query({
    siteUrl: GSC_SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["query"],
      rowLimit: 25,
      type: "web",
    },
  });

  const queries = (queriesRes.data.rows || []).map((r) => ({
    query: r.keys[0],
    impressions: r.impressions,
    clicks: r.clicks,
    ctr: r.ctr,
    position: r.position,
  }));

  // Top pages by impressions
  const pagesRes = await searchconsole.searchanalytics.query({
    siteUrl: GSC_SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["page"],
      rowLimit: 25,
      type: "web",
    },
  });

  const pages = (pagesRes.data.rows || []).map((r) => ({
    page: r.keys[0].replace(GSC_SITE_URL, ""),
    impressions: r.impressions,
    clicks: r.clicks,
    ctr: r.ctr,
    position: r.position,
  }));

  // Opportunities: impressions >= 50, CTR < 5%
  const opportunities = pages.filter((p) => p.impressions >= 50 && p.ctr < 0.05);

  return { summary, queries, pages, opportunities, startDate, endDate };
}

// ─── Phase 2 readiness ───────────────────────────────────────────────────────

function assessPhase2({ ga4, gsc }) {
  const checks = [];

  const organicOk = ga4.channels.find((c) =>
    c.channel.toLowerCase().includes("organic")
  )?.sessions || 0;

  checks.push({
    ok: organicOk >= 100,
    label: `Organic sessions ≥ 100/month (current: ${num(organicOk)})`,
  });

  checks.push({
    ok: gsc.summary.impressions >= 500,
    label: `GSC impressions ≥ 500 in 28 days (current: ${num(gsc.summary.impressions)})`,
  });

  checks.push({
    ok: gsc.summary.position > 0 && gsc.summary.position <= 50,
    label: `Average GSC position ≤ 50 (current: ${gsc.summary.position.toFixed(1)})`,
  });

  checks.push({
    ok: gsc.summary.clicks >= 20,
    label: `GSC clicks ≥ 20 in 28 days (current: ${num(gsc.summary.clicks)})`,
  });

  const passCount = checks.filter((c) => c.ok).length;
  const ready = passCount >= 3;

  return { checks, ready };
}

// ─── Report builder ───────────────────────────────────────────────────────────

function buildReport({ ga4, gsc }) {
  const { overview, topPages, channels } = ga4;
  const { summary, queries, pages, opportunities, startDate, endDate } = gsc;
  const phase2 = assessPhase2({ ga4, gsc });

  const avgDuration = `${Math.floor(overview.avgSessionDuration / 60)}m ${Math.round(overview.avgSessionDuration % 60)}s`;

  const lines = [];

  lines.push(`# TuneTapper Analytics Snapshot`);
  lines.push(`_Generated: ${new Date().toISOString().slice(0, 10)}_`);
  lines.push(``);

  // ── Phase 2 Readiness ──
  lines.push(`## Phase 2 Readiness`);
  lines.push(``);
  lines.push(phase2.ready ? `**Status: ✅ Ready to start Phase 2**` : `**Status: ⏳ Not yet — keep growing Phase 1 traffic**`);
  lines.push(``);
  for (const c of phase2.checks) {
    lines.push(`- ${c.ok ? "✅" : "❌"} ${c.label}`);
  }
  lines.push(``);

  // ── GA4 Overview ──
  lines.push(`## Google Analytics 4 — Last 30 Days`);
  lines.push(``);
  lines.push(
    mdTable(
      ["Metric", "Value", "Trend"],
      [
        ["Sessions", num(overview.sessions), trend(overview.sessions, overview.sessionsPrev)],
        ["Users", num(overview.users), trend(overview.users, overview.usersPrev)],
        ["Pageviews", num(overview.pageviews), trend(overview.pageviews, overview.pageviewsPrev)],
        ["New Users", num(overview.newUsers), ""],
        ["Bounce Rate", pct(overview.bounceRate), ""],
        ["Avg Session Duration", avgDuration, ""],
      ]
    )
  );
  lines.push(``);

  // ── Channels ──
  lines.push(`### Traffic by Channel`);
  lines.push(``);
  const totalSessions = channels.reduce((s, c) => s + c.sessions, 0) || 1;
  lines.push(
    mdTable(
      ["Channel", "Sessions", "Share"],
      channels.map((c) => [c.channel, num(c.sessions), pct(c.sessions / totalSessions)])
    )
  );
  lines.push(``);

  // ── Top Pages (GA4) ──
  lines.push(`### Top 20 Pages by Sessions`);
  lines.push(``);
  lines.push(
    mdTable(
      ["Page", "Sessions", "Pageviews"],
      topPages.map((p) => [p.path, num(p.sessions), num(p.pageviews)])
    )
  );
  lines.push(``);

  // ── GSC Overview ──
  lines.push(`## Google Search Console — ${startDate} to ${endDate}`);
  lines.push(``);
  lines.push(
    mdTable(
      ["Metric", "Value"],
      [
        ["Total Impressions", num(summary.impressions)],
        ["Total Clicks", num(summary.clicks)],
        ["Average CTR", pct(summary.ctr)],
        ["Average Position", summary.position.toFixed(1)],
      ]
    )
  );
  lines.push(``);

  // ── Top Queries ──
  lines.push(`### Top 25 Queries by Impressions`);
  lines.push(``);
  lines.push(
    mdTable(
      ["Query", "Impressions", "Clicks", "CTR", "Position"],
      queries.map((q) => [
        q.query,
        num(q.impressions),
        num(q.clicks),
        pct(q.ctr),
        q.position.toFixed(1),
      ])
    )
  );
  lines.push(``);

  // ── Top Pages (GSC) ──
  lines.push(`### Top 25 Pages by Impressions`);
  lines.push(``);
  lines.push(
    mdTable(
      ["Page", "Impressions", "Clicks", "CTR", "Position"],
      pages.map((p) => [
        p.page || "/",
        num(p.impressions),
        num(p.clicks),
        pct(p.ctr),
        p.position.toFixed(1),
      ])
    )
  );
  lines.push(``);

  // ── Opportunities ──
  if (opportunities.length > 0) {
    lines.push(`### Opportunities (≥50 impressions, CTR < 5%)`);
    lines.push(`_These pages are showing in search results but not getting clicks — consider improving title/description._`);
    lines.push(``);
    lines.push(
      mdTable(
        ["Page", "Impressions", "Clicks", "CTR", "Position"],
        opportunities.map((p) => [
          p.page || "/",
          num(p.impressions),
          num(p.clicks),
          pct(p.ctr),
          p.position.toFixed(1),
        ])
      )
    );
    lines.push(``);
  }

  return lines.join("\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🔑  Authenticating with Google APIs...");
  const authClient = await auth.getClient();

  console.log("📊  Fetching GA4 data...");
  const ga4 = await fetchGA4(authClient);

  console.log("🔍  Fetching Search Console data...");
  const gsc = await fetchGSC(authClient);

  console.log("📝  Building report...");
  const report = buildReport({ ga4, gsc });

  const outDir = join(ROOT, "reports");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "analytics-snapshot.md");
  writeFileSync(outPath, report, "utf8");

  console.log(`✅  Report written to reports/analytics-snapshot.md`);
}

main().catch((err) => {
  console.error("❌  Error:", err.message);
  process.exit(1);
});
