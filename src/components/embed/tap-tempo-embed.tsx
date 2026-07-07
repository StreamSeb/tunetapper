"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

/**
 * Compact tap-tempo widget for third-party embedding (iframe).
 * Deliberately self-contained and chrome-free: one button, one number,
 * and the attribution link.
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <div className="text-center">
        <span className="text-5xl font-bold font-mono">{bpm ?? "---"}</span>
        <span className="ml-2 text-xl text-[var(--muted-foreground)]">BPM</span>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {taps.length > 0 ? `${taps.length} taps` : "Tap along to the beat"}
        </p>
      </div>
      <button
        onClick={handleTap}
        className={cn(
          "w-full max-w-sm h-28 rounded-xl text-xl font-bold transition-all",
          "bg-[var(--primary)] text-[var(--primary-foreground)]",
          "hover:opacity-90 active:scale-[0.98]",
          flash && "scale-[0.98] opacity-90"
        )}
      >
        TAP
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
