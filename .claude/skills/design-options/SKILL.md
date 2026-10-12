---
name: design-options
description: Design changes to TuneTapper pages or components. Writes a brief, builds three distinct options on local branches, sends desktop and mobile screenshots with one recommended, waits for Seb's choice (never builds on a timeout), then builds and reviews the chosen option and sends before/after screenshots for approval. Use for any request to redesign, restyle, rework the layout of, or visually improve a page, tool or component in this repo.
---

# Design options

**`client-design` and `site-rebuild` are for client leads in `~/repos/client-sites` and do not apply in this repo.** Don't run them here, don't write `leads/` files, and don't use their 2-hour timeout. This skill borrows only their shape: a brief, three options shown as images, one recommended, Seb picks.

The rules in `CLAUDE.md` apply throughout: never push to `main` or deploy without asking, never print secrets, leave other people's uncommitted work alone.

## How this works on this machine

- **Workspace outside the repo:** `~/repos/tunetapper-design/<topic>/`, where `<topic>` is a short slug such as `bpm-detector-layout`. It holds `brief.md`, `shots/`, and one git worktree per option (`a/`, `b/`, `c/`). The repo is public and the brief contains traffic figures, so none of this is ever committed to it.
- **Worktrees, not branch switching.** The main working tree is shared and may hold uncommitted changes. Never check out a design branch in it.
- **Ports 3101, 3102, 3103** for options A, B, C. Port 3000 on this machine may be serving a different project. Never use it, and never stop a server you did not start.
- **Screenshots** come from `.claude/skills/design-options/shoot.mjs`, which drives the Chromium already in `~/.cache/ms-playwright`. Do not use the Playwright MCP, and never run `npx playwright install chrome`. If the script says `playwright-core` is missing: `mkdir -p ~/repos/tunetapper-design/tools && cd ~/repos/tunetapper-design/tools && npm init -y && npm install playwright-core`.
- **Design branches stay local.** Never push `design/*`: Vercel would build a preview for each.

Commands used throughout (`$T` is the topic folder, `$L` the option letter, `$PORT` its port):

```bash
# create an option
git worktree add -b design/<topic>-$L "$T/$L" main
(cd "$T/$L" && pnpm install --frozen-lockfile --prefer-offline)

# start its dev server and wait for it
(cd "$T/$L" && setsid nohup pnpm dev -p $PORT > "$T/dev-$L.log" 2>&1 &)
for i in $(seq 1 40); do curl -sf -o /dev/null http://localhost:$PORT/ && break; sleep 2; done
curl -s http://localhost:$PORT/<path> | grep -o '<title>[^<]*'    # must be the TuneTapper page

# screenshot: writes <prefix>-desktop.png (1440x900), -mobile.png (390x844), -full.png
node .claude/skills/design-options/shoot.mjs http://localhost:$PORT/<path> "$T/shots/<name>" [--theme light]

# stop the server (always, before ending any turn)
P=$(ss -ltnp | grep ":$PORT " | grep -o 'pid=[0-9]*' | cut -d= -f2 | head -1)
[ -n "$P" ] && kill -- -"$(ps -o pgid= -p "$P" | tr -d ' ')"
ss -ltn | grep ":$PORT " || echo stopped
```

Screenshots are dark theme by default, which is what most visitors see. Add a `--theme light` set whenever the change touches colour, contrast or surfaces.

## 1. Brief

Write `$T/brief.md` before touching code, 15 to 25 lines:

- **What is changing:** the page or component, its route(s) and source files.
- **Who uses it and for what:** DJs and producers who arrive from a search, want the tool to work immediately, and are often on a phone or mid-session. Name the one or two jobs this page does for them, in order.
- **What the change should achieve:** one outcome you could check afterwards (the main control is reachable without scrolling on a phone; the result is readable from a metre away).
- **What is at stake:** `git -C ~/repos/tunetapper-reports pull --ff-only`, read the newest `reports/YYYY-MM-DD.md`, and quote the affected pages' clicks, impressions, position and sessions with the report date. If the page is not in the report, say so. A page that earns a third of the site's clicks deserves a more conservative change than one with none.
- **What must not break:**
  - *Tool functionality:* list what the tool does and how you will exercise it after the change.
  - *SEO-relevant markup:* the `<title>` and description from `generateMetadata()`, the `h1` and heading order, breadcrumbs, and the JSON-LD blocks from `src/lib/seo.ts`. Record the current title and headings in the brief.
  - *Analytics events:* list every `analytics.*` / `trackEvent` call in the affected components (`grep -n "analytics\.\|trackEvent" <files>`). Each must still fire from the equivalent interaction.
  - *Theming:* CSS variables such as `var(--muted-foreground)`, not hard-coded colour classes; both themes must work.
- **Status:** one line you keep up to date (`options built`, `waiting for choice`, `building B`, `waiting for approval`, `landed`), so a later session can pick the work up.

## 2. Three options

Read the `frontend-design` skill first and follow it for the aesthetics.

Create option A's worktree and **take the "before" screenshots there before editing anything** (`$T/shots/before`), for every affected page. That worktree is exactly `main` at that point.

Then build three options, one per branch (`design/<topic>-a`, `-b`, `-c`). They must differ in idea: a different layout, hierarchy or interaction model, not three colour or spacing variants of one page. Two only if the change really leaves no room for a third. For each, write a `## Option A/B/C: <short name>` section in the brief with the idea in one line, what it changes for the user, and its main risk.

These are working sketches in the real code: enough of the affected page to judge at a glance, built on the real components with real content. Don't polish them and don't touch unrelated pages. Commit each on its own branch; never push.

Screenshot each option at desktop and mobile width (`$T/shots/option-a`, `option-b`, `option-c`). **Open every PNG with the Read tool before sending it**: confirm it shows the TuneTapper page you meant and that the three really look different. Don't show an option you would fail yourself in the review in step 4. Then stop all three servers.

Pick the one you recommend and say why in one or two sentences tied to the brief (who uses the page, what is at stake), not to taste.

## 3. Send the options and wait

Post one message in the thread, in the language Seb is writing in:

```
## <Topic>: choose a design
At stake: <page>: <clicks / impressions / sessions> (report <date>)

A: <name>: <one line>   ← recommended: <why, one sentence>
B: <name>: <one line>
C: <name>: <one line>

<current page, then each option: the desktop and the mobile screenshot>

Reply with A, B or C, or a mix ("B with A's header").
Nothing gets built until you answer.
```

Include the screenshots themselves in the message, the same as `client-design` does, each labelled with its letter and width, and list the folder path (`$T/shots/`) underneath.

**If images can't be shown inline in the thread,** publish the shots to the private repo `StreamSeb/tunetapper-reports` under `design/<topic>/` and link to each image instead:

```bash
R=~/repos/tunetapper-reports
gh repo view StreamSeb/tunetapper-reports --json visibility -q .visibility    # must print PRIVATE
git -C "$R" pull --ff-only
mkdir -p "$R/design/<topic>" && cp "$T"/shots/*.png "$R/design/<topic>/"
git -C "$R" add "design/<topic>"
git -C "$R" diff --cached --name-only    # must list only design/<topic>/*.png
git -C "$R" commit -m "Design screenshots: <topic>"
git -C "$R" push origin HEAD:main
```

Give one link per image, labelled with its letter and width: `https://github.com/StreamSeb/tunetapper-reports/blob/main/design/<topic>/<file>.png`. If the visibility check prints anything other than `PRIVATE`, don't push; give the local folder path and say why. Use the same fallback for the before/after screenshots in step 4 (re-copy and commit the new files). **Never put screenshots in the public tunetapper repo**, on any branch.

Set the brief's status to `waiting for choice`, then **end the turn and wait**.

- **Never build on a timeout.** Do not create a `CronCreate`, `ScheduleWakeup` or any other timer for this, and do not pick for Seb. If the session is unattended or no answer comes, the final message says the options are waiting, names the three branches and gives the screenshot folder.
- **A letter:** build that option.
- **A mix:** build it on the branch of the option it is mostly based on, and follow the request exactly.
- **None of them:** ask what is missing, build new options as `-d`, `-e`, `-f`, and send them the same way.
- **"Just do it" with no choice wanted:** Seb has to say so explicitly; only then build the recommended option.

## 4. Build, check, review

Build the chosen option properly in its worktree and note in the brief which option was chosen and any mix.

1. **Build and lint**, with that worktree's dev server stopped (both write to `.next`):
   ```bash
   (cd "$T/$L" && pnpm lint && pnpm build)
   ```
   Both must pass. Fix failures; don't silence them.
2. **What must not break.** Restart the dev server and check each item from the brief:
   - Operate the tool the way a user would and confirm it still works.
   - Compare the SEO markup with `main` (run the same command in a second worktree or against the saved "before" values in the brief):
     ```bash
     curl -s http://localhost:$PORT/<path> | grep -oE '<title>[^<]*|<h[1-3][^>]*>[^<]*|application/ld\+json' | sort | uniq -c
     ```
     Title, `h1`, heading set and the number of JSON-LD blocks stay the same unless the brief says a change is intended.
   - `git diff main -- <files> | grep -E '^-.*(analytics\.|trackEvent)'` must show no removed call that was not re-added.
3. **Screenshots:** `$T/shots/after` for every affected page, desktop and mobile, and the light theme if relevant. Read them.
4. **Impeccable detect**, on local URLs only (the browser runs without its sandbox):
   ```bash
   IMPECCABLE_BROWSER=~/.local/bin/chromium-nosandbox npx -y impeccable detect http://localhost:$PORT/<path>
   ```
   Run it on the "before" state too if you still can, or compare with a run against a fresh worktree of `main`. Fix every anti-pattern the change introduced. Findings that were already there are not yours to fix here; list them in the report. Don't install Impeccable's edit hook.
5. **Review against `frontend-design`'s guidance** and this short list, honestly, and fix every hit:
   - The page's main action is visible on a 390 px screen without scrolling, and nothing scrolls sideways.
   - A clear hierarchy: one thing is obviously most important.
   - No decoration added because pages "have it": gradients, glows, glass panels, pill badges, icon-in-a-rounded-square card rows.
   - Works in dark and light; no hard-coded colours.
   - Keyboard focus is visible and tab order follows the layout.
   - Nothing unrelated changed. `git diff --stat main` lists only files the brief named.
6. Commit on the design branch. Stop the dev server.

Then send:

```
## <Topic>: option <letter> built
Before / after: <desktop and mobile screenshot pairs for each affected page>

What changed:
- <three to six short lines>

Checks: build and lint pass · tool exercised (<how>) · title, headings and structured data unchanged · analytics events kept · Impeccable: <result>
Not done / still open: <anything, or "nothing">

It is on the local branch design/<topic>-<letter>, not pushed. Approve to land it on main (that deploys to production), or tell me what to change.
```

Set the status to `waiting for approval` and end the turn.

**If Seb asks for changes:** make them on the same branch, repeat steps 1 to 6, and send new before/after screenshots. Repeat until he approves or drops it.

## 5. Landing and clean-up

Only when Seb approves landing, and following `CLAUDE.md`:

```bash
git fetch origin
(cd "$T/$L" && git rebase origin/main && pnpm lint && pnpm build)   # only if main moved
git -C "$T/$L" push origin design/<topic>-$L:main                    # plain push, never forced
git -C ~/repos/tunetapper pull --ff-only                             # may refuse if the shared tree has local changes; say so and leave it
```

This pushes one branch's commits to `main` without touching the shared working tree and without publishing a `design/*` branch. If the rebase conflicts or the push is rejected, stop and report. Keep traffic figures out of commit messages.

Approval of the design is not approval to push. If Seb says "looks good" without mentioning landing, ask once.

Afterwards, or if the work is dropped:

```bash
git worktree remove "$T/a"; git worktree remove "$T/b"; git worktree remove "$T/c"
git branch -D design/<topic>-a design/<topic>-b design/<topic>-c      # only after it landed or Seb dropped it
```

Keep `brief.md` and `shots/`. Set the status to `landed` or `dropped`.

**Always, whenever a turn ends for any reason:** every dev server this skill started is stopped (`ss -ltn | grep -E ':310[1-3] '` prints nothing), and the final message says what state the work is in.
