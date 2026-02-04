"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getGenreForBpm } from "@/lib/calculations"

interface TransitionStrategy {
  name: string
  description: string
  difficulty: "Easy" | "Medium" | "Hard"
  technique: string
}

function getTransitionStrategies(
  bpmA: number,
  bpmB: number
): TransitionStrategy[] {
  const strategies: TransitionStrategy[] = []
  const diff = Math.abs(bpmA - bpmB)
  const ratio = bpmA / bpmB

  // Check for half-time / double-time relationships
  if (Math.abs(ratio - 2) < 0.05 || Math.abs(ratio - 0.5) < 0.05) {
    strategies.push({
      name: ratio > 1 ? "Half-Time Drop" : "Double-Time Lift",
      description:
        ratio > 1
          ? `${bpmA} BPM is almost exactly double ${bpmB} BPM. Drop to half-time for a dramatic energy shift.`
          : `${bpmB} BPM is almost exactly double ${bpmA} BPM. Jump to double-time for an energy boost.`,
      difficulty: "Easy",
      technique:
        "Mix in the new track and let the tempo relationship do the work. The beats will align naturally.",
    })
  }

  // Small difference (1-5 BPM)
  if (diff <= 5) {
    strategies.push({
      name: "Pitch Blend",
      description: `Only ${diff} BPM difference. Subtle enough to blend without noticeable pitch shift.`,
      difficulty: "Easy",
      technique:
        "Sync the tracks and let your DJ software pitch-match. The difference is barely noticeable.",
    })
  }

  // Medium difference (6-15 BPM)
  if (diff > 5 && diff <= 15) {
    strategies.push({
      name: "Gradual Tempo Ride",
      description: `${diff} BPM difference. Use gradual tempo adjustment over 16-32 bars.`,
      difficulty: "Medium",
      technique:
        "Start mixing, then slowly adjust the tempo of both tracks toward the target BPM over a long phrase.",
    })
  }

  // Large difference (16+ BPM)
  if (diff > 15) {
    strategies.push({
      name: "Break/Drop Transition",
      description: `${diff} BPM is a significant jump. Use a breakdown or effect to mask the change.`,
      difficulty: "Medium",
      technique:
        "Use a breakdown, build, or effect (reverb tail, filter sweep) to create a moment where tempo change isn't jarring.",
    })
    strategies.push({
      name: "Cold Cut",
      description: "Make a clean cut at a phrase boundary for a dramatic switch.",
      difficulty: "Hard",
      technique:
        "End the first track cleanly on beat 1 of a phrase, immediately drop in the new track. Requires precise timing.",
    })
  }

  // Always offer loop extension
  strategies.push({
    name: "Loop & Adjust",
    description: "Loop a section and gradually adjust tempo to the target.",
    difficulty: "Easy",
    technique: `Loop a minimal section (drums only), adjust from ${bpmA} to ${bpmB} BPM, then release the loop when ready.`,
  })

  return strategies
}

export function BpmTransitionTool() {
  const [bpmA, setBpmA] = useState(128)
  const [bpmB, setBpmB] = useState(140)

  const strategies = getTransitionStrategies(bpmA, bpmB)
  const genresA = getGenreForBpm(bpmA)
  const genresB = getGenreForBpm(bpmB)
  const diff = Math.abs(bpmA - bpmB)
  const percentChange = ((diff / bpmA) * 100).toFixed(1)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold lg:text-4xl">BPM Transition Helper</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Plan smooth transitions between tracks at different tempos. Get
          strategies for half-time, double-time, and gradual tempo changes.
        </p>
      </div>

      {/* Input Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Enter Your BPMs</CardTitle>
          <CardDescription>
            The tempo of your current track and your target track
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Track A */}
            <div className="flex-1 w-full">
              <Label htmlFor="bpmA" className="text-center block mb-2">
                Current Track
              </Label>
              <Input
                id="bpmA"
                type="number"
                min={20}
                max={300}
                value={bpmA}
                onChange={(e) =>
                  setBpmA(
                    Math.min(300, Math.max(20, Number(e.target.value) || 20))
                  )
                }
                className="text-2xl font-bold h-14 text-center"
              />
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {genresA.slice(0, 3).map((g) => (
                  <Badge key={g} variant="secondary" className="text-xs">
                    {g}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="h-8 w-8 text-[var(--muted-foreground)] shrink-0 hidden sm:block" />

            {/* Track B */}
            <div className="flex-1 w-full">
              <Label htmlFor="bpmB" className="text-center block mb-2">
                Target Track
              </Label>
              <Input
                id="bpmB"
                type="number"
                min={20}
                max={300}
                value={bpmB}
                onChange={(e) =>
                  setBpmB(
                    Math.min(300, Math.max(20, Number(e.target.value) || 20))
                  )
                }
                className="text-2xl font-bold h-14 text-center"
              />
              <div className="flex flex-wrap justify-center gap-1 mt-2">
                {genresB.slice(0, 3).map((g) => (
                  <Badge key={g} variant="secondary" className="text-xs">
                    {g}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 rounded-lg bg-[var(--muted)] p-4 text-center">
            <p className="text-sm text-[var(--muted-foreground)]">
              Transitioning from
            </p>
            <p className="text-xl font-bold">
              {bpmA} BPM → {bpmB} BPM
            </p>
            <p className="text-sm text-[var(--muted-foreground)]">
              {diff} BPM difference ({percentChange}%{" "}
              {bpmB > bpmA ? "increase" : "decrease"})
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Strategies */}
      <div className="space-y-4 mb-8">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Recommended Strategies
        </h2>
        {strategies.map((strategy, index) => (
          <Card key={index}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{strategy.name}</CardTitle>
                <Badge
                  variant={
                    strategy.difficulty === "Easy"
                      ? "secondary"
                      : strategy.difficulty === "Medium"
                        ? "outline"
                        : "default"
                  }
                >
                  {strategy.difficulty}
                </Badge>
              </div>
              <CardDescription>{strategy.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{strategy.technique}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Related Links */}
      <Card>
        <CardHeader>
          <CardTitle>Related Tools</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href={`/bpm/${bpmA}`}>View {bpmA} BPM Reference</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/bpm/${bpmB}`}>View {bpmB} BPM Reference</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools/camelot">Check Key Compatibility</Link>
          </Button>
        </CardContent>
      </Card>

      {/* SEO Content */}
      <section className="mt-12 prose prose-neutral dark:prose-invert max-w-none">
        <h2>Mastering BPM Transitions</h2>
        <p>
          Smooth tempo transitions are essential for maintaining energy and flow
          in a DJ set. The right technique depends on how big the BPM difference
          is:
        </p>
        <ul>
          <li>
            <strong>1-5 BPM:</strong> Usually imperceptible - just sync and mix
          </li>
          <li>
            <strong>6-15 BPM:</strong> Gradual adjustment or loop-based
            transitions work well
          </li>
          <li>
            <strong>16+ BPM:</strong> Use breakdowns, effects, or deliberate
            cuts
          </li>
          <li>
            <strong>Half/Double time:</strong> 70→140, 128→64 etc. Natural
            rhythmic relationships
          </li>
        </ul>
      </section>
    </div>
  )
}
