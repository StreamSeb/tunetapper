/**
 * One-off: GSC deep-dive on the tap tempo pages.
 * Usage: node --env-file=.env.local <this file>  (run from repo root)
 */
import { google } from "googleapis";

const GSC_SITE_URL = process.env.GSC_SITE_URL || "https://tunetapper.com";

const auth = new google.auth.GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
});

function isoDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const authClient = await auth.getClient();
  const sc = google.searchconsole({ version: "v1", auth: authClient });

  const endDate = isoDate(3);
  const startDate = isoDate(93); // ~90 days

  const tapFilter = {
    dimensionFilterGroups: [
      { filters: [{ dimension: "page", operator: "contains", expression: "tap-tempo" }] },
    ],
  };

  // Per-page totals over 90 days
  const pages = await sc.searchanalytics.query({
    siteUrl: GSC_SITE_URL,
    requestBody: { startDate, endDate, dimensions: ["page"], type: "web", ...tapFilter, rowLimit: 50 },
  });
  console.log(`Tap-tempo pages — ${startDate} → ${endDate}\n`);
  console.log("impressions  clicks  position  page");
  for (const r of pages.data.rows || []) {
    console.log(
      `${String(r.impressions).padStart(11)}  ${String(r.clicks).padStart(6)}  ${r.position.toFixed(1).padStart(8)}  ${r.keys[0].replace(GSC_SITE_URL, "")}`
    );
  }
  if (!(pages.data.rows || []).length) console.log("(no rows — pages have zero impressions in GSC)");

  // Queries driving those pages
  const queries = await sc.searchanalytics.query({
    siteUrl: GSC_SITE_URL,
    requestBody: { startDate, endDate, dimensions: ["query", "page"], type: "web", ...tapFilter, rowLimit: 50 },
  });
  console.log("\nQueries:");
  console.log("impressions  clicks  position  query  →  page");
  for (const r of queries.data.rows || []) {
    console.log(
      `${String(r.impressions).padStart(11)}  ${String(r.clicks).padStart(6)}  ${r.position.toFixed(1).padStart(8)}  ${r.keys[0]}  →  ${r.keys[1].replace(GSC_SITE_URL, "")}`
    );
  }
  if (!(queries.data.rows || []).length) console.log("(no query rows)");

  // Weekly trend for tap pages
  const daily = await sc.searchanalytics.query({
    siteUrl: GSC_SITE_URL,
    requestBody: { startDate, endDate, dimensions: ["date"], type: "web", ...tapFilter, rowLimit: 200 },
  });
  const start = new Date(startDate);
  const buckets = new Map();
  for (const r of daily.data.rows || []) {
    const wk = Math.floor((new Date(r.keys[0]) - start) / (7 * 86400000));
    const b = buckets.get(wk) || { impressions: 0, clicks: 0 };
    b.impressions += r.impressions;
    b.clicks += r.clicks;
    buckets.set(wk, b);
  }
  console.log("\nWeekly trend (tap pages):");
  console.log("week-start   impressions  clicks");
  for (const [wk, b] of [...buckets.entries()].sort((a, b2) => a[0] - b2[0])) {
    const d = new Date(start.getTime() + wk * 7 * 86400000).toISOString().slice(0, 10);
    console.log(`${d}   ${String(b.impressions).padStart(11)}  ${String(b.clicks).padStart(6)}`);
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
