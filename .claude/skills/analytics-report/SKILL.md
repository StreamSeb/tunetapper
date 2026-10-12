---
name: analytics-report
description: Fetch fresh GA4 and Search Console data for TuneTapper, compare it with the previous report in reports/, write reports/YYYY-MM-DD.md with the key changes, then commit and push it to the private tunetapper-reports repo. Use when asked for an analytics report, a traffic or SEO check-in, or "what changed since last time".
---

# Analytics report

Produces one dated report per run. Designed to run unattended: never ask questions, never commit or push anything in this repo, and end with a final message that says what happened.

The rules in `CLAUDE.md` apply throughout. In particular: never print secret values, never push to this repo's `main`, never deploy.

Run every command from the repo root. Reports are published only to the private repo `StreamSeb/tunetapper-reports`, cloned at `~/repos/tunetapper-reports`. This repo is public, so no report is ever committed here, on any branch.

## 1. Preflight

Check the configuration by key name only:

```bash
node --env-file-if-exists=.env.local -e '
for (const k of ["GA4_PROPERTY_ID", "GOOGLE_APPLICATION_CREDENTIALS"])
  console.log(k, process.env[k] ? "set" : "MISSING");
const p = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (p) console.log("credentials file", require("fs").existsSync(p) ? "found" : "NOT FOUND");
'
```

If anything is missing or not found, stop. Write no report and make no commit. Name the missing keys in the final message.

Set the date once and reuse it: `D=$(date +%F)`.

## 2. Find the previous report

Do this **before** fetching, because the fetch overwrites `reports/analytics-snapshot.md`.

```bash
R=~/repos/tunetapper-reports
git -C "$R" pull --ff-only    # skip if the repo has no commits yet
```

1. Use the newest `reports/YYYY-MM-DD.md` in `$R` dated before today.
2. If there is none, this is the first run. Copy the existing local `reports/analytics-snapshot.md` (if any) to a temp file and use it as the baseline; its header gives its date.
3. If there is nothing at all, write a baseline report with no comparison and say so in it.

If `$R` does not exist or the pull fails for any reason other than an empty repo, stop and say so. Do not re-create or re-clone the repo.

If `$R/reports/$D.md` already exists, this is a re-run: replace it, and still compare against the newest report dated *before* today.

## 3. Fetch

```bash
node --env-file-if-exists=.env.local scripts/fetch-analytics.mjs
```

This must succeed and `reports/analytics-snapshot.md` must have been rewritten just now. If it fails, stop: do not write a report from stale data. Put the error message (not the environment) in the final message.

Then run the supplementary scripts, saving stdout to temp files. These are optional context; if one fails, note that in the report and carry on.

```bash
T=$(mktemp -d)
for s in bars-trend tap-tempo-report page-survival inspect-urls; do
  node --env-file-if-exists=.env.local scripts/$s.mjs > "$T/$s.txt" 2>&1 || echo "$s failed"
done
```

Do not run `scripts/agents/*` or `scripts/gear-price-check.mjs` from this skill.

## 4. Compare

Read the fresh snapshot, the supplementary output and the previous report. State the date windows of both sides. The GA4 window is 30 days and the GSC window is 28 days ending 3 days ago, so if the previous report is less than about four weeks old the windows overlap: say so, and treat small differences as noise.

Look for:

- **Totals**: GA4 sessions, users and engagement; GSC clicks, impressions, CTR and average position.
- **Pages**: entered or left the top lists, or moved by more than about 20% with at least 50 impressions or 10 sessions behind the change.
- **Queries**: new, lost, or moved by 3 or more positions with at least 50 impressions.
- **Channels**: any shift in the mix. Organic Search is the one that matters.
- **Indexing**: change in sitemap submitted/indexed counts; any `inspect-urls` verdict that is not indexed.
- **Opportunities**: new entries in the low-CTR list, and ones that dropped off it.

Numbers below those thresholds are noise on a site this size. A quiet period is a valid finding; don't inflate it.

Known context: `/bars` is a confirmed zero-click page, and the `/bpm/*` and `/bars/*` leaf pages are deliberately noindexed. Don't report those as problems or recommend snippet work on `/bars`.

## 5. Write `reports/$D.md`

```markdown
# TuneTapper analytics report: YYYY-MM-DD

Compared with: <previous report date, or "baseline, no earlier report">
Windows: GA4 <start> to <end> · GSC <start> to <end>

## Summary
Three to five sentences: what changed, how sure the data makes you, and the one thing worth doing.

## Key changes
| Metric | Previous | Now | Change |
One row per headline total.

## Pages
## Queries
## Indexing
## Recommended actions
At most three, each tied to a number above. Write "None" if nothing warrants action.

## Data notes
Overlapping windows, failed supplementary scripts, anything that limits confidence.
```

Leave out a section's table if nothing in it crossed the thresholds; write one line saying so. The report goes to a private repo, so it may include traffic figures, paths and queries. It must still never contain secrets, the GA4 property ID, credentials paths, key contents or anything from an env file.

## 6. Commit and push

Write the report to `reports/$D.md` here first (gitignored, never committed in this repo), then publish it through the private repo:

```bash
R=~/repos/tunetapper-reports
gh repo view StreamSeb/tunetapper-reports --json visibility -q .visibility    # must print PRIVATE
mkdir -p "$R/reports"
cp "reports/$D.md" "$R/reports/$D.md"
git -C "$R" add "reports/$D.md"
git -C "$R" diff --cached --name-only    # must list exactly reports/$D.md
git -C "$R" commit -m "Analytics report $D"
git -C "$R" push origin HEAD:main
```

Rules for this step:

- If the visibility check prints anything other than `PRIVATE`, stop without committing and say so.
- The commit must contain exactly one file, `reports/$D.md`. If the staged list shows anything else, unstage it and stop.
- Commit and push only in `~/repos/tunetapper-reports`. Never commit, `git add -f` or push anything in the tunetapper repo from this skill.
- Never force-push. If the push is rejected, `git -C "$R" pull --rebase` and retry once. If it fails again, leave the commit in place and say the push failed.
- If nothing changed (identical re-run), skip the commit.

## 7. Final message

Say, in this order: the report path, the comparison date, the two or three most important changes with their numbers, whether the commit was pushed to tunetapper-reports (short hash), and anything that failed or was skipped.
