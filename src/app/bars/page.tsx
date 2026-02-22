import Link from "next/link"
import type { Metadata } from "next"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Button } from "@/components/ui/button"
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
import barsData from "@/data/bars-list.json"
import { calculateBarsDuration, formatDuration } from "@/lib/calculations"

export const metadata: Metadata = {
  title: "Bars to Time Calculator — How Long is X Bars at Any BPM?",
  description:
    "Instantly find how long 8, 16, 32 or 64 bars last at 120, 128, 140 BPM and more. Free reference for DJs and producers.",
}

export default function BarsHubPage() {
  const quickReference = [
    { bars: 16, bpms: [120, 128, 140, 174] },
    { bars: 32, bpms: [120, 128, 140, 174] },
    { bars: 64, bpms: [120, 128, 140, 174] },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
      <Breadcrumbs items={[{ name: "Bars Reference", path: "/bars" }]} />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold lg:text-4xl">Bars Duration Reference</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Quick reference for bar durations at common BPMs. Essential for
          arrangement and DJ mixing.
        </p>
      </div>

      {/* Calculator Link */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Interactive Calculator</CardTitle>
          <CardDescription>
            Need a specific calculation? Use our interactive tool
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/tools/bars-to-time">Open Bars to Time Calculator</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Quick Reference Tables */}
      {quickReference.map(({ bars, bpms }) => (
        <Card key={bars} className="mb-6">
          <CardHeader>
            <CardTitle>{bars} Bars at Common BPMs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BPM</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead className="text-right">Seconds</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bpms.map((bpm) => {
                  const duration = calculateBarsDuration(bars, bpm)
                  return (
                    <TableRow key={`${bars}-${bpm}`}>
                      <TableCell className="font-medium">{bpm} BPM</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatDuration(duration)}
                      </TableCell>
                      <TableCell className="text-right text-[var(--muted-foreground)]">
                        {duration.toFixed(2)}s
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/bars/${bars}-at-${bpm}-bpm`}>
                            View →
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Common Combinations */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Common Bar/BPM Combinations</CardTitle>
          <CardDescription>Quick links to popular configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {barsData.phase1.map(({ bars, bpm }) => (
              <Button
                key={`${bars}-${bpm}`}
                variant="outline"
                size="sm"
                asChild
              >
                <Link href={`/bars/${bars}-at-${bpm}-bpm`}>
                  {bars} bars @ {bpm}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SEO Content */}
      <section className="mt-12 prose prose-neutral dark:prose-invert max-w-none">
        <h2>Understanding Bars and Musical Structure</h2>
        <p>
          In music, a bar (or measure) is a segment of time defined by a given
          number of beats. Most electronic and pop music uses 4/4 time signature,
          meaning 4 beats per bar.
        </p>
        <h3>Common Section Lengths</h3>
        <ul>
          <li>
            <strong>4 bars:</strong> A basic musical phrase
          </li>
          <li>
            <strong>8 bars:</strong> Common verse or chorus intro
          </li>
          <li>
            <strong>16 bars:</strong> Standard verse or section length
          </li>
          <li>
            <strong>32 bars:</strong> Extended section or combined verse+chorus
          </li>
          <li>
            <strong>64 bars:</strong> Full arrangement section in EDM
          </li>
        </ul>
      </section>
    </div>
  )
}
