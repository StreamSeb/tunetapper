"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import { Mic, MicOff, AlertCircle, Upload, Loader2, FileAudio } from "lucide-react"
import { estimateTempoFromEnvelope, detectBpm } from "@/lib/bpm-detection"
import { decodeToMono, analyzeKeyFromSamples } from "@/lib/key-detection"
import { analytics } from "@/lib/analytics"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ToolSupportNote } from "@/components/support-link"

type Status = "idle" | "listening" | "denied" | "error"
type FileStatus = "idle" | "working" | "done" | "error"

interface FileResult {
  name: string
  bpm: number
  alternativeBpm: number
  confidence: number
  camelot: string
  musicalName: string
  seconds: number
}

const AUDIO_EXT = /\.(mp3|wav|wave|flac|aac|ogg|oga|opus|m4a|mp4|aif|aiff|webm)$/i

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

const FRAME_SIZE = 1024 // ScriptProcessor buffer -> ~21 ms frames at 48 kHz
const WINDOW_S = 12 // analyze the most recent 12 seconds
const MIN_SECONDS = 5 // need this much audio before showing a reading

export function BpmDetectorTool() {
  const [status, setStatus] = useState<Status>("idle")
  const [bpm, setBpm] = useState<number | null>(null)
  const [confidence, setConfidence] = useState(0)
  const [level, setLevel] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [fileStatus, setFileStatus] = useState<FileStatus>("idle")
  const [fileResult, setFileResult] = useState<FileResult | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [fileName, setFileName] = useState("")
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const ctxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const envelopeRef = useRef<number[]>([])
  const prevEnergyRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recentBpmsRef = useRef<number[]>([])
  const startedAtRef = useRef(0)

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    processorRef.current?.disconnect()
    processorRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    void ctxRef.current?.close()
    ctxRef.current = null
    setStatus("idle")
    setLevel(0)
  }, [])

  const start = useCallback(async () => {
    setFileResult(null)
    setFileStatus("idle")
    setFileError(null)
    setBpm(null)
    setConfidence(0)
    setElapsed(0)
    envelopeRef.current = []
    recentBpmsRef.current = []
    prevEnergyRef.current = 0

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // Voice processing destroys musical transients - turn it all off
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
    } catch {
      setStatus("denied")
      return
    }

    try {
      const ctx = new AudioContext()
      await ctx.resume()
      const source = ctx.createMediaStreamSource(stream)
      // ScriptProcessorNode is deprecated but universally supported and fine
      // for a 21 ms energy envelope; an AudioWorklet would need a separately
      // served module for marginal gain here.
      const processor = ctx.createScriptProcessor(FRAME_SIZE, 1, 1)
      const envRate = ctx.sampleRate / FRAME_SIZE
      const maxFrames = Math.ceil(WINDOW_S * envRate)

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0)
        let energy = 0
        for (let i = 0; i < input.length; i++) energy += input[i] * input[i]
        // Half-wave rectified energy flux = onset strength
        const flux = Math.max(0, energy - prevEnergyRef.current)
        prevEnergyRef.current = energy
        const env = envelopeRef.current
        env.push(flux)
        if (env.length > maxFrames) env.splice(0, env.length - maxFrames)
        setLevel(Math.min(1, Math.sqrt(energy / input.length) * 8))
      }

      source.connect(processor)
      // ScriptProcessor must be connected to keep firing; route through a
      // muted gain so the mic is never audible in the speakers.
      const sink = ctx.createGain()
      sink.gain.value = 0
      processor.connect(sink)
      sink.connect(ctx.destination)

      ctxRef.current = ctx
      streamRef.current = stream
      processorRef.current = processor
      startedAtRef.current = Date.now()
      setStatus("listening")
      analytics.toolUsed("bpm_detector")

      intervalRef.current = setInterval(() => {
        const seconds = (Date.now() - startedAtRef.current) / 1000
        setElapsed(Math.floor(seconds))
        const env = envelopeRef.current
        if (seconds < MIN_SECONDS || env.length < envRate * MIN_SECONDS) return

        const result = estimateTempoFromEnvelope(Float32Array.from(env), envRate)
        if (result.bpm > 0 && result.confidence > 5) {
          const recent = recentBpmsRef.current
          recent.push(result.bpm)
          if (recent.length > 5) recent.shift()
          // Median of the last 5 estimates - stable against outlier windows
          const sorted = [...recent].sort((a, b) => a - b)
          setBpm(sorted[Math.floor(sorted.length / 2)])
          setConfidence(result.confidence)
        }
      }, 1000)
    } catch {
      stream.getTracks().forEach((t) => t.stop())
      setStatus("error")
    }
  }, [])

  useEffect(() => stop, [stop])

  const analyzeFile = useCallback(
    async (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "unknown"
      setFileResult(null)
      setBpm(null)
      if (!file.type.startsWith("audio/") && !AUDIO_EXT.test(file.name)) {
        setFileStatus("error")
        setFileError(`${file.name} is not an audio file. Try an MP3, WAV, FLAC, AAC, OGG or M4A.`)
        analytics.bpmFileFailed("unsupported_format")
        return
      }
      if (status === "listening") stop()
      setFileError(null)
      setFileName(file.name)
      setFileStatus("working")
      try {
        const decoded = await decodeToMono(file)
        // Let the spinner paint before the synchronous DSP work
        await new Promise((r) => setTimeout(r, 30))
        const tempo = detectBpm(decoded)
        // Speech, ambient pads and beatless audio still produce a "best"
        // lag; a near-flat autocorrelation means there is no real beat
        if (tempo.bpm <= 0 || tempo.confidence < 10) {
          setFileStatus("error")
          setFileError(
            "Couldn't find a steady beat in this file. It may be too short (under about 6 seconds) or have no clear drums."
          )
          analytics.bpmFileFailed("no_beat")
          return
        }
        const key = analyzeKeyFromSamples(decoded)
        setFileResult({
          name: file.name,
          bpm: tempo.bpm,
          alternativeBpm: tempo.alternativeBpm,
          confidence: tempo.confidence,
          camelot: key.camelot,
          musicalName: key.musicalName,
          seconds: decoded.samples.length / decoded.sampleRate,
        })
        setFileStatus("done")
        analytics.toolUsed("bpm_detector_file")
        analytics.bpmFileAnalyzed(tempo.bpm, file.type || ext)
      } catch (err) {
        setFileStatus("error")
        setFileError(err instanceof Error ? err.message : "Analysis failed.")
        analytics.bpmFileFailed("decode_failed")
      }
    },
    [status, stop]
  )

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void analyzeFile(file)
    e.target.value = ""
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void analyzeFile(file)
  }

  const shownBpm = fileResult ? fileResult.bpm : bpm
  const working = fileStatus === "working"

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold lg:text-4xl">
          BPM Detector &ndash; Find the Tempo of Any Song
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Drop in an MP3 or other audio file, or play music out loud and let
          your microphone listen. Nothing is recorded or uploaded.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          {/* Reading */}
          <div className="text-center mb-6">
            <p className="text-sm text-[var(--muted-foreground)] mb-2 truncate" aria-live="polite">
              {working
                ? `Analysing ${fileName}…`
                : fileResult
                ? `${fileResult.name} · ${formatDuration(fileResult.seconds)}`
                : status === "listening"
                ? bpm
                  ? `Confidence ${confidence}% - ${elapsed}s`
                  : elapsed < MIN_SECONDS
                    ? `Listening… ${elapsed}s`
                    : "Searching for a steady beat…"
                : "Drop a file or press listen"}
            </p>
            <div className="text-6xl font-bold font-mono">
              {working ? (
                <Loader2 className="inline h-12 w-12 animate-spin text-[var(--primary)]" aria-label="Analysing" />
              ) : (
                shownBpm ?? "---"
              )}
              <span className="text-2xl text-[var(--muted-foreground)] ml-2">
                BPM
              </span>
            </div>
            {fileResult && (
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                or {fileResult.alternativeBpm}{" "}
                {fileResult.bpm >= 120 ? "half-time" : "double-time"} · Key{" "}
                <Link
                  href={`/camelot/${fileResult.camelot.toLowerCase()}`}
                  className="font-medium text-[var(--foreground)] underline underline-offset-4"
                >
                  {fileResult.camelot} ({fileResult.musicalName})
                </Link>{" "}
                · Confidence {fileResult.confidence}%
              </p>
            )}
          </div>

          {/* Level meter */}
          {status === "listening" && (
            <div className="mb-6 h-2 w-full rounded-full bg-[var(--muted)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--primary)] transition-all duration-150"
                style={{ width: `${Math.round(level * 100)}%` }}
              />
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
          {/* File drop zone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Choose an audio file to analyse"
            onClick={() => !working && inputRef.current?.click()}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && !working) {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "flex h-32 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 text-center transition-colors cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
              dragging
                ? "border-[var(--primary)] bg-[var(--primary)]/5"
                : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]/40",
              working && "cursor-wait opacity-70"
            )}
          >
            <span className="flex items-center gap-2 text-lg font-bold">
              {fileResult ? <FileAudio className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
              {dragging ? (
                "Drop it here"
              ) : fileResult ? (
                "Analyse another file"
              ) : (
                <>
                  <span className="sm:hidden">Choose an audio file</span>
                  <span className="hidden sm:inline">Drop an audio file</span>
                </>
              )}
            </span>
            <span className="text-sm text-[var(--muted-foreground)]">
              <span className="hidden sm:inline">or click to browse · </span>MP3, WAV, FLAC, AAC, OGG, M4A
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.flac,.aac,.ogg,.m4a,.aiff"
              className="hidden"
              onChange={onFileChange}
            />
          </div>

          {/* Start/stop */}
          <button
            onClick={status === "listening" ? stop : start}
            disabled={working}
            className={cn(
              "w-full h-32 rounded-xl text-xl font-bold transition-all disabled:opacity-60",
              "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
              status === "listening"
                ? "bg-red-600 text-white hover:opacity-90"
                : "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90"
            )}
          >
            <span className="flex items-center justify-center gap-3">
              {status === "listening" ? (
                <>
                  <MicOff className="h-6 w-6" /> Stop
                </>
              ) : (
                <>
                  <Mic className="h-6 w-6" /> Listen with mic
                </>
              )}
            </span>
          </button>
          </div>

          {fileStatus === "error" && fileError && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm">
                {fileError} You can also find the tempo with the{" "}
                <Link href="/tools/tap-tempo" className="underline">
                  tap BPM counter
                </Link>
                .
              </p>
            </div>
          )}

          {status === "denied" && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm">
                Microphone access was blocked. Allow it in your browser&apos;s
                site settings, or find the BPM by tapping with the{" "}
                <Link href="/tools/tap-tempo" className="underline">
                  tap BPM counter
                </Link>
                .
              </p>
            </div>
          )}
          {status === "error" && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm">
                Could not start audio processing in this browser. Try the{" "}
                <Link href="/tools/tap-tempo" className="underline">
                  tap BPM counter
                </Link>{" "}
                instead.
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-center gap-4">
            <Badge variant="secondary">All processing on-device</Badge>
            <Badge variant="secondary">Nothing uploaded</Badge>
          </div>
        </CardContent>
      </Card>

      <ToolSupportNote tool="bpm_detector" />

      {/* Use BPM */}
      {shownBpm && (status === "listening" || fileResult) && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Use {shownBpm} BPM</CardTitle>
            <CardDescription>Continue to other tools with this tempo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/tools/bpm-delay?bpm=${Math.round(shownBpm)}`}>
                Calculate Delay Times
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/tools/bars-to-time?bpm=${Math.round(shownBpm)}`}>
                Calculate Bar Duration
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for a Clean Reading</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
            <li>• Have the track as a file? Drop it in - reading the audio directly is more accurate than listening through a mic</li>
            <li>• Using the mic, turn the music up - the beat needs to be louder than room noise</li>
            <li>• Works best on music with a clear drum beat (house, techno, hip-hop, pop)</li>
            <li>• With the mic, give it 5-10 seconds; the reading stabilizes over time</li>
            <li>• A reading that looks half or double the expected tempo is the same groove - see the half-time note on the <Link href="/tools/tap-tempo" className="underline">tap tempo page</Link></li>
            <li>• Ambient or beatless music has no steady onset pattern to measure - tap it instead</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
