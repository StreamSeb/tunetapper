"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { analytics } from "@/lib/analytics"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  calculateBarsDuration,
  formatDuration,
  getBarsDurationTable,
} from "@/lib/calculations"

export function BarsToTimeTool() {
  const [bpm, setBpm] = useState(128)
  const [bars, setBars] = useState(32)
  const [beatsPerBar, setBeatsPerBar] = useState(4)

  const duration = calculateBarsDuration(bars, bpm, beatsPerBar)
  const formattedDuration = formatDuration(duration)
  const durationTable = getBarsDurationTable(bpm, beatsPerBar)

  // Track calculations (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      analytics.barsToTimeCalculated(bars, bpm)
    }, 1000)
    return () => clearTimeout(timeout)
  }, [bars, bpm])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold lg:text-4xl">
          Bars to Time Calculator
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Calculate exact durations for any number of bars at any BPM. Essential
          for arranging and timing your music.
        </p>
      </div>

      {/* Calculator */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Calculate Duration</CardTitle>
          <CardDescription>
            Enter your BPM, number of bars, and time signature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
            {/* BPM Input */}
            <div className="space-y-2">
              <Label htmlFor="bpm">BPM</Label>
              <Input
                id="bpm"
                type="number"
                min={20}
                max={300}
                value={bpm}
                onChange={(e) =>
                  setBpm(
                    Math.min(300, Math.max(20, Number(e.target.value) || 20))
                  )
                }
                className="text-lg font-medium"
              />
            </div>

            {/* Bars Input */}
            <div className="space-y-2">
              <Label htmlFor="bars">Bars</Label>
              <Input
                id="bars"
                type="number"
                min={1}
                max={999}
                value={bars}
                onChange={(e) =>
                  setBars(
                    Math.min(999, Math.max(1, Number(e.target.value) || 1))
                  )
                }
                className="text-lg font-medium"
              />
            </div>

            {/* Time Signature */}
            <div className="space-y-2">
              <Label htmlFor="timeSig">Time Signature</Label>
              <Select
                value={beatsPerBar.toString()}
                onValueChange={(v) => setBeatsPerBar(Number(v))}
              >
                <SelectTrigger id="timeSig">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3/4</SelectItem>
                  <SelectItem value="4">4/4</SelectItem>
                  <SelectItem value="5">5/4</SelectItem>
                  <SelectItem value="6">6/8</SelectItem>
                  <SelectItem value="7">7/8</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Result */}
          <div className="mt-8 rounded-lg bg-[var(--muted)] p-6 text-center">
            <p className="text-sm text-[var(--muted-foreground)] mb-2">
              {bars} bars at {bpm} BPM ({beatsPerBar}/4)
            </p>
            <p className="text-4xl font-bold font-mono">{formattedDuration}</p>
            <p className="text-sm text-[var(--muted-foreground)] mt-2">
              ({duration.toFixed(3)} seconds)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Reference at {bpm} BPM</CardTitle>
          <CardDescription>
            Common bar lengths and their durations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bars</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead className="text-right">Seconds</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {durationTable.map((row) => (
                <TableRow
                  key={row.bars}
                  className={row.bars === bars ? "bg-[var(--muted)]" : ""}
                >
                  <TableCell className="font-medium">{row.bars} bars</TableCell>
                  <TableCell className="text-right font-mono">
                    {row.formatted}
                  </TableCell>
                  <TableCell className="text-right text-[var(--muted-foreground)]">
                    {row.duration.toFixed(2)}s
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Related Links */}
      <Card>
        <CardHeader>
          <CardTitle>Related Tools & References</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href={`/bars/${bars}-at-${bpm}-bpm`}>
              View {bars} Bars at {bpm} BPM Reference
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/bpm/${bpm}`}>View {bpm} BPM Reference</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools/bpm-delay">BPM Delay Calculator</Link>
          </Button>
        </CardContent>
      </Card>

      {/* SEO Content */}
      <section className="mt-12 prose prose-neutral dark:prose-invert max-w-none">
        <h2>Understanding Bars and Time</h2>
        <p>
          In music production and DJing, knowing how long a section of bars lasts
          is essential for:
        </p>
        <ul>
          <li>
            <strong>Arrangement</strong> - Planning intros, verses, choruses,
            and outros
          </li>
          <li>
            <strong>DJ Mixing</strong> - Timing transitions and knowing when to
            start mixing
          </li>
          <li>
            <strong>Recording</strong> - Setting up loop lengths and recording
            durations
          </li>
          <li>
            <strong>Live Performance</strong> - Coordinating with other
            musicians or visuals
          </li>
        </ul>
        <p>
          Most electronic music uses 4, 8, 16, or 32 bar phrases. A typical intro
          might be 16 bars, a verse 32 bars, and a drop 64 bars.
        </p>
      </section>
    </div>
  )
}
