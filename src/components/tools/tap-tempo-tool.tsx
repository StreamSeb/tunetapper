"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import { Copy, Check, RotateCcw, Play, Square } from "lucide-react"
import { analytics } from "@/lib/analytics"
import { Metronome } from "@/lib/metronome"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function TapTempoTool() {
  const [taps, setTaps] = useState<number[]>([])
  const [bpm, setBpm] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [lastTap, setLastTap] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const tapButtonRef = useRef<HTMLButtonElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const metronomeRef = useRef<Metronome | null>(null)

  const calculateBpm = useCallback((timestamps: number[]) => {
    if (timestamps.length < 2) return null

    // Calculate intervals between taps
    const intervals: number[] = []
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1])
    }

    // Average interval in ms
    const avgInterval =
      intervals.reduce((a, b) => a + b, 0) / intervals.length

    // Convert to BPM
    return Math.round(60000 / avgInterval)
  }, [])

  const handleTap = useCallback(() => {
    const now = Date.now()
    setLastTap(now)

    // Reset if it's been more than 3 seconds since last tap
    setTaps((prev) => {
      const newTaps =
        prev.length > 0 && now - prev[prev.length - 1] > 3000
          ? [now]
          : [...prev.slice(-7), now] // Keep last 8 taps for smoother average

      const calculatedBpm = calculateBpm(newTaps)
      if (calculatedBpm && calculatedBpm >= 20 && calculatedBpm <= 300) {
        setBpm(calculatedBpm)
      }

      return newTaps
    })

    // Clear existing timeout and set new one
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setLastTap(null)
    }, 200)
  }, [calculateBpm])

  const stopMetronome = useCallback(() => {
    metronomeRef.current?.stop()
    setIsPlaying(false)
  }, [])

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      stopMetronome()
      return
    }
    if (!bpm) return
    if (!metronomeRef.current) {
      metronomeRef.current = new Metronome({ bpm })
    }
    metronomeRef.current.setBpm(bpm)
    metronomeRef.current.start()
    setIsPlaying(true)
  }, [bpm, isPlaying, stopMetronome])

  // Half/double the reading - fixes the classic half-time/double-time misread
  const scaleBpm = useCallback((factor: number) => {
    setBpm((prev) => {
      if (!prev) return prev
      const next = Math.round(prev * factor)
      return next >= 20 && next <= 300 ? next : prev
    })
  }, [])

  const handleReset = useCallback(() => {
    // Track tap tempo usage before reset
    if (bpm && taps.length >= 2) {
      analytics.tapTempoUsed(bpm, taps.length)
    }
    analytics.tapTempoReset()
    stopMetronome()
    setTaps([])
    setBpm(null)
    setLastTap(null)
  }, [bpm, taps.length, stopMetronome])

  const handleCopy = useCallback(async () => {
    if (bpm) {
      try {
        await navigator.clipboard.writeText(bpm.toString())
        setCopied(true)
        analytics.valueCopied("bpm", bpm.toString())
        analytics.tapTempoUsed(bpm, taps.length)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("Failed to copy:", err)
      }
    }
  }, [bpm, taps.length])

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault()
        handleTap()
        tapButtonRef.current?.focus()
      } else if (e.code === "Escape" || e.code === "KeyR") {
        handleReset()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleTap, handleReset])

  // Keep a running metronome in tempo when the BPM changes (new taps, x2, /2)
  useEffect(() => {
    if (bpm) metronomeRef.current?.setBpm(bpm)
  }, [bpm])

  // Cleanup timeout and audio on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      metronomeRef.current?.dispose()
    }
  }, [])

  // Gaps between the recent taps, and how much they wander relative to their average
  const intervals = taps.slice(1).map((t, i) => t - taps[i])
  const avgInterval = intervals.length
    ? intervals.reduce((a, b) => a + b, 0) / intervals.length
    : 0
  const spread =
    intervals.length >= 2
      ? Math.sqrt(
          intervals.reduce((sum, v) => sum + (v - avgInterval) ** 2, 0) / intervals.length
        ) / avgInterval
      : null
  const steadiness =
    spread === null ? null : spread < 0.03 ? "steady" : spread < 0.08 ? "settling" : "uneven"

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold lg:text-4xl">Tap BPM Counter</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Tap along to the beat - your BPM displays after just 4 taps
        </p>
      </div>

      {/* Main Tap Area: an instrument-style readout, then the tap bar */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="rounded-xl bg-[var(--muted)] px-5 pb-4 pt-4" aria-live="polite">
            <p className="text-center text-xs font-medium text-[var(--muted-foreground)]">
              {taps.length === 0 ? "Waiting for taps" : `${taps.length} taps${steadiness ? `, ${steadiness}` : ""}`}
            </p>
            <div className="mt-1 flex items-baseline justify-center gap-2">
              <span className="font-mono text-7xl font-bold tabular-nums tracking-tight sm:text-8xl">
                {bpm ?? "---"}
              </span>
              <span className="text-xl font-semibold text-[var(--muted-foreground)]">BPM</span>
            </div>
            {/* One bar per gap between taps, scaled to the average: even bars mean even taps */}
            <div className="mt-4 flex h-12 items-end justify-center gap-1.5" aria-hidden="true">
              {Array.from({ length: 7 }, (_, i) => {
                const gap = intervals[intervals.length - 7 + i]
                const height = gap ? Math.min(100, Math.max(15, (gap / avgInterval) * 60)) : 15
                return (
                  <span
                    key={i}
                    className={cn(
                      "w-7 rounded-sm",
                      gap ? "bg-[var(--primary)]" : "bg-[var(--muted-foreground)]/30"
                    )}
                    style={{ height: `${height}%` }}
                  />
                )
              })}
            </div>
            <p className="mt-2 text-center text-xs text-[var(--muted-foreground)]">
              Gaps between your last taps
            </p>
          </div>
          <div className="text-center">
            {bpm && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scaleBpm(0.5)}
                  title="Halve - you may have tapped double-time"
                >
                  /2
                </Button>
                <span className="text-xs text-[var(--muted-foreground)]">
                  half/double-time?
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => scaleBpm(2)}
                  title="Double - you may have tapped half-time"
                >
                  x2
                </Button>
              </div>
            )}
          </div>

          <button
            ref={tapButtonRef}
            onClick={handleTap}
            aria-label="Tap the beat"
            className={cn(
              "relative mt-4 flex h-32 w-full select-none items-center justify-center gap-3 overflow-hidden rounded-xl text-2xl font-bold transition-transform duration-75",
              "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 active:scale-[0.985]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card)]"
            )}
          >
            <span className="relative z-10">TAP</span>
            <span className="relative z-10 rounded-md border border-current px-2 py-0.5 text-xs font-semibold opacity-80">
              Space
            </span>
            {lastTap && (
              <span className="absolute inset-0 bg-white/20 animate-pulse-ring" />
            )}
          </button>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button variant="outline" onClick={togglePlayback} disabled={!bpm}>
              {isPlaying ? (
                <Square className="mr-2 h-4 w-4" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              {isPlaying ? "Stop" : "Play"}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button variant="outline" onClick={handleCopy} disabled={!bpm}>
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-green-700 dark:text-green-400" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              Copy BPM
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Use BPM */}
      {bpm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Use {bpm} BPM</CardTitle>
            <CardDescription>
              Continue to other tools with this tempo
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/tools/bpm-delay?bpm=${bpm}`}>
                Calculate Delay Times
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/bpm/${bpm}`}>View {bpm} BPM Reference</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/tools/bars-to-time?bpm=${bpm}`}>
                Calculate Bar Duration
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Accurate BPM</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-[var(--muted-foreground)]">
            <li>• Tap at least 4-8 times for the most accurate result</li>
            <li>• Tap on the main beat (usually the kick drum or snare)</li>
            <li>• If you make a mistake, press Reset and start over</li>
            <li>• The tool automatically resets after 3 seconds of no taps</li>
            <li>• Use a keyboard for more precise timing</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
