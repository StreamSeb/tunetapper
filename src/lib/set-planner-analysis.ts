/**
 * Browser-side plumbing for the set planner: collecting audio files from a
 * drop (including whole folders), and analysing them in a small pool of
 * Web Workers so many tracks can be processed without freezing the page.
 */

import { decodeToMono, analyzeKeyFromSamples } from "./key-detection"
import { detectBpm } from "./bpm-detection"
import type { AnalyzeRequest, AnalyzeResponse } from "./set-planner.worker"

export const AUDIO_EXT = /\.(mp3|wav|wave|flac|aac|ogg|oga|opus|m4a|mp4|aif|aiff|webm)$/i

export function isAudioFile(file: File): boolean {
  // macOS writes "._name.mp3" resource forks next to real files on exFAT/USB
  // sticks; they look like audio but hold no sound
  if (file.name.startsWith("._")) return false
  return AUDIO_EXT.test(file.name) || file.type.startsWith("audio/")
}

/** Relative path inside a dropped/chosen folder, or just the name */
export function filePath(file: File): string {
  const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath
  const p = rel || (file as File & { _ttPath?: string })._ttPath || file.name
  // Drop the top folder so an M3U saved inside that folder resolves
  const parts = p.split("/").filter(Boolean)
  return parts.length > 1 ? parts.slice(1).join("/") : parts[0] || file.name
}

// ── Collect files from a drop, walking folders ─────────────────────────────

type Entry = FileSystemEntry
async function readAllEntries(dir: FileSystemDirectoryEntry): Promise<Entry[]> {
  const reader = dir.createReader()
  const out: Entry[] = []
  // readEntries returns at most ~100 entries per call; keep going until empty
  for (;;) {
    const batch = await new Promise<Entry[]>((resolve, reject) => reader.readEntries(resolve, reject))
    if (batch.length === 0) break
    out.push(...batch)
  }
  return out
}

async function walk(entry: Entry, out: File[], depth: number): Promise<void> {
  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) =>
      (entry as FileSystemFileEntry).file(resolve, reject)
    )
    // Keep the folder path for M3U export (fullPath starts with "/")
    Object.defineProperty(file, "_ttPath", { value: entry.fullPath.replace(/^\//, "") })
    out.push(file)
  } else if (entry.isDirectory && depth < 8) {
    for (const child of await readAllEntries(entry as FileSystemDirectoryEntry)) {
      await walk(child, out, depth + 1)
    }
  }
}

export async function filesFromDrop(dt: DataTransfer): Promise<File[]> {
  const items = Array.from(dt.items || [])
  const entries = items
    .filter((i) => i.kind === "file")
    .map((i) => (typeof i.webkitGetAsEntry === "function" ? i.webkitGetAsEntry() : null))
  if (entries.length > 0 && entries.every(Boolean)) {
    const out: File[] = []
    for (const e of entries) {
      try {
        await walk(e as Entry, out, 0)
      } catch {
        // An unreadable entry shouldn't sink the whole drop
      }
    }
    return out
  }
  return Array.from(dt.files || [])
}

// ── Analysis ───────────────────────────────────────────────────────────────

export interface AnalysisResult {
  camelot: string
  musicalName: string
  keyConfidence: number
  bpm: number
  alternativeBpm: number
  bpmConfidence: number
  seconds: number
}

/** Decoding a 2-hour WAV would need gigabytes of memory */
export const MAX_FILE_BYTES = 300 * 1024 * 1024

export class AnalysisError extends Error {
  constructor(
    message: string,
    public reason: "too_large" | "decode_failed" | "too_short" | "analysis_failed"
  ) {
    super(message)
  }
}

type Pending = { resolve: (r: AnalyzeResponse) => void; reject: (e: Error) => void }

class WorkerLane {
  private worker: Worker | null = null
  private pending = new Map<string, Pending>()
  private broken = false

  private get(): Worker | null {
    if (this.broken) return null
    if (this.worker) return this.worker
    try {
      const w = new Worker(new URL("./set-planner.worker.ts", import.meta.url), { type: "module" })
      w.onmessage = (e: MessageEvent<AnalyzeResponse>) => {
        const p = this.pending.get(e.data.id)
        if (p) {
          this.pending.delete(e.data.id)
          p.resolve(e.data)
        }
      }
      w.onerror = () => {
        // Worker failed to load or crashed: fall back to the main thread
        this.broken = true
        for (const p of this.pending.values()) p.reject(new Error("worker_failed"))
        this.pending.clear()
        w.terminate()
        this.worker = null
      }
      this.worker = w
      return w
    } catch {
      this.broken = true
      return null
    }
  }

  async run(req: AnalyzeRequest): Promise<AnalyzeResponse> {
    const w = this.get()
    if (w) {
      try {
        return await new Promise<AnalyzeResponse>((resolve, reject) => {
          this.pending.set(req.id, { resolve, reject })
          w.postMessage(req, [req.samples.buffer])
        })
      } catch {
        // fall through to the main thread; the buffer was transferred, so
        // the caller re-decodes (rare path)
        throw new Error("worker_failed")
      }
    }
    return analyseOnMainThread(req)
  }

  dispose() {
    this.worker?.terminate()
    this.worker = null
    for (const p of this.pending.values()) p.reject(new Error("cancelled"))
    this.pending.clear()
  }
}

function analyseOnMainThread(req: AnalyzeRequest): AnalyzeResponse {
  try {
    const key = analyzeKeyFromSamples(req)
    const tempo = detectBpm(req)
    return {
      id: req.id,
      ok: true,
      camelot: key.camelot,
      musicalName: key.musicalName,
      keyConfidence: key.confidence,
      bpm: tempo.bpm,
      alternativeBpm: tempo.alternativeBpm,
      bpmConfidence: tempo.confidence,
    }
  } catch (err) {
    return { id: req.id, ok: false, error: err instanceof Error ? err.message : "failed" }
  }
}

export class AnalysisPool {
  private lanes: WorkerLane[]

  constructor(size: number) {
    this.lanes = Array.from({ length: Math.max(1, size) }, () => new WorkerLane())
  }

  get size() {
    return this.lanes.length
  }

  async analyse(lane: number, id: string, file: File): Promise<AnalysisResult> {
    if (file.size > MAX_FILE_BYTES) {
      throw new AnalysisError("Too large (over 300 MB). Is it a full mix?", "too_large")
    }
    let decoded
    try {
      decoded = await decodeToMono(file)
    } catch {
      throw new AnalysisError("Couldn't decode this file. It may be damaged or DRM-protected.", "decode_failed")
    }
    const seconds = decoded.samples.length / decoded.sampleRate
    if (seconds < 6) throw new AnalysisError("Too short to analyse (under 6 seconds).", "too_short")

    let res: AnalyzeResponse
    try {
      res = await this.lanes[lane % this.lanes.length].run({ id, ...decoded })
    } catch (err) {
      if (err instanceof Error && err.message === "cancelled") throw err
      // Worker died mid-job and took the samples with it: decode again here
      const again = await decodeToMono(file)
      res = analyseOnMainThread({ id, ...again })
    }
    if (!res.ok) throw new AnalysisError("Analysis failed on this file.", "analysis_failed")
    return {
      camelot: res.camelot,
      musicalName: res.musicalName,
      keyConfidence: res.keyConfidence,
      // A flat onset curve means no steady beat (ambient, beatless intro
      // tools); keep the track for its key but show no tempo
      bpm: res.bpm > 0 && res.bpmConfidence >= 10 ? res.bpm : 0,
      alternativeBpm: res.bpm > 0 && res.bpmConfidence >= 10 ? res.alternativeBpm : 0,
      bpmConfidence: res.bpmConfidence,
      seconds,
    }
  }

  dispose() {
    this.lanes.forEach((l) => l.dispose())
  }
}
