"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import { Mic, MicOff, AlertCircle } from "lucide-react"
import { estimateTempoFromEnvelope } from "@/lib/bpm-detection"
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

type Status = "idle" | "listening" | "denied" | "error"

const FRAME_SIZE = 1024 // ScriptProcessor buffer -> ~21 ms frames at 48 kHz
const WINDOW_S = 12 // analyze the most recent 12 seconds
const MIN_SECONDS = 5 // need this much audio before showing a reading

export function BpmDetectorTool() {
  const [status, setStatus] = useState<Status>("idle")
  const [bpm, setBpm] = useState<number | null>(null)
  const [confidence, setConfidence] = useState(0)
  const [level, setLevel] = useState(0)
  const [elapsed, setElapsed] = useState(0)

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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold lg:text-4xl">BPM Detector</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Play music out loud and let your microphone find the tempo -
          nothing is recorded or uploaded.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          {/* Reading */}
          <div className="text-center mb-6">
            <p className="text-sm text-[var(--muted-foreground)] mb-2">
              {status === "listening"
                ? bpm
                  ? `Confidence ${confidence}% - ${elapsed}s`
                  : elapsed < MIN_SECONDS
                    ? `Listening… ${elapsed}s`
                    : "Searching for a steady beat…"
                : "Press listen and play some music"}
            </p>
            <div className="text-6xl font-bold font-mono">
              {bpm ?? "---"}
              <span className="text-2xl text-[var(--muted-foreground)] ml-2">
                BPM
              </span>
            </div>
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

          {/* Start/stop */}
          <button
            onClick={status === "listening" ? stop : start}
            className={cn(
              "w-full h-32 rounded-xl text-xl font-bold transition-all",
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
                  <Mic className="h-6 w-6" /> Listen
                </>
              )}
            </span>
          </button>

          {status === "denied" && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-600 dark:text-red-400">
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
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-600 dark:text-red-400">
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
            <Badge variant="secondary">No recording</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Use BPM */}
      {bpm && status === "listening" && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Use {bpm} BPM</CardTitle>
            <CardDescription>Continue to other tools with this tempo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/tools/bpm-delay?bpm=${Math.round(bpm)}`}>
                Calculate Delay Times
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/tools/bars-to-time?bpm=${Math.round(bpm)}`}>
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
            <li>• Turn the music up - the beat needs to be louder than room noise</li>
            <li>• Works best on music with a clear drum beat (house, techno, hip-hop, pop)</li>
            <li>• Give it 5-10 seconds; the reading stabilizes over time</li>
            <li>• A reading that looks half or double the expected tempo is the same groove - see the half-time note on the <Link href="/tools/tap-tempo" className="underline">tap tempo page</Link></li>
            <li>• Ambient or beatless music has no steady onset pattern to measure - tap it instead</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
