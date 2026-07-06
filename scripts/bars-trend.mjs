/**
 * One-off: daily GSC time-series for /bars (and /bars/* descendants),
 * to track the trajectory through the metadata changes and recovery.
 *
 * Usage: node --env-file=.env.local scripts/bars-trend.mjs
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

  const endDate = isoDate(3); // GSC ~3-day delay
  const startDate = isoDate(73); // ~10 weeks back

  // Weekly buckets for the whole site vs /bars, to separate
  // "is it just /bars" from "is the whole site silent".
  async function series(filterBars) {
    const res = await sc.searchanalytics.query({
      siteUrl: GSC_SITE_URL,
      requestBody: {
        startDate,
        endDate,
        dimensions: ["date"],
        type: "web",
        ...(filterBars
          ? {
              dimensionFilterGroups: [
                { filters: [{ dimension: "page", operator: "contains", expression: "/bars" }] },
              ],
            }
          : {}),
        rowLimit: 200,
      },
    });
    return res.data.rows || [];
  }

  const siteRows = await series(false);
  const barsRows = await series(true);

  // Bucket into ISO weeks (Mon-anchored by simple 7-day grouping from startDate).
  function weekly(rows) {
    const start = new Date(startDate);
    const buckets = new Map();
    for (const r of rows) {
      const d = new Date(r.keys[0]);
      const wk = Math.floor((d - start) / (7 * 86400000));
      const b = buckets.get(wk) || { imp: 0, clicks: 0, posSum: 0, posDays: 0, label: "" };
      b.imp += r.impressions;
      b.clicks += r.clicks;
      if (r.impressions > 0) {
        b.posSum += r.position * r.impressions;
        b.posDays += r.impressions;
      }
      buckets.set(wk, b);
    }
    return buckets;
  }

  const siteW = weekly(siteRows);
  const barsW = weekly(barsRows);

  function weekLabel(wk) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + wk * 7);
    return d.toISOString().slice(0, 10);
  }

  const maxWk = Math.max(...[...siteW.keys(), ...barsW.keys()]);

  console.log(`\nWeekly impressions — ${startDate} → ${endDate}`);
  console.log(`(May 9 & May 19 = /bars metadata edits)\n`);
  console.log("week-start   SITE impr  clicks    /bars impr  clicks   /bars pos");
  for (let wk = 0; wk <= maxWk; wk++) {
    const s = siteW.get(wk) || { imp: 0, clicks: 0 };
    const b = barsW.get(wk) || { imp: 0, clicks: 0, posSum: 0, posDays: 0 };
    const pos = b.posDays ? (b.posSum / b.posDays).toFixed(1) : "—";
    console.log(
      `${weekLabel(wk)}   ${String(s.imp).padStart(8)}  ${String(s.clicks).padStart(5)}    ` +
        `${String(b.imp).padStart(8)}  ${String(b.clicks).padStart(5)}   ${String(pos).padStart(6)}`
    );
  }
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
