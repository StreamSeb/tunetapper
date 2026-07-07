"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import { Copy, Check, Play, RotateCcw, Share2, Trophy } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Phase = "idle" | "listen" | "silent" | "done"

interface Difficulty {
  id: string
  label: string
  bpm: number
  audibleBeats: number
  silentBeats: number
  blurb: string
}

const DIFFICULTIES: Difficulty[] = [
  {
    id: "easy",
    label: "Easy",
    bpm: 100,
    audibleBeats: 8,
    silentBeats: 8,
    blurb: "100 BPM - 8 beats with you, 8 on your own",
  },
  {
    id: "medium",
    label: "Medium",
    bpm: 90,
    audibleBeats: 8,
    silentBeats: 12,
    blurb: "90 BPM - 8 beats with you, 12 on your own",
  },
  {
    id: "hard",
    label: "Hard",
    bpm: 75,
    audibleBeats: 6,
    silentBeats: 16,
    blurb: "75 BPM - slow tempo, 16 beats on your own",
  },
]

interface BeatResult {
  deviationMs: number | null // null = missed
}

interface GameResult {
  score: number
  tier: string
  tierEmoji: string
  beats: BeatResult[]
  avgDeviationMs: number | null
}

function tierFor(score: number): { tier: string; tierEmoji: string } {
  if (score >= 95) return { tier: "Atomic Clock", tierEmoji: "🎯" }
  if (score >= 85) return { tier: "Drum Machine", tierEmoji: "🥁" }
  if (score >= 75) return { tier: "Session Pro", tierEmoji: "🎧" }
  if (score >= 60) return { tier: "Solid Groove", tierEmoji: "👍" }
  if (score >= 40) return { tier: "Human After All", tierEmoji: "🫠" }
  return { tier: "Free Jazz", tierEmoji: "🎷" }
}

function beatEmoji(b: BeatResult): string {
  if (b.deviationMs === null) return "⬜"
  const d = Math.abs(b.deviationMs)
  if (d < 25) return "🟩"
  if (d < 60) return "🟨"
  if (d < 100) return "🟧"
  return "🟥"
}

function scoreBeats(
  gridTimes: number[],
  taps: number[],
  audibleBeats: number,
  intervalS: number
): GameResult {
  const scoredGrid = gridTimes.slice(audibleBeats)
  const beats: BeatResult[] = scoredGrid.map((t) => {
    let best: number | null = null
    for (const tap of taps) {
      const d = tap - t
      if (Math.abs(d) <= intervalS / 2) {
        if (best === null || Math.abs(d) < Math.abs(best)) best = d
      }
    }
    return { deviationMs: best === null ? null : best * 1000 }
  })

  // 100 points at 0ms deviation, 0 points at >=120ms or a miss
  const points = beats.map((b) =>
    b.deviationMs === null ? 0 : Math.max(0, 100 - Math.abs(b.deviationMs) / 1.2)
  )
  const score = Math.round(points.reduce((a, b) => a + b, 0) / points.length)

  const hits = beats.filter((b) => b.deviationMs !== null)
  const avgDeviationMs =
    hits.length === 0
      ? null
      : hits.reduce((a, b) => a + Math.abs(b.deviationMs as number), 0) / hits.length

  return { score, ...tierFor(score), beats, avgDeviationMs }
}

function bestScoreKey(difficultyId: string) {
  return `tunetapper-rhythm-best-${difficultyId}`
}

export function RhythmGame() {
  const [phase, setPhase] = useState<Phase>("idle")
  const [difficulty, setDifficulty] = useState<Difficulty>(DIFFICULTIES[1])
  const [currentBeat, setCurrentBeat] = useState(0)
  const [result, setResult] = useState<GameResult | null>(null)
  const [bestScore, setBestScore] = useState<number | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)
  const [copied, setCopied] = useState(false)
  const [tapFlash, setTapFlash] = useState(false)

  const metronomeRef = useRef<Metronome | null>(null)
  const gridTimesRef = useRef<number[]>([])
  const tapsRef = useRef<number[]>([])
  const phaseRef = useRef<Phase>("idle")
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const totalBeats = difficulty.audibleBeats + difficulty.silentBeats
  const intervalS = 60 / difficulty.bpm

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  // Hydrate the stored best score after paint (localStorage is client-only,
  // and a deferred read avoids a server/client hydration mismatch)
  useEffect(() => {
    const t = setTimeout(() => {
      const stored = localStorage.getItem(bestScoreKey(difficulty.id))
      setBestScore(stored ? Number(stored) : null)
    }, 0)
    return () => clearTimeout(t)
  }, [difficulty])

  const clearTimers = useCallback(() => {
    for (const t of timeoutsRef.current) clearTimeout(t)
    timeoutsRef.current = []
  }, [])

  const later = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms))
  }, [])

  const finishGame = useCallback(() => {
    metronomeRef.current?.stop()
    const gameResult = scoreBeats(
      gridTimesRef.current,
      tapsRef.current,
      difficulty.audibleBeats,
      intervalS
    )
    setResult(gameResult)
    setPhase("done")
    analytics.rhythmGameCompleted(gameResult.score, difficulty.id)

    const key = bestScoreKey(difficulty.id)
    const prev = Number(localStorage.getItem(key) ?? -1)
    if (gameResult.score > prev) {
      localStorage.setItem(key, String(gameResult.score))
      setBestScore(gameResult.score)
      setIsNewBest(prev >= 0)
    } else {
      setIsNewBest(false)
    }
  }, [difficulty, intervalS])

  const startGame = useCallback(() => {
    clearTimers()
    gridTimesRef.current = []
    tapsRef.current = []
    setResult(null)
    setCurrentBeat(0)
    setIsNewBest(false)
    setPhase("listen")

    metronomeRef.current?.dispose()
    const m = new Metronome({
      bpm: difficulty.bpm,
      accentEvery: 4,
      isAudible: (i) => i < difficulty.audibleBeats,
      onBeat: (i, audioTime) => {
        gridTimesRef.current[i] = audioTime
        const delayMs = Math.max(0, (audioTime - m.now()) * 1000)
        later(() => {
          if (phaseRef.current === "done" || phaseRef.current === "idle") return
          setCurrentBeat(i + 1)
          if (i + 1 === difficulty.audibleBeats) setPhase("silent")
        }, delayMs)
        if (i === totalBeats - 1) {
          // Close the tap window shortly after the last scored beat
          later(finishGame, Math.max(0, (audioTime + intervalS * 0.8 - m.now()) * 1000))
        }
      },
    })
    metronomeRef.current = m
    m.start()
  }, [clearTimers, difficulty, finishGame, intervalS, later, totalBeats])

  const stopEarly = useCallback(() => {
    clearTimers()
    metronomeRef.current?.stop()
    setPhase("idle")
    setCurrentBeat(0)
  }, [clearTimers])

  const handleTap = useCallback(() => {
    if (phaseRef.current !== "listen" && phaseRef.current !== "silent") return
    const m = metronomeRef.current
    if (!m) return
    tapsRef.current.push(m.now())
    setTapFlash(true)
    later(() => setTapFlash(false), 120)
  }, [later])

  // Keyboard: Space/Enter taps while the game runs
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        if (phaseRef.current === "listen" || phaseRef.current === "silent") {
          e.preventDefault()
          handleTap()
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [handleTap])

  useEffect(() => {
    return () => {
      clearTimers()
      metronomeRef.current?.dispose()
    }
  }, [clearTimers])

  const shareText = result
    ? [
        `Rhythm Test ${result.tierEmoji} ${result.score}/100 - ${result.tier}`,
        result.beats.map(beatEmoji).join(""),
        `${difficulty.label} - ${difficulty.bpm} BPM, ${difficulty.silentBeats} beats from memory`,
        `Can you beat me? tunetapper.com/tools/rhythm-game`,
      ].join("\n")
    : ""

  const handleCopy = useCallback(async () => {
    if (!result) return
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      analytics.rhythmGameShared("copy", result.score)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [result, shareText])

  const handleShare = useCallback(async () => {
    if (!result) return
    try {
      await navigator.share({ text: shareText })
      analytics.rhythmGameShared("native", result.score)
    } catch {
      // user cancelled - ignore
    }
  }, [result, shareText])

  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function"

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold lg:text-4xl">Rhythm Test</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          How accurate is your internal metronome? Tap along, then keep the
          beat on your own.
        </p>
      </div>

      {phase === "idle" && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pick your difficulty</CardTitle>
            <CardDescription>
              The metronome plays a few beats, then goes silent - keep tapping
              on the beat from memory. Slower tempos are harder than they
              sound.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDifficulty(d)}
                  className={cn(
                    "rounded-lg border p-4 text-left transition-colors",
                    difficulty.id === d.id
                      ? "border-[var(--primary)] bg-[var(--accent)]"
                      : "border-[var(--border)] hover:bg-[var(--accent)]"
                  )}
                >
                  <span className="block font-semibold">{d.label}</span>
                  <span className="mt-1 block text-xs text-[var(--muted-foreground)]">
                    {d.blurb}
                  </span>
                </button>
              ))}
            </div>
            {bestScore !== null && (
              <p className="mt-4 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <Trophy className="h-4 w-4" />
                Your best on {difficulty.label}: {bestScore}/100
              </p>
            )}
            <Button className="mt-6 w-full" size="lg" onClick={startGame}>
              <Play className="mr-2 h-5 w-5" />
              Start
            </Button>
          </CardContent>
        </Card>
      )}

      {(phase === "listen" || phase === "silent") && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="mb-4 text-center">
              <Badge variant={phase === "listen" ? "secondary" : "default"}>
                {phase === "listen"
                  ? "Listen and tap along"
                  : "Metronome off - keep the beat!"}
              </Badge>
              <p className="mt-3 text-sm text-[var(--muted-foreground)]">
                Beat {Math.min(currentBeat, totalBeats)} / {totalBeats}
              </p>
            </div>
            <button
              onClick={handleTap}
              className={cn(
                "w-full h-48 rounded-xl text-2xl font-bold transition-all",
                "bg-[var(--primary)] text-[var(--primary-foreground)]",
                "hover:opacity-90 active:scale-[0.98]",
                "focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2",
                tapFlash && "scale-[0.98] opacity-90"
              )}
            >
              TAP
            </button>
            <p className="mt-3 text-center text-xs text-[var(--muted-foreground)]">
              Tap the button, or press Space / Enter
            </p>
            <div className="mt-4 flex justify-center">
              <Button variant="ghost" size="sm" onClick={stopEarly}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "done" && result && (
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl">
              {result.score}/100 {result.tierEmoji}
            </CardTitle>
            <CardDescription className="text-lg">
              {result.tier}
              {isNewBest && " - new personal best!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-center text-2xl tracking-wider">
              {result.beats.map((b, i) => (
                <span key={i}>{beatEmoji(b)}</span>
              ))}
            </div>
            <div className="mb-6 grid grid-cols-2 gap-3 text-center text-sm">
              <div className="rounded-lg border border-[var(--border)] p-3">
                <span className="block text-[var(--muted-foreground)]">
                  Average deviation
                </span>
                <span className="block text-lg font-semibold font-mono">
                  {result.avgDeviationMs === null
                    ? "-"
                    : `${result.avgDeviationMs.toFixed(0)} ms`}
                </span>
              </div>
              <div className="rounded-lg border border-[var(--border)] p-3">
                <span className="block text-[var(--muted-foreground)]">
                  Best ({difficulty.label})
                </span>
                <span className="block text-lg font-semibold font-mono">
                  {bestScore ?? result.score}/100
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={handleCopy}>
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                Copy result
              </Button>
              {canNativeShare && (
                <Button variant="outline" onClick={handleShare}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              )}
              <Button variant="outline" onClick={startGame}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Play again
              </Button>
              <Button variant="ghost" onClick={stopEarly}>
                Change difficulty
              </Button>
            </div>
            <p className="mt-6 text-center text-sm text-[var(--muted-foreground)]">
              Green = within 25 ms, yellow = 60 ms, orange = 100 ms, red =
              worse, white = missed beat. Found your BPM instead? Try the{" "}
              <Link href="/tools/tap-tempo" className="underline">
                tap BPM counter
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
