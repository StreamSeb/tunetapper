# Growth Plan - July 2026

Strategy derived from the July 2026 analytics review: interactive tool intent survives
AI-answer absorption (33% CTR on "camelot wheel calculator") while informational calc
queries are zero-click (/bars: 4,913 impressions, 1 click). The domain's constraint is
authority/backlinks, not on-page SEO. So: build shareable interactive assets, earn
links through launches/embeds/data, and grow the AI-referral channel (already ~11% of
sessions).

## Priorities

| # | Workstream | Issue | Type | Why this order |
|---|-----------|-------|------|----------------|
| 1 | Tap tempo quick wins (x2 / /2 toggle, metronome) | [#24](https://github.com/StreamSeb/tunetapper/issues/24) | build (S) | Immediate UX payoff; metronome engine is reused by the game |
| 2 | Rhythm accuracy game | [#21](https://github.com/StreamSeb/tunetapper/issues/21) | build (L) | The viral-loop asset; prerequisite for the launch (#28) |
| 3 | AI-referral optimization (llms.txt) | [#26](https://github.com/StreamSeb/tunetapper/issues/26) | build (S) | Cheap, growing channel, zero risk |
| 4 | Mic listen mode (BPM detector) | [#22](https://github.com/StreamSeb/tunetapper/issues/22) | build (M) | New query space ("bpm detector online"), strong differentiator |
| 5 | File BPM detection in key analyzer | [#23](https://github.com/StreamSeb/tunetapper/issues/23) | build (M) | Merges the two best assets into one flagship analyzer |
| 6 | Embeddable widgets | [#25](https://github.com/StreamSeb/tunetapper/issues/25) | build (M) | Passive backlink machine once tools are worth embedding |
| 7 | Data study (chart-hit BPMs) | [#27](https://github.com/StreamSeb/tunetapper/issues/27) | content (L) | Blocked on dataset sourcing - no fabricated data |
| 8 | Launch & outreach playbook | [#28](https://github.com/StreamSeb/tunetapper/issues/28) | human | Fires after 2 + 5 ship, so the launch has two hooks |

## Sequencing logic

- Ship 1-3 first (small, compounding, no dependencies).
- The game (#21) is the centerpiece: it is the only asset with an organic share loop,
  and the HN/PH launch (#28) should wait for it.
- Mic detection (#22) and file BPM (#23) share DSP groundwork (onset detection) -
  build #22 first, extract the shared parts into src/lib.
- The data study (#27) must not repeat the thin-programmatic mistake: real dataset,
  one substantial page, not thousands of generated ones.

## Non-goals (for now)

- Song BPM/key database from third-party APIs: same content as every competitor,
  and the May 2026 core update history says thin programmatic scale is a liability.
  The crowdsourced variant (analyzer users contribute) stays parked until the
  analyzer has meaningful usage.
- Phase 2 programmatic /bpm and /bars expansion: paused - zero-click space.

## Measurement

- `scripts/fetch-analytics.mjs` snapshot before/after each ship
- Game: share-card copies + direct sessions to /tools/rhythm-game
- Embeds: referring domains in GSC links report
- AI channel: "AI Assistant" sessions in GA4 channel report
