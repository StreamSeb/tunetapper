import { cn } from "@/lib/utils"

/**
 * One bar per gap between the most recent taps, scaled around their average
 * and exaggerated so small drifts show: even bars mean even tapping.
 */
export function TimingStrip({
  intervals,
  bars = 7,
  className,
}: {
  intervals: number[]
  bars?: number
  className?: string
}) {
  const recent = intervals.slice(-bars)
  const avg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0

  return (
    <div className={cn("flex items-end justify-center gap-1.5", className)} aria-hidden="true">
      {Array.from({ length: bars }, (_, i) => {
        const gap = recent[i - (bars - recent.length)]
        const height = gap ? Math.min(100, Math.max(15, 55 + (gap / avg - 1) * 250)) : 15
        return (
          <span
            key={i}
            className={cn(
              "w-7 rounded-sm transition-[height] duration-150",
              gap ? "bg-[var(--primary)]" : "bg-[var(--muted-foreground)]/30"
            )}
            style={{ height: `${height}%` }}
          />
        )
      })}
    </div>
  )
}
