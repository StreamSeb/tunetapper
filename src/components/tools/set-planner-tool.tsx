"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Check,
  ClipboardCopy,
  Download,
  FolderOpen,
  ListMusic,
  Loader2,
  Plus,
  RotateCcw,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ToolSupportNote } from "@/components/support-link"
import { analytics } from "@/lib/analytics"
import { getCamelotKey } from "@/lib/camelot"
import { readId3 } from "@/lib/id3"
import {
  describeTransition,
  formatDuration,
  parseFileName,
  planSet,
  summarizeSet,
  toCsv,
  toM3u,
  toTracklist,
  type OrderMode,
  type PlannedTrack,
  type Transition,
} from "@/lib/set-planner"
import {
  AnalysisError,
  AnalysisPool,
  filePath,
  filesFromDrop,
  isAudioFile,
} from "@/lib/set-planner-analysis"
import { cn } from "@/lib/utils"

const MAX_TRACKS = 500
const STORAGE_KEY = "tt_set_planner_v1"

interface Job {
  id: string
  file: File
  name: string
}

interface Failure {
  id: string
  name: string
  message: string
  file?: File
}

interface Saved {
  tracks: PlannedTrack[]
  order: string[]
  mode: OrderMode
  startId: string | null
  custom: boolean
}

function loadSaved(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as Saved
    if (!Array.isArray(s.tracks)) return null
    return s
  } catch {
    return null
  }
}

function fileId(f: File) {
  return `${f.name}|${f.size}|${f.lastModified}`
}

function download(name: string, text: string, type: string) {
  const blob = new Blob([text], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ── Small presentational pieces ────────────────────────────────────────────

/** Key pill coloured like the Camelot wheel segment for that key */
function KeyPill({ camelot, confidence }: { camelot: string; confidence: number }) {
  const key = getCamelotKey(camelot)
  const hue = key ? (key.number - 1) * 30 : 0
  const minor = key?.letter === "A"
  // Sparse or modal tracks score lower; flag only the genuinely unsure ones
  const low = confidence < 40
  return (
    <Link
      href={`/camelot/${camelot.toLowerCase()}`}
      title={`${key?.musical ?? camelot}${low ? " · low confidence, check by ear" : ""}`}
      className={cn(
        "inline-flex h-8 w-11 shrink-0 items-center justify-center rounded-md text-sm font-bold tabular-nums sm:w-12",
        minor ? "text-white" : "text-black"
      )}
      style={{
        background: minor ? `hsl(${hue}, 72%, 40%)` : `hsl(${hue}, 62%, 62%)`,
      }}
    >
      {camelot}
      {low && <span aria-label="low confidence">?</span>}
    </Link>
  )
}

const QUALITY_STYLES: Record<Transition["quality"], { dot: string; text: string; word: string }> = {
  great: { dot: "bg-green-500", text: "text-green-700 dark:text-green-400", word: "Smooth" },
  good: { dot: "bg-sky-500", text: "text-sky-700 dark:text-sky-400", word: "Good" },
  ok: { dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", word: "Workable" },
  rough: { dot: "bg-red-500", text: "text-red-700 dark:text-red-400", word: "Rough" },
}

function TransitionLine({ t }: { t: Transition }) {
  const q = QUALITY_STYLES[t.quality]
  const pct = Math.abs(t.bpmPercent) < 0.05 ? "±0%" : `${t.bpmPercent > 0 ? "+" : "−"}${Math.abs(t.bpmPercent).toFixed(1)}%`
  return (
    <div className="flex items-center gap-2 py-0.5 pl-[3.25rem] text-xs sm:pl-[6.5rem]">
      <span className={cn("h-1.5 w-1.5 rounded-full", q.dot)} aria-hidden="true" />
      <span className={cn("font-medium", q.text)}>{q.word}</span>
      <span className="text-[var(--muted-foreground)]">
        {t.label} · {pct}
        {t.bpmHalfDouble ? " (half/double time)" : ""}
      </span>
    </div>
  )
}

const MODES: { value: OrderMode; label: string; short: string; hint: string }[] = [
  { value: "harmonic", label: "Smoothest mix", short: "Smoothest", hint: "Fewest key clashes and tempo jumps" },
  { value: "energy", label: "Build energy", short: "Build energy", hint: "Harmonic order with the tempo climbing" },
  { value: "added", label: "As added", short: "As added", hint: "Keep your order, just show the transitions" },
]

// ── Main component ─────────────────────────────────────────────────────────

export function SetPlannerTool() {
  // Rendered client-only (see set-planner-loader), so localStorage can seed state
  const [saved] = useState(loadSaved)
  const [tracks, setTracks] = useState<Map<string, PlannedTrack>>(
    () => new Map((saved?.tracks ?? []).map((t) => [t.id, t]))
  )
  const [addedOrder, setAddedOrder] = useState<string[]>(() => saved?.tracks.map((t) => t.id) ?? [])
  const [order, setOrder] = useState<string[]>(() => saved?.order ?? [])
  const [mode, setMode] = useState<OrderMode>(saved?.mode ?? "harmonic")
  const [startId, setStartId] = useState<string | null>(saved?.startId ?? null)
  const [custom, setCustom] = useState(saved?.custom ?? false)

  const [queueSize, setQueueSize] = useState(0)
  const [doneCount, setDoneCount] = useState(0)
  const [current, setCurrent] = useState<string[]>([])
  const [failures, setFailures] = useState<Failure[]>([])
  const [notice, setNotice] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const [msPerTrack, setMsPerTrack] = useState(0)
  // Analysis lanes: each decodes one file and hands it to its own worker
  const [lanes] = useState(() =>
    Math.min(3, Math.max(1, Math.floor((navigator.hardwareConcurrency || 2) / 2)))
  )

  const filesRef = useRef<HTMLInputElement>(null)
  const folderRef = useRef<HTMLInputElement>(null)
  const queueRef = useRef<Job[]>([])
  const runningRef = useRef(0)
  const poolRef = useRef<AnalysisPool | null>(null)
  const cancelRef = useRef(false)
  const batchRef = useRef({ started: 0, done: 0, failed: 0, t0: 0 })
  const trackedUseRef = useRef(false)

  const busy = queueSize > 0 && doneCount < queueSize

  // ── Persist the analysed set (not the audio) for the next visit ─────────
  useEffect(() => {
    try {
      const data: Saved = { tracks: addedOrder.map((id) => tracks.get(id)!).filter(Boolean), order, mode, startId, custom }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // Private mode / storage full: the planner still works for this visit
    }
  }, [tracks, addedOrder, order, mode, startId, custom])

  useEffect(() => () => poolRef.current?.dispose(), [])

  // ── Ordering ────────────────────────────────────────────────────────────
  const replan = useCallback(
    (all: Map<string, PlannedTrack>, ids: string[], m: OrderMode, start: string | null) => {
      const list = ids.map((id) => all.get(id)).filter((t): t is PlannedTrack => Boolean(t))
      const next = planSet(list, m, start)
      setOrder(next)
      setCustom(false)
    },
    []
  )

  const orderedTracks = useMemo(() => {
    const seen = new Set<string>()
    const out: PlannedTrack[] = []
    for (const id of order) {
      const t = tracks.get(id)
      if (t && !seen.has(id)) {
        out.push(t)
        seen.add(id)
      }
    }
    // Tracks analysed since the last plan go at the end until the next plan
    for (const id of addedOrder) {
      const t = tracks.get(id)
      if (t && !seen.has(id)) out.push(t)
    }
    return out
  }, [order, addedOrder, tracks])

  const summary = useMemo(() => summarizeSet(orderedTracks), [orderedTracks])

  // ── Queue runner ────────────────────────────────────────────────────────
  // Plain function on purpose: it only touches refs and state setters, and
  // calls itself when a job finishes to start the next one
  function pump() {
    const pool = (poolRef.current ??= new AnalysisPool(lanes))
    while (runningRef.current < pool.size && queueRef.current.length > 0 && !cancelRef.current) {
      const job = queueRef.current.shift()!
      const lane = runningRef.current
      runningRef.current++
      setCurrent((c) => [...c, job.name])
      const started = performance.now()
      void (async () => {
        try {
          const tagsPromise = /\.mp3$/i.test(job.file.name) ? readId3(job.file) : Promise.resolve({})
          const [result, tags] = await Promise.all([pool.analyse(lane, job.id, job.file), tagsPromise])
          const fromName = parseFileName(job.file.name)
          const track: PlannedTrack = {
            id: job.id,
            fileName: job.file.name,
            path: filePath(job.file),
            artist: (tags as { artist?: string }).artist || fromName.artist,
            title: (tags as { title?: string }).title || fromName.title,
            camelot: result.camelot,
            musicalName: result.musicalName,
            keyConfidence: result.keyConfidence,
            bpm: result.bpm,
            alternativeBpm: result.alternativeBpm,
            seconds: result.seconds,
          }
          setTracks((prev) => new Map(prev).set(job.id, track))
          batchRef.current.done++
          const ms = performance.now() - started
          setMsPerTrack((prev) => (prev ? prev * 0.7 + ms * 0.3 : ms))
        } catch (err) {
          if (err instanceof Error && err.message === "cancelled") return
          const message = err instanceof Error ? err.message : "Analysis failed."
          const reason = err instanceof AnalysisError ? err.reason : "analysis_failed"
          setFailures((f) => [...f, { id: job.id, name: job.file.name, message, file: job.file }])
          setAddedOrder((ids) => ids.filter((id) => id !== job.id))
          batchRef.current.failed++
          analytics.setPlannerTrackFailed(reason)
        } finally {
          runningRef.current--
          setCurrent((c) => {
            const i = c.indexOf(job.name)
            return i === -1 ? c : [...c.slice(0, i), ...c.slice(i + 1)]
          })
          setDoneCount((d) => d + 1)
          pump()
        }
      })()
    }
  }

  // When a batch finishes, plan the set (unless the user has hand-ordered it)
  const finishedBatch = queueSize > 0 && doneCount >= queueSize && current.length === 0
  const lastFinishRef = useRef(0)
  useEffect(() => {
    if (!finishedBatch || lastFinishRef.current === queueSize) return
    // Planning is synchronous and cheap; run it after this commit
    const timer = setTimeout(() => {
      if (lastFinishRef.current === queueSize) return
      lastFinishRef.current = queueSize
      const b = batchRef.current
      analytics.setPlannerAnalysisDone(b.done, b.failed, Math.round((performance.now() - b.t0) / 1000))
      if (!custom) replan(tracks, addedOrder, mode, startId)
    }, 0)
    return () => clearTimeout(timer)
  }, [finishedBatch, queueSize, custom, replan, tracks, addedOrder, mode, startId])

  function addFiles(files: File[], source: "drop" | "files" | "folder") {
    {
      setNotice(null)
      const audio = files.filter(isAudioFile)
      const skippedOther = files.length - audio.length
      const known = new Set([...addedOrder, ...queueRef.current.map((j) => j.id)])
      const fresh: Job[] = []
      let dupes = 0
      for (const f of audio) {
        const id = fileId(f)
        if (known.has(id)) {
          dupes++
          continue
        }
        known.add(id)
        fresh.push({ id, file: f, name: f.name })
      }
      const room = MAX_TRACKS - known.size + fresh.length
      const accepted = fresh.slice(0, Math.max(0, room))
      const overLimit = fresh.length - accepted.length

      const notes: string[] = []
      if (accepted.length === 0 && audio.length === 0)
        notes.push("No audio files found. The planner reads MP3, WAV, FLAC, AAC, OGG, M4A and AIFF.")
      if (skippedOther > 0 && audio.length > 0)
        notes.push(`Skipped ${skippedOther} non-audio file${skippedOther === 1 ? "" : "s"}.`)
      if (dupes > 0) notes.push(`${dupes} track${dupes === 1 ? " was" : "s were"} already in the set.`)
      if (overLimit > 0) notes.push(`A set can hold ${MAX_TRACKS} tracks, so ${overLimit} were left out.`)
      if (notes.length) setNotice(notes.join(" "))
      if (accepted.length === 0) return

      if (!trackedUseRef.current) {
        trackedUseRef.current = true
        analytics.toolUsed("set_planner")
      }
      analytics.setPlannerFilesAdded(accepted.length, source)

      cancelRef.current = false
      if (doneCount >= queueSize) {
        // New batch
        batchRef.current = { started: accepted.length, done: 0, failed: 0, t0: performance.now() }
        setQueueSize(accepted.length)
        setDoneCount(0)
      } else {
        batchRef.current.started += accepted.length
        setQueueSize((q) => q + accepted.length)
      }
      // A file that failed before and is added again gets a fresh attempt
      const acceptedIds = new Set(accepted.map((j) => j.id))
      setFailures((f) => f.filter((x) => !acceptedIds.has(x.id)))
      setAddedOrder((ids) => [...ids, ...accepted.map((j) => j.id)])
      queueRef.current.push(...accepted)
      pump()
    }
  }

  const cancel = () => {
    cancelRef.current = true
    const dropped = queueRef.current.map((j) => j.id)
    queueRef.current = []
    setAddedOrder((ids) => ids.filter((id) => !dropped.includes(id)))
    setQueueSize((q) => q - dropped.length)
  }

  const retryFailures = () => {
    const files = failures.map((f) => f.file).filter((f): f is File => Boolean(f))
    setFailures([])
    addFiles(files, "files")
  }

  const clearAll = () => {
    if (busy) cancel()
    setTracks(new Map())
    setAddedOrder([])
    setOrder([])
    setFailures([])
    setStartId(null)
    setCustom(false)
    setNotice(null)
    setQueueSize(0)
    setDoneCount(0)
    lastFinishRef.current = 0
  }

  // ── Manual editing ──────────────────────────────────────────────────────
  const move = (index: number, delta: number) => {
    const ids = orderedTracks.map((t) => t.id)
    const j = index + delta
    if (j < 0 || j >= ids.length) return
    ;[ids[index], ids[j]] = [ids[j], ids[index]]
    setOrder(ids)
    if (!custom) analytics.setPlannerReordered("manual")
    setCustom(true)
  }

  const remove = (id: string) => {
    setTracks((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
    setAddedOrder((ids) => ids.filter((x) => x !== id))
    setOrder((ids) => ids.filter((x) => x !== id))
    if (startId === id) setStartId(null)
  }

  const changeMode = (m: OrderMode) => {
    setMode(m)
    analytics.setPlannerReordered(m)
    replan(tracks, addedOrder, m, startId)
  }

  const changeStart = (id: string) => {
    const s = id || null
    setStartId(s)
    replan(tracks, addedOrder, mode, s)
  }

  // ── Export ──────────────────────────────────────────────────────────────
  const stamp = () => new Date().toISOString().slice(0, 10)
  const exportCsv = () => {
    download(`dj-set-${stamp()}.csv`, toCsv(orderedTracks), "text/csv;charset=utf-8")
    analytics.setPlannerExported("csv", orderedTracks.length)
  }
  const exportM3u = () => {
    download(`dj-set-${stamp()}.m3u8`, toM3u(orderedTracks), "audio/x-mpegurl;charset=utf-8")
    analytics.setPlannerExported("m3u", orderedTracks.length)
  }
  const copyList = async () => {
    try {
      await navigator.clipboard.writeText(toTracklist(orderedTracks))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      analytics.setPlannerExported("clipboard", orderedTracks.length)
    } catch {
      setNotice("Couldn't copy to the clipboard in this browser. Use the CSV export instead.")
    }
  }

  // ── Drop handling ───────────────────────────────────────────────────────
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const files = await filesFromDrop(e.dataTransfer)
    addFiles(files, "drop")
  }

  const onPick = (e: React.ChangeEvent<HTMLInputElement>, source: "files" | "folder") => {
    const files = Array.from(e.target.files || [])
    e.target.value = ""
    addFiles(files, source)
  }

  const hasTracks = orderedTracks.length > 0
  const remaining = Math.max(0, queueSize - doneCount)
  const etaSeconds = msPerTrack ? Math.round((remaining * msPerTrack) / lanes / 1000) : 0
  const showDropzone = !hasTracks && !busy

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(true)
    },
    onDragLeave: (e: React.DragEvent) => {
      if (e.currentTarget.contains(e.relatedTarget as Node)) return
      setDragging(false)
    },
    onDrop,
  }

  return (
    <div {...dropHandlers} className="relative">
      <input
        ref={filesRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a,.aiff,.aif,.opus"
        className="hidden"
        onChange={(e) => onPick(e, "files")}
      />
      <input
        ref={folderRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => onPick(e, "folder")}
        {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
      />

      {/* Full-card overlay while dragging over a set that already has tracks */}
      {dragging && !showDropzone && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl border-2 border-dashed border-[var(--primary)] bg-[var(--background)]/85">
          <p className="text-lg font-semibold">Drop to add tracks to the set</p>
        </div>
      )}

      {showDropzone ? (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div
              role="button"
              tabIndex={0}
              onClick={() => filesRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  filesRef.current?.click()
                }
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors sm:py-16",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                dragging
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]/40"
              )}
            >
              <div className="rounded-full bg-[var(--muted)] p-4">
                <ListMusic className="h-8 w-8 text-[var(--muted-foreground)]" />
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {dragging ? "Drop your tracks here" : (
                    <>
                      <span className="hidden sm:inline">Drop a folder or a stack of tracks</span>
                      <span className="sm:hidden">Pick the tracks for your set</span>
                    </>
                  )}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  MP3 · WAV · FLAC · AAC · OGG · M4A · AIFF, up to {MAX_TRACKS} tracks
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    filesRef.current?.click()
                  }}
                >
                  <Upload className="mr-2 h-4 w-4" /> Choose tracks
                </Button>
                <Button
                  variant="outline"
                  className="hidden sm:inline-flex"
                  onClick={(e) => {
                    e.stopPropagation()
                    folderRef.current?.click()
                  }}
                >
                  <FolderOpen className="mr-2 h-4 w-4" /> Choose a folder
                </Button>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-[var(--muted-foreground)]">
              Tracks are analysed on your device. Nothing is uploaded.
            </p>
            {notice && <Notice text={notice} onClose={() => setNotice(null)} />}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Progress */}
          {busy && (
            <Card className="mb-4" aria-live="polite">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      Analysing {Math.min(doneCount + 1, queueSize)} of {queueSize}
                      {etaSeconds > 5 && (
                        <span className="font-normal text-[var(--muted-foreground)]">
                          {" "}
                          · about {etaSeconds >= 90 ? `${Math.round(etaSeconds / 60)} min` : `${etaSeconds} s`} left
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-[var(--muted-foreground)]">
                      <Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      {current[0] ?? "Starting…"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={cancel}>
                    <Square className="mr-1.5 h-3.5 w-3.5" /> Stop
                  </Button>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                  <div
                    className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                    style={{ width: `${queueSize ? Math.round((doneCount / queueSize) * 100) : 0}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {notice && <Notice text={notice} onClose={() => setNotice(null)} className="mb-4" />}

          {failures.length > 0 && (
            <Card className="mb-4 border-red-500/30">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 font-semibold text-red-700 dark:text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {failures.length} track{failures.length === 1 ? "" : "s"} couldn&apos;t be analysed
                  </p>
                  <div className="flex gap-2">
                    {failures.some((f) => f.file) && (
                      <Button variant="ghost" size="sm" onClick={retryFailures} disabled={busy}>
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Retry
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setFailures([])} aria-label="Dismiss">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <ul className="mt-2 space-y-1 text-sm">
                  {failures.slice(0, 8).map((f) => (
                    <li key={f.id} className="flex gap-2">
                      <span className="truncate font-medium">{f.name}</span>
                      <span className="shrink-0 text-[var(--muted-foreground)]">{f.message}</span>
                    </li>
                  ))}
                  {failures.length > 8 && (
                    <li className="text-[var(--muted-foreground)]">and {failures.length - 8} more</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}

          {hasTracks && (
            <Card className="mb-6">
              <CardContent className="px-3 pt-5 sm:px-6">
                {/* Controls */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium">Order</p>
                    <div
                      role="radiogroup"
                      aria-label="Order"
                      className="grid w-full grid-cols-3 rounded-lg border border-[var(--border)] p-0.5 sm:inline-grid sm:w-auto"
                    >
                      {MODES.map((m) => (
                        <button
                          key={m.value}
                          role="radio"
                          aria-checked={!custom && mode === m.value}
                          title={m.hint}
                          disabled={busy}
                          onClick={() => changeMode(m.value)}
                          className={cn(
                            "whitespace-nowrap rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors disabled:opacity-60 sm:px-3 sm:text-sm",
                            !custom && mode === m.value
                              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                              : "hover:bg-[var(--muted)]"
                          )}
                        >
                          <span className="sm:hidden">{m.short}</span>
                          <span className="hidden sm:inline">{m.label}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {custom
                        ? "Your own order. Pick a mode to sort again."
                        : MODES.find((m) => m.value === mode)?.hint}
                    </p>
                  </div>
                  <label className="space-y-1.5 lg:w-64">
                    <span className="block text-sm font-medium">Open with</span>
                    <select
                      value={startId ?? ""}
                      disabled={busy || mode === "added"}
                      onChange={(e) => changeStart(e.target.value)}
                      className="h-9 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-2 text-sm disabled:opacity-60"
                    >
                      <option value="">Let the planner choose</option>
                      {[...orderedTracks]
                        .sort((a, b) => (a.artist + a.title).localeCompare(b.artist + b.title))
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.camelot} · {t.bpm || "–"} · {t.artist ? `${t.artist} - ` : ""}
                            {t.title}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>

                {/* Summary */}
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-[var(--border)] py-3 text-sm">
                  <span>
                    <strong>{orderedTracks.length}</strong> tracks · <strong>{formatDuration(summary.seconds)}</strong>
                  </span>
                  {(["great", "good", "ok", "rough"] as const).map((q) =>
                    summary.counts[q] > 0 ? (
                      <span key={q} className="inline-flex items-center gap-1.5">
                        <span className={cn("h-2 w-2 rounded-full", QUALITY_STYLES[q].dot)} aria-hidden="true" />
                        {summary.counts[q]} {QUALITY_STYLES[q].word.toLowerCase()}
                      </span>
                    ) : null
                  )}
                </div>

                {/* Track list */}
                <ol className="mt-3" aria-label="Set order">
                  {orderedTracks.map((t, i) => (
                    <li key={t.id}>
                      {i > 0 && <TransitionLine t={describeTransition(orderedTracks[i - 1], t)} />}
                      <div className="group flex items-center gap-2 rounded-lg py-1.5 hover:bg-[var(--muted)]/40 sm:gap-3 sm:px-2">
                        <span className="hidden w-6 shrink-0 text-right text-sm tabular-nums text-[var(--muted-foreground)] sm:block">
                          {i + 1}
                        </span>
                        <KeyPill camelot={t.camelot} confidence={t.keyConfidence} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium" title={t.path}>
                            {t.title}
                          </p>
                          <p className="truncate text-xs text-[var(--muted-foreground)]">
                            {t.artist || t.fileName}
                            <span className="sm:hidden"> · {formatDuration(t.seconds)}</span>
                          </p>
                        </div>
                        <span
                          className="w-11 shrink-0 text-right font-mono text-sm tabular-nums sm:w-14"
                          title={t.bpm ? `or ${t.alternativeBpm} BPM` : "No steady beat found"}
                        >
                          {t.bpm || "–"}
                        </span>
                        <span className="hidden w-12 shrink-0 text-right text-sm tabular-nums text-[var(--muted-foreground)] sm:block">
                          {formatDuration(t.seconds)}
                        </span>
                        <div className="flex shrink-0 items-center">
                          <IconButton label={`Move ${t.title} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                            <ArrowUp className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            label={`Move ${t.title} down`}
                            disabled={i === orderedTracks.length - 1}
                            onClick={() => move(i, 1)}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </IconButton>
                          <IconButton label={`Remove ${t.title}`} onClick={() => remove(t.id)}>
                            <Trash2 className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Actions */}
                <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
                  <Button onClick={exportCsv} disabled={busy}>
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                  </Button>
                  <Button variant="outline" onClick={exportM3u} disabled={busy} title="Playlist file for rekordbox, Serato, Traktor or VirtualDJ">
                    <Download className="mr-2 h-4 w-4" /> Export M3U playlist
                  </Button>
                  <Button variant="outline" onClick={copyList} disabled={busy}>
                    {copied ? <Check className="mr-2 h-4 w-4" /> : <ClipboardCopy className="mr-2 h-4 w-4" />}
                    {copied ? "Copied" : "Copy tracklist"}
                  </Button>
                  <Button variant="ghost" onClick={() => filesRef.current?.click()}>
                    <Plus className="mr-2 h-4 w-4" /> Add tracks
                  </Button>
                  <Button variant="ghost" onClick={clearAll} className="sm:ml-auto">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear set
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!hasTracks && !busy && (
            <div className="mb-6 text-center">
              <Button onClick={clearAll} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" /> Start over
              </Button>
            </div>
          )}
        </>
      )}

      {hasTracks && <ToolSupportNote tool="set_planner" className="mt-0" />}
    </div>
  )
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-7 items-center justify-center rounded-md sm:w-8 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-30 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  )
}

function Notice({ text, onClose, className }: { text: string; onClose: () => void; className?: string }) {
  return (
    <div
      className={cn(
        "mt-4 flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300",
        className
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{text}</p>
      <button type="button" onClick={onClose} aria-label="Dismiss" className="shrink-0 opacity-70 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
