/**
 * Nightly Maintenance Agent
 *
 * Mechanical (no-LLM) checks that run nightly and open GitHub issues when
 * something needs attention. Currently checks:
 *   1. pnpm audit — high/critical security vulnerabilities
 *   2. Production-dep licenses against a forbidden list (AGPL, GPL-3, SSPL, ...)
 *
 * Triggered by .github/workflows/nightly-maintenance.yml or run manually:
 *   node scripts/agents/nightly-maintenance.mjs --dry-run
 *
 * Env required (only when not in dry-run):
 *   GH_TOKEN — provided by GitHub Actions; locally use `gh auth login`
 */

import { execFileSync, execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const FINGERPRINT_PREFIX = "nightly-maintenance-fingerprint:";
const BOT_LABEL = "nightly-maintenance";

// Licenses that require legal review before shipping in a public web app.
// AGPL bit us before (Essentia.js was skipped for this reason).
const FORBIDDEN_LICENSE_PATTERNS = [
  { pattern: /\bAGPL\b/i, label: "AGPL" },
  { pattern: /\bGPL-?3(?:\.0)?(?!-?with)/i, label: "GPL-3.0" },
  { pattern: /\bSSPL\b/i, label: "SSPL" },
  { pattern: /Commons-?Clause/i, label: "Commons-Clause" },
  { pattern: /BUSL/i, label: "BUSL" },
];

// ─── GitHub helpers ────────────────────────────────────────────────────────

function ensureLabel(name) {
  if (DRY_RUN) return;
  try {
    execFileSync("gh", ["label", "create", name, "--force"], { stdio: "pipe" });
  } catch {
    // label may already exist; ignore
  }
}

function listOpenBotIssues() {
  if (DRY_RUN) return [];
  try {
    const out = execFileSync(
      "gh",
      ["issue", "list", "--label", BOT_LABEL, "--state", "open", "--limit", "100", "--json", "number,title,body"],
      { encoding: "utf8" }
    );
    return JSON.parse(out);
  } catch (err) {
    console.warn(`gh issue list failed: ${err.message}`);
    return [];
  }
}

function findExistingFingerprints(openIssues) {
  return openIssues
    .map((i) => {
      const m = i.body?.match(new RegExp(`${FINGERPRINT_PREFIX}\\s+(\\S+)`));
      return m?.[1];
    })
    .filter(Boolean);
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

  for (const l of labels) ensureLabel(l);

  const bodyFile = join(tmpdir(), `nightly-issue-${Date.now()}-${Math.random().toString(36).slice(2)}.md`);
  writeFileSync(bodyFile, fullBody, "utf8");

  const args = ["issue", "create", "--title", title, "--body-file", bodyFile];
  for (const l of labels) args.push("--label", l);

  execFileSync("gh", args, { stdio: "inherit" });
}

// ─── pnpm audit ────────────────────────────────────────────────────────────

function runPnpmAudit() {
  try {
    const out = execFileSync("pnpm", ["audit", "--json"], {
      encoding: "utf8",
      maxBuffer: 50_000_000,
    });
    return JSON.parse(out);
  } catch (err) {
    // pnpm audit exits non-zero when vulnerabilities are present; stdout still
    // contains the JSON report
    if (err.stdout) {
      try {
        return JSON.parse(err.stdout);
      } catch {
        console.error("pnpm audit produced invalid JSON");
        return null;
      }
    }
    console.error(`pnpm audit failed: ${err.message}`);
    return null;
  }
}

function checkAudit(existingFingerprints) {
  const report = runPnpmAudit();
  if (!report) return { ran: false };

  // pnpm audit output shape varies; advisories live under .advisories (older)
  // or .vulnerabilities (newer). Normalise.
  const advisories = Object.values(report.advisories || report.vulnerabilities || {});
  const highOrCritical = advisories.filter(
    (a) => a.severity === "critical" || a.severity === "high"
  );

  if (highOrCritical.length === 0) {
    console.log(`pnpm audit: ${advisories.length} total advisory, 0 high/critical`);
    return { ran: true, opened: 0 };
  }

  // Aggregate by module so a single vulnerable package doesn't generate 18
  // issues. Fingerprint by module + worst severity so an upgrade resolves
  // the issue rather than the fingerprint silently drifting on each new CVE.
  const byModule = new Map();
  for (const a of highOrCritical) {
    const module = a.module_name || a.name || "unknown";
    if (!byModule.has(module)) byModule.set(module, []);
    byModule.get(module).push(a);
  }

  let opened = 0;
  for (const [module, advs] of byModule) {
    const worstSeverity = advs.some((a) => a.severity === "critical") ? "critical" : "high";
    const fingerprint = `pnpm-audit:${module}:${worstSeverity}`;

    if (existingFingerprints.includes(fingerprint)) {
      console.log(`Skip duplicate audit issue: ${fingerprint}`);
      continue;
    }

    const title = `[security] ${worstSeverity}: ${advs.length} ${advs.length === 1 ? "advisory" : "advisories"} in ${module}`;
    const rows = advs
      .map(
        (a) =>
          `| ${a.severity} | ${a.title || "(no title)"} | \`${a.vulnerable_versions || "?"}\` | \`${a.patched_versions || "?"}\` | [${a.id || a.github_advisory_id || "link"}](${a.url || "#"}) |`
      )
      .join("\n");
    const body = [
      `## Vulnerable package: \`${module}\``,
      ``,
      `${advs.length} ${worstSeverity}/high advisory${advs.length === 1 ? "" : " entries"} reported by \`pnpm audit\`.`,
      ``,
      `| Severity | Title | Vulnerable | Patched | Advisory |`,
      `|---|---|---|---|---|`,
      rows,
      ``,
      `## Suggested action`,
      ``,
      `Run \`pnpm update ${module}\` and verify with \`pnpm build\`. If the patched version is a major upgrade, check release notes for breaking changes first. Close this issue once the package is on a non-vulnerable version (the bot will re-open if new advisories appear).`,
    ].join("\n");

    openIssue({
      title,
      body,
      labels: [BOT_LABEL, "security", worstSeverity],
      fingerprint,
    });
    opened++;
  }

  return { ran: true, opened };
}

// ─── License audit ─────────────────────────────────────────────────────────

function runPnpmLicenses() {
  let raw;
  try {
    raw = execFileSync("pnpm", ["licenses", "list", "--prod", "--json"], {
      encoding: "utf8",
      maxBuffer: 50_000_000,
    });
  } catch (err) {
    // pnpm may exit non-zero (e.g. when warnings present) while still emitting
    // valid JSON on stdout. Fall back to err.stdout.
    raw = err.stdout;
  }
  if (!raw) {
    console.error("pnpm licenses list produced no output");
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error(`pnpm licenses list produced invalid JSON: ${err.message}`);
    return null;
  }
}

function flagForbiddenLicense(license) {
  return FORBIDDEN_LICENSE_PATTERNS.find(({ pattern }) => pattern.test(license));
}

function checkLicenses(existingFingerprints) {
  const licenses = runPnpmLicenses();
  if (!licenses) return { ran: false };

  // Output is { "MIT": [...], "AGPL-3.0": [...], ... } keyed by license name.
  // Each entry: { name, versions: ["x.y.z"], ... }
  const flagged = [];
  for (const [license, packages] of Object.entries(licenses)) {
    const hit = flagForbiddenLicense(license);
    if (!hit) continue;
    for (const pkg of packages) {
      const version = Array.isArray(pkg.versions) ? pkg.versions.join(", ") : pkg.version || "?";
      flagged.push({ license, label: hit.label, package: pkg.name, version });
    }
  }

  if (flagged.length === 0) {
    console.log(`licenses: ${Object.keys(licenses).length} distinct, 0 forbidden`);
    return { ran: true, opened: 0 };
  }

  // One aggregate issue per nightly run with all flagged packages.
  // Fingerprint by sorted package list so the same set doesn't re-file.
  const sig = flagged.map((f) => `${f.package}@${f.version}`).sort().join(",");
  const fingerprint = `licenses:${Buffer.from(sig).toString("base64").slice(0, 40)}`;

  if (existingFingerprints.includes(fingerprint)) {
    console.log(`Skip duplicate license issue: ${fingerprint}`);
    return { ran: true, opened: 0 };
  }

  const rows = flagged.map((f) => `| \`${f.package}@${f.version}\` | ${f.license} |`).join("\n");
  const title = `[license] ${flagged.length} forbidden-license package${flagged.length === 1 ? "" : "s"} in prod deps`;
  const body = [
    `## Forbidden-licensed packages in production dependencies`,
    ``,
    `These licenses are on the forbidden list because they have copyleft or commercial-restriction terms that conflict with shipping a public web app without legal review:`,
    ``,
    `${FORBIDDEN_LICENSE_PATTERNS.map((p) => `\`${p.label}\``).join(" · ")}`,
    ``,
    `| Package | License |`,
    `|---|---|`,
    rows,
    ``,
    `## Suggested action`,
    ``,
    `Remove the package or replace with an equivalent under an MIT/BSD/Apache/ISC license. If the license is acceptable for your specific use case after review, add it to the allowlist in \`scripts/agents/nightly-maintenance.mjs\` and close this issue.`,
  ].join("\n");

  openIssue({
    title,
    body,
    labels: [BOT_LABEL, "license", "legal"],
    fingerprint,
  });

  return { ran: true, opened: 1 };
}

// ─── Main ──────────────────────────────────────────────────────────────────

console.log(`Mode: ${DRY_RUN ? "dry-run" : "live"}`);

const openIssues = listOpenBotIssues();
const existingFingerprints = findExistingFingerprints(openIssues);
console.log(`Currently ${openIssues.length} open bot issue(s); ${existingFingerprints.length} fingerprint(s)`);

const auditResult = checkAudit(existingFingerprints);
const licenseResult = checkLicenses(existingFingerprints);

console.log(`Audit: ran=${auditResult.ran} opened=${auditResult.opened ?? 0}`);
console.log(`Licenses: ran=${licenseResult.ran} opened=${licenseResult.opened ?? 0}`);
