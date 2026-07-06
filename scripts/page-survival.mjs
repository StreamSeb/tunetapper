/**
 * One-off: per-page GSC before/after the May 2026 core update.
 * Healthy baseline window vs most-recent window — shows which pages survived.
 *
 * Usage: node --env-file=.env.local scripts/page-survival.mjs
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

async function pageQuery(sc, startDate, endDate) {
  const res = await sc.searchanalytics.query({
    siteUrl: GSC_SITE_URL,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["page"],
      type: "web",
      rowLimit: 1000,
    },
  });
  const map = new Map();
  for (const r of res.data.rows || []) {
    map.set(r.keys[0].replace(GSC_SITE_URL, ""), {
      impressions: r.impressions,
      clicks: r.clicks,
      position: r.position,
    });
  }
  return map;
}

async function main() {
  const authClient = await auth.getClient();
  const sc = google.searchconsole({ version: "v1", auth: authClient });

  // 14-day windows: healthy baseline vs most-recent (post-rollout).
  const baseStart = "2026-04-22", baseEnd = "2026-05-05";
  const recStart = isoDate(16), recEnd = isoDate(3);

  const base = await pageQuery(sc, baseStart, baseEnd);
  const rec = await pageQuery(sc, recStart, recEnd);

  const pages = new Set([...base.keys(), ...rec.keys()]);
  const rows = [];
  for (const p of pages) {
    const b = base.get(p) || { impressions: 0, clicks: 0, position: 0 };
    const r = rec.get(p) || { impressions: 0, clicks: 0, position: 0 };
    rows.push({
      page: p || "/",
      bImp: b.impressions,
      rImp: r.impressions,
      retained: b.impressions ? (r.impressions / b.impressions) * 100 : null,
      bPos: b.position,
      rPos: r.position,
    });
  }
  rows.sort((a, b) => b.bImp - a.bImp); // by baseline volume

  console.log(`\nPer-page impressions: baseline ${baseStart}..${baseEnd}  vs  recent ${recStart}..${recEnd}\n`);
  console.log("baseImp  recImp  kept%   basePos recPos  page");
  let bTot = 0, rTot = 0;
  for (const r of rows) {
    bTot += r.bImp; rTot += r.rImp;
    if (r.bImp < 5 && r.rImp < 5) continue; // skip noise
    const kept = r.retained == null ? "  new" : `${r.retained.toFixed(0)}%`.padStart(5);
    console.log(
      `${String(r.bImp).padStart(6)}  ${String(r.rImp).padStart(6)}  ${kept}   ` +
        `${r.bPos.toFixed(1).padStart(5)}  ${r.rPos ? r.rPos.toFixed(1).padStart(5) : "   — "}  ${r.page}`
    );
  }
  console.log(`\nSITE TOTAL: ${bTot} → ${rTot}  (kept ${bTot ? ((rTot / bTot) * 100).toFixed(1) : "n/a"}%)`);
}

main().catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
