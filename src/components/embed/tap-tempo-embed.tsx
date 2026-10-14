"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { TimingStrip } from "@/components/tools/timing-strip"

/**
 * Compact tap-tempo widget for third-party embedding (iframe).
 * Deliberately self-contained and chrome-free: the same readout and tap bar
 * as the tap tempo page, sized to fit a 300-340 px tall iframe, plus the
 * attribution link.
 */
export function TapTempoEmbed() {
  const [taps, setTaps] = useState<number[]>([])
  const [bpm, setBpm] = useState<number | null>(null)
  const [flash, setFlash] = useState(false)
  const flashTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleTap = useCallback(() => {
    const now = Date.now()
    setTaps((prev) => {
      const next =
        prev.length > 0 && now - prev[prev.length - 1] > 3000
          ? [now]
          : [...prev.slice(-7), now]
      if (next.length >= 2) {
        const intervals = next.slice(1).map((t, i) => t - next[i])
        const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length
        const calculated = Math.round(60000 / avg)
        if (calculated >= 20 && calculated <= 300) setBpm(calculated)
      }
      return next
    })
    setFlash(true)
    if (flashTimeout.current) clearTimeout(flashTimeout.current)
    flashTimeout.current = setTimeout(() => setFlash(false), 120)
  }, [])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault()
        handleTap()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      if (flashTimeout.current) clearTimeout(flashTimeout.current)
    }
  }, [handleTap])

  const intervals = taps.slice(1).map((t, i) => t - taps[i])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-3">
      <span className="sr-only" aria-live="polite">
        {bpm ? `${bpm} BPM` : ""}
      </span>
      <div className="w-full max-w-sm rounded-xl bg-[var(--muted)] px-4 pb-3 pt-3">
        <p className="text-center text-xs font-medium text-[var(--muted-foreground)]">
          {taps.length > 0 ? `${taps.length} taps` : "Tap along to the beat"}
        </p>
        <div className="flex items-baseline justify-center gap-2">
          <span className="font-mono text-5xl font-bold tabular-nums tracking-tight">
            {bpm ?? "---"}
          </span>
          <span className="text-lg font-semibold text-[var(--muted-foreground)]">BPM</span>
        </div>
        <TimingStrip intervals={intervals} className="mt-2 h-8" />
      </div>
      <button
        onClick={handleTap}
        aria-label="Tap the beat"
        className={cn(
          "flex h-20 w-full max-w-sm select-none items-center justify-center gap-3 rounded-xl text-xl font-bold transition-transform duration-75",
          "bg-[var(--primary)] text-[var(--primary-foreground)]",
          "hover:opacity-90 active:scale-[0.985]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
          flash && "scale-[0.985] opacity-90"
        )}
      >
        TAP
        <span className="rounded-md border border-current px-2 py-0.5 text-xs font-semibold opacity-80">
          Space
        </span>
      </button>
      <a
        href="https://tunetapper.com/tools/tap-tempo?utm_source=embed&utm_medium=widget"
        target="_blank"
        rel="noopener"
        className="text-xs text-[var(--muted-foreground)] underline hover:text-[var(--foreground)]"
      >
        Tap BPM counter by TuneTapper
      </a>
    </div>
  )
}
