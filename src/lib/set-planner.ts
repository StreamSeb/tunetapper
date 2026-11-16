/**
 * DJ set planner: transition scoring, harmonic ordering and exports.
 *
 * Pure functions with no browser APIs, so the ordering can be reasoned about
 * (and tested) on its own. Analysis of the audio itself reuses the key finder
 * (key-detection.ts) and BPM detector (bpm-detection.ts).
 */

import { getCamelotKey } from "./camelot"

export interface PlannedTrack {
  /** Stable id: name + size + lastModified, also used to skip duplicates */
  id: string
  fileName: string
  /** Folder-relative path when a folder was added, else the file name */
  path: string
  artist: string
  title: string
  camelot: string
  musicalName: string
  keyConfidence: number
  bpm: number
  alternativeBpm: number
  seconds: number
}

export type OrderMode = "harmonic" | "energy" | "added"

export type TransitionKind =
  | "same"
  | "adjacent"
  | "relative"
  | "diagonal"
  | "boost"
  | "clash"

export interface Transition {
  kind: TransitionKind
  /** Short label, e.g. "+1", "Same key", "Clash" */
  label: string
  /** Tempo change as a percentage of the outgoing track, after half/double matching */
  bpmPercent: number
  /** True when the best tempo match is half or double time */
  bpmHalfDouble: boolean
  /** Lower is smoother */
  cost: number
  /** Overall verdict used for colour */
  quality: "great" | "good" | "ok" | "rough"
}

// ── Key relationships ──────────────────────────────────────────────────────

/** Signed number of steps around the wheel from a to b, in -5..6 */
function wheelSteps(a: number, b: number): number {
  let d = (((b - a) % 12) + 12) % 12
  if (d > 6) d -= 12
  return d
}

export function keyRelation(fromCode: string, toCode: string): {
  kind: TransitionKind
  label: string
  cost: number
} {
  const from = getCamelotKey(fromCode)
  const to = getCamelotKey(toCode)
  if (!from || !to) return { kind: "clash", label: "Unknown key", cost: 6 }
  const steps = wheelSteps(from.number, to.number)
  const sameLetter = from.letter === to.letter

  if (sameLetter && steps === 0) return { kind: "same", label: "Same key", cost: 0 }
  if (sameLetter && Math.abs(steps) === 1)
    return { kind: "adjacent", label: steps > 0 ? "+1" : "−1", cost: 1 }
  if (!sameLetter && steps === 0) return { kind: "relative", label: "Relative", cost: 1.5 }
  if (sameLetter && steps === 2) return { kind: "boost", label: "+2 boost", cost: 3 }
  if (!sameLetter && Math.abs(steps) === 1)
    return { kind: "diagonal", label: "Diagonal", cost: 3.5 }
  if (sameLetter && steps === -2) return { kind: "boost", label: "−2", cost: 4 }
  // 7 semitones = 1 step, so anything further is a genuine clash
  return { kind: "clash", label: "Key clash", cost: 6 + Math.abs(steps) }
}

// ── Tempo relationships ────────────────────────────────────────────────────

export function bpmChange(from: number, to: number): { percent: number; halfDouble: boolean } {
  if (from <= 0 || to <= 0) return { percent: 0, halfDouble: false }
  const direct = ((to - from) / from) * 100
  const viaDouble = ((to * 2 - from) / from) * 100
  const viaHalf = ((to / 2 - from) / from) * 100
  let best = { percent: direct, halfDouble: false }
  // Only treat a pairing as half/double time when it is clearly closer
  // (a 70 -> 140 drum & bass switch), not by a hair
  if (Math.abs(viaDouble) + 2 < Math.abs(best.percent)) best = { percent: viaDouble, halfDouble: true }
  if (Math.abs(viaHalf) + 2 < Math.abs(best.percent)) best = { percent: viaHalf, halfDouble: true }
  return best
}

function bpmCost(percent: number, halfDouble: boolean): number {
  const d = Math.abs(percent)
  // Up to ~3% is a nudge of the pitch fader; 6-8% is still mixable;
  // beyond that the transition needs a cut, echo out or tempo ride
  let cost = d <= 3 ? d * 0.2 : d <= 8 ? 0.6 + (d - 3) * 0.45 : 2.85 + (d - 8) * 0.6
  if (halfDouble) cost += 1
  return cost
}

export function describeTransition(a: PlannedTrack, b: PlannedTrack): Transition {
  const key = keyRelation(a.camelot, b.camelot)
  const tempo = bpmChange(a.bpm, b.bpm)
  const cost = key.cost + bpmCost(tempo.percent, tempo.halfDouble)
  const quality: Transition["quality"] =
    cost <= 1.2 ? "great" : cost <= 2.6 ? "good" : cost <= 5 ? "ok" : "rough"
  return {
    kind: key.kind,
    label: key.label,
    bpmPercent: tempo.percent,
    bpmHalfDouble: tempo.halfDouble,
    cost,
    quality,
  }
}

// ── Ordering ───────────────────────────────────────────────────────────────

function costMatrix(tracks: PlannedTrack[]): Float64Array[] {
  const n = tracks.length
  const m: Float64Array[] = []
  for (let i = 0; i < n; i++) {
    const row = new Float64Array(n)
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      row[j] = describeTransition(tracks[i], tracks[j]).cost
    }
    m.push(row)
  }
  return m
}

function pathCost(order: number[], m: Float64Array[]): number {
  let c = 0
  for (let k = 0; k + 1 < order.length; k++) c += m[order[k]][order[k + 1]]
  return c
}

function nearestNeighbour(start: number, n: number, m: Float64Array[]): number[] {
  const used = new Uint8Array(n)
  const order = [start]
  used[start] = 1
  for (let step = 1; step < n; step++) {
    const last = order[order.length - 1]
    let best = -1
    let bestCost = Infinity
    for (let j = 0; j < n; j++) {
      if (!used[j] && m[last][j] < bestCost) {
        bestCost = m[last][j]
        best = j
      }
    }
    order.push(best)
    used[best] = 1
  }
  return order
}

/**
 * Improve an open path with 2-opt (segment reversal) and or-opt (moving one
 * track elsewhere). Costs may be asymmetric (energy mode), so reversed
 * segments are re-costed edge by edge. `fixedStart` keeps position 0.
 */
function improve(order: number[], m: Float64Array[], fixedStart: boolean, deadline: number): number[] {
  const n = order.length
  let best = order.slice()
  let bestCost = pathCost(best, m)
  let improved = true
  const first = fixedStart ? 1 : 0
  while (improved && performance.now() < deadline) {
    improved = false
    // 2-opt: reverse best[i..j]
    for (let i = first; i < n - 1; i++) {
      for (let j = i + 1; j < n; j++) {
        const cand = best.slice(0, i).concat(best.slice(i, j + 1).reverse(), best.slice(j + 1))
        const c = pathCost(cand, m)
        if (c + 1e-9 < bestCost) {
          best = cand
          bestCost = c
          improved = true
        }
      }
      if (performance.now() > deadline) break
    }
    // or-opt: move one track to another position
    for (let i = first; i < n; i++) {
      for (let j = first; j < n; j++) {
        if (i === j) continue
        const cand = best.slice()
        const [t] = cand.splice(i, 1)
        cand.splice(j, 0, t)
        const c = pathCost(cand, m)
        if (c + 1e-9 < bestCost) {
          best = cand
          bestCost = c
          improved = true
        }
      }
      if (performance.now() > deadline) break
    }
  }
  return best
}

/** Harmonic order of `tracks`; `pinned` (an index) opens the set when given */
function planHarmonic(tracks: PlannedTrack[], pinned: number, deadline: number): number[] {
  const n = tracks.length
  if (n <= 1) return tracks.map((_, i) => i)
  const m = costMatrix(tracks)
  const starts = pinned >= 0 ? [pinned] : Array.from({ length: n }, (_, i) => i)
  const budget = deadline - performance.now()
  let best: number[] = []
  let bestCost = Infinity
  for (const s of starts) {
    const o = nearestNeighbour(s, n, m)
    const c = pathCost(o, m)
    if (c < bestCost) {
      best = o
      bestCost = c
    }
    if (performance.now() > deadline - budget / 2) break
  }
  // The local search is cubic per pass; past a few hundred tracks the
  // nearest-neighbour order is kept as is
  if (n <= 400) best = improve(best, m, pinned >= 0, deadline)
  return best
}

/**
 * Energy build: tracks are grouped into tempo steps (no more than ~3% apart,
 * at most 10 per step), steps play slowest to fastest, and each step is
 * ordered harmonically, opening with the track that mixes best out of the
 * previous step. Tempo only ever drops within a step, by a pitch-fader nudge.
 */
function planEnergy(tracks: PlannedTrack[], startId: string | null, deadline: number): string[] {
  const pinned = startId ? tracks.find((t) => t.id === startId) : undefined
  const rest = tracks
    .filter((t) => t !== pinned)
    // Beatless tracks (bpm 0) make natural openers
    .sort((a, b) => a.bpm - b.bpm)
  const steps: PlannedTrack[][] = []
  for (const t of rest) {
    const cur = steps[steps.length - 1]
    if (cur && cur.length < 10 && (t.bpm === 0 ? cur[0].bpm === 0 : cur[0].bpm > 0 && t.bpm <= cur[0].bpm * 1.03)) {
      cur.push(t)
    } else steps.push([t])
  }
  const out: PlannedTrack[] = pinned ? [pinned] : []
  steps.forEach((step, k) => {
    const prev = out[out.length - 1]
    // Give each step a fair share of the remaining time
    const stepDeadline = performance.now() + (deadline - performance.now()) / (steps.length - k)
    let open = -1
    if (prev) {
      let bestCost = Infinity
      step.forEach((t, i) => {
        const c = describeTransition(prev, t).cost
        if (c < bestCost) {
          bestCost = c
          open = i
        }
      })
    }
    for (const i of planHarmonic(step, open, stepDeadline)) out.push(step[i])
  })
  return out.map((t) => t.id)
}

/**
 * Return track ids in set order. `startId` pins the opening track.
 * Harmonic mode runs nearest-neighbour from every start and then local
 * search, within a time budget so a few hundred tracks still sort in well
 * under a second.
 */
export function planSet(
  tracks: PlannedTrack[],
  mode: OrderMode,
  startId?: string | null,
  budgetMs = 600
): string[] {
  const n = tracks.length
  if (n <= 2 || mode === "added") {
    if (!startId) return tracks.map((t) => t.id)
    const rest = tracks.filter((t) => t.id !== startId).map((t) => t.id)
    return tracks.some((t) => t.id === startId) ? [startId, ...rest] : rest
  }
  const deadline = performance.now() + budgetMs
  if (mode === "energy") return planEnergy(tracks, startId ?? null, deadline)
  const pinned = startId ? tracks.findIndex((t) => t.id === startId) : -1
  return planHarmonic(tracks, pinned, deadline).map((i) => tracks[i].id)
}

export function summarizeSet(ordered: PlannedTrack[]) {
  const counts = { great: 0, good: 0, ok: 0, rough: 0 }
  for (let i = 0; i + 1 < ordered.length; i++) {
    counts[describeTransition(ordered[i], ordered[i + 1]).quality]++
  }
  const seconds = ordered.reduce((s, t) => s + t.seconds, 0)
  return { counts, seconds, transitions: Math.max(0, ordered.length - 1) }
}

// ── Track names ────────────────────────────────────────────────────────────

/** "01 - Artist - Title (Extended Mix).mp3" -> { artist, title } */
export function parseFileName(fileName: string): { artist: string; title: string } {
  let base = fileName.replace(/\.[a-z0-9]{2,5}$/i, "").replace(/_/g, " ").trim()
  // Leading track numbers: "01 ", "01. ", "01 - ", "A1 "
  base = base.replace(/^(\d{1,3}|[A-D]\d)\s*[-.)]?\s+/, "")
  const parts = base.split(/\s+[-–—]\s+/)
  if (parts.length >= 2) {
    return { artist: parts[0].trim(), title: parts.slice(1).join(" - ").trim() }
  }
  return { artist: "", title: base }
}

export function formatDuration(seconds: number): string {
  const s = Math.round(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = s % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`
    : `${m}:${String(r).padStart(2, "0")}`
}

// ── Exports ────────────────────────────────────────────────────────────────

function csvCell(v: string | number, untrusted: boolean): string {
  const s = String(v)
  // Artist, title and path come from the user's files: prefix formula-like
  // values so a spreadsheet shows them as text instead of running them
  const safe = untrusted && /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/** Columns filled from file tags or names */
const UNTRUSTED_COLUMNS = new Set([1, 2, 10])

export function toCsv(ordered: PlannedTrack[]): string {
  const header = [
    "#",
    "Artist",
    "Title",
    "Camelot",
    "Key",
    "BPM",
    "Length",
    "Transition in",
    "Tempo change in",
    "Key confidence",
    "File",
  ]
  const rows = ordered.map((t, i) => {
    const tr = i > 0 ? describeTransition(ordered[i - 1], t) : null
    return [
      i + 1,
      t.artist,
      t.title,
      t.camelot,
      t.musicalName,
      t.bpm || "",
      formatDuration(t.seconds),
      tr ? tr.label : "",
      tr ? `${tr.bpmPercent >= 0 ? "+" : ""}${tr.bpmPercent.toFixed(1)}%${tr.bpmHalfDouble ? " (half/double)" : ""}` : "",
      t.keyConfidence,
      t.path,
    ]
  })
  const lines = [header, ...rows].map((r, rowIndex) =>
    r.map((c, col) => csvCell(c, rowIndex > 0 && UNTRUSTED_COLUMNS.has(col))).join(",")
  )
  // Byte-order mark so Excel opens UTF-8 (accents, flats and sharps) correctly
  return "\uFEFF" + lines.join("\r\n") + "\r\n"
}

/** Extended M3U with folder-relative paths: save it next to the tracks to import into DJ software. */
export function toM3u(ordered: PlannedTrack[]): string {
  const lines = ["#EXTM3U"]
  for (const t of ordered) {
    const name = t.artist ? `${t.artist} - ${t.title}` : t.title
    lines.push(`#EXTINF:${Math.round(t.seconds)},${name}`)
    lines.push(t.path)
  }
  return lines.join("\n") + "\n"
}

export function toTracklist(ordered: PlannedTrack[]): string {
  return ordered
    .map((t, i) => {
      const name = t.artist ? `${t.artist} - ${t.title}` : t.title
      return `${i + 1}. ${name} [${t.camelot} · ${t.bpm} BPM]`
    })
    .join("\n")
}
