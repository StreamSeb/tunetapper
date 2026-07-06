/**
 * One-off: GSC URL Inspection for representative URLs.
 * Tells us Google's current index verdict and *why* a page is/ isn't indexed.
 *
 * Usage: node --env-file=.env.local scripts/inspect-urls.mjs
 */
import { google } from "googleapis";

const GSC_SITE_URL = process.env.GSC_SITE_URL || "https://tunetapper.com";

const URLS = [
  "https://tunetapper.com/",
  "https://tunetapper.com/bars",
  "https://tunetapper.com/tools/camelot",
  "https://tunetapper.com/camelot/8a",
  "https://tunetapper.com/bpm/128",
];

const auth = new google.auth.GoogleAuth({
  scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
});

async function main() {
  const authClient = await auth.getClient();
  const sc = google.searchconsole({ version: "v1", auth: authClient });

  for (const url of URLS) {
    try {
      const res = await sc.urlInspection.index.inspect({
        requestBody: { inspectionUrl: url, siteUrl: GSC_SITE_URL },
      });
      const r = res.data.inspectionResult?.indexStatusResult || {};
      console.log(`\n${url}`);
      console.log(`  verdict:        ${r.verdict}`);
      console.log(`  coverageState:  ${r.coverageState}`);
      console.log(`  robotsTxtState: ${r.robotsTxtState}`);
      console.log(`  indexingState:  ${r.indexingState}`);
      console.log(`  pageFetchState: ${r.pageFetchState}`);
      console.log(`  lastCrawl:      ${r.lastCrawlTime || "—"}`);
      console.log(`  googleCanonical: ${r.googleCanonical || "—"}`);
      console.log(`  userCanonical:   ${r.userCanonical || "—"}`);
    } catch (e) {
      console.log(`\n${url}\n  ERROR: ${e.message}`);
    }
  }
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
