"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import { Copy, Check, RotateCcw, Keyboard, Mouse } from "lucide-react"
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

export function TapTempoTool() {
  const [taps, setTaps] = useState<number[]>([])
  const [bpm, setBpm] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)
  const [lastTap, setLastTap] = useState<number | null>(null)
  const tapButtonRef = useRef<HTMLButtonElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  const handleReset = useCallback(() => {
    // Track tap tempo usage before reset
    if (bpm && taps.length >= 2) {
      analytics.tapTempoUsed(bpm, taps.length)
    }
    analytics.tapTempoReset()
    setTaps([])
    setBpm(null)
    setLastTap(null)
  }, [bpm, taps.length])

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold lg:text-4xl">BPM Finder — Tap Tempo</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Tap along to the beat — your BPM displays after just 4 taps
        </p>
      </div>

      {/* Main Tap Area */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          {/* BPM Display */}
          <div className="text-center mb-8">
            <p className="text-sm text-[var(--muted-foreground)] mb-2">
              {taps.length > 0 ? `${taps.length} taps` : "Start tapping"}
            </p>
            <div className="text-6xl font-bold font-mono">
              {bpm ?? "---"}
              <span className="text-2xl text-[var(--muted-foreground)] ml-2">
                BPM
              </span>
            </div>
          </div>

          {/* Tap Button */}
          <button
            ref={tapButtonRef}
            onClick={handleTap}
            className={cn(
              "w-full h-40 rounded-xl text-2xl font-bold transition-all",
              "bg-[var(--primary)] text-[var(--primary-foreground)]",
              "hover:opacity-90 active:scale-[0.98]",
              "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
              "relative overflow-hidden",
              lastTap && "animate-pulse"
            )}
          >
            <span className="relative z-10">TAP</span>
            {lastTap && (
              <span className="absolute inset-0 bg-white/20 animate-pulse-ring" />
            )}
          </button>

          {/* Instructions */}
          <div className="mt-4 flex justify-center gap-4">
            <Badge variant="secondary" className="gap-1">
              <Mouse className="h-3 w-3" />
              Click
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Keyboard className="h-3 w-3" />
              Space / Enter
            </Badge>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={handleCopy}
              disabled={!bpm}
            >
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-green-500" />
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
