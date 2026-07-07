# Launch Playbook (issue #28)

Drafts for the human-executed distribution push. Everything below assumes the
July 2026 features are deployed: rhythm game, mic BPM detector, key+BPM
analyzer, embeds.

UTM convention for everything in this playbook:
`?utm_source=<hn|ph|reddit|yt>&utm_medium=launch&utm_campaign=jul2026`

## 1. Show HN draft

**Title (pick one):**
- `Show HN: A song key and BPM analyzer that never uploads your audio`
- `Show HN: In-browser key detection with Krumhansl-Schmuckler, no WASM`

**URL:** https://tunetapper.com/tools/key-analyzer

**First comment (post immediately after submitting):**

> Hi HN - I built a key + BPM analyzer for DJs that runs entirely in the
> browser. Drop in an MP3/WAV/FLAC and it returns the musical key, Camelot
> code, and tempo. Nothing is uploaded: decoding is plain Web Audio API, key
> detection is the Krumhansl-Schmuckler profile-matching algorithm over a
> chromagram (with a treble-band second pass to disambiguate major/minor),
> and BPM is spectral-flux onset detection + comb-weighted autocorrelation.
> No WASM, no server, ~500 lines of TypeScript.
>
> I went this route after discovering the popular open-source option
> (Essentia.js) is AGPL, which is awkward for web distribution. Writing it
> from scratch was a fun rabbit hole - happy to answer questions about the
> DSP or the accuracy tradeoffs.
>
> There's also a silly-but-hard rhythm test that measures how well you keep
> a beat after the metronome goes silent:
> https://tunetapper.com/tools/rhythm-game

Notes: post on a weekday morning US time; do not resubmit the same URL within
weeks; engage every technical question quickly for the first 3 hours.

## 2. Product Hunt draft

- **Name:** TuneTapper
- **Tagline:** Free DJ & producer tools that never upload your audio
- **Description:** Key + BPM analyzer, tap tempo, mic BPM detector, Camelot
  wheel, and a rhythm accuracy game - all running 100% in your browser. No
  signup, no upload, no install.
- **First comment:** same story as HN but less DSP, more "why": DJs
  constantly need key/BPM answers and every existing tool wants an upload,
  an account, or $58. Mention the rhythm game as the fun hook and ask for
  scores in the comments.
- **Gallery:** screenshots of analyzer result, rhythm game result card
  (with emoji row), Camelot wheel, and one dark-mode shot.

## 3. Reddit guardrails

Subs, in order of fit: r/Beatmatch (beginner DJs, tool questions weekly),
r/DJs, r/edmproduction, r/WeAreTheMusicMakers, r/musicproduction.

Rules of engagement:
- Answer the question first, in full, as text. Link only when it genuinely
  answers ("what BPM is this song?" -> tap tempo or analyzer).
- Never post a bare link as a thread. The one exception: r/Beatmatch and
  r/edmproduction allow tool-share threads - post the rhythm game there
  once, framed as a challenge ("what's your score on Hard?"), not a promo.
- One account, real profile, participate on threads that have nothing to do
  with TuneTapper too. Reddit's spam filter and mods both check this.
- Space out: max one link per sub per week.

## 4. Creator outreach template (10-50k sub DJ tutorial channels)

Subject: free tool your beatmatching tutorial viewers might like

> Hi <name> - I watched your <specific video> and thought this might be
> useful to your viewers: a free in-browser rhythm test that scores how
> well you keep a beat after the metronome cuts out
> (https://tunetapper.com/tools/rhythm-game). It pairs well with
> beatmatching practice - same skill, measurable number.
>
> There's also a key+BPM analyzer that runs without uploading the track,
> and an embeddable BPM counter widget if you ever want one on your own
> site (https://tunetapper.com/tools/embed). No catch - everything's free;
> I'm just trying to get it in front of DJs. If you mention it, great; if
> not, no hard feelings.

Personalize the first line per channel or don't send it.

## 5. Sequence

1. Deploy + verify everything works in production (esp. mic detector on
   iOS Safari).
2. Soft-post the rhythm game to r/Beatmatch -> fix whatever confuses people.
3. Show HN (analyzer as the lead, game as the second link).
4. Product Hunt ~1-2 weeks later (reuse HN feedback).
5. Creator outreach ongoing, 3-5 emails/week.
6. Watch: GSC links report (embeds), GA4 channels (referral/AI), game share
   events in GA4.
