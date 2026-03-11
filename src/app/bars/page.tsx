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
import { generateFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "How Long is X Bars? Bars to Seconds Reference for DJs",
  description:
    "16 bars at 128 BPM = 30 seconds. 32 bars at 120 BPM = 64 seconds. Instant bar duration reference for DJs and producers at any BPM.",
}

const faqs = [
  {
    question: "How long is 16 bars at 128 BPM?",
    answer: "16 bars at 128 BPM lasts exactly 30 seconds.",
  },
  {
    question: "How long is 32 bars at 128 BPM?",
    answer: "32 bars at 128 BPM lasts exactly 60 seconds (1 minute).",
  },
  {
    question: "How long is 16 bars at 120 BPM?",
    answer: "16 bars at 120 BPM lasts exactly 32 seconds.",
  },
  {
    question: "How long is 32 bars at 120 BPM?",
    answer: "32 bars at 120 BPM lasts exactly 64 seconds (1 minute 4 seconds).",
  },
  {
    question: "How long is 16 bars at 140 BPM?",
    answer: "16 bars at 140 BPM lasts approximately 27.4 seconds.",
  },
  {
    question: "How long is 8 bars in seconds?",
    answer:
      "8 bars at 128 BPM = 15 seconds. At 120 BPM = 16 seconds. At 140 BPM ≈ 13.7 seconds.",
  },
  {
    question: "How do you calculate bar duration from BPM?",
    answer:
      "Multiply the number of bars by 4 (beats per bar) then by 60 divided by BPM. Formula: bars × 4 × (60 ÷ BPM) = seconds.",
  },
]

export default function BarsHubPage() {
  const quickReference = [
    { bars: 8, bpms: [120, 128, 140, 150, 174] },
    { bars: 16, bpms: [120, 128, 140, 150, 174] },
    { bars: 32, bpms: [120, 128, 140, 150, 174] },
    { bars: 64, bpms: [120, 128, 140, 150, 174] },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
      <Breadcrumbs items={[{ name: "Bars Reference", path: "/bars" }]} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateFaqSchema(faqs)) }}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold lg:text-4xl">How Long is X Bars?</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Instant bar duration reference for DJs and producers. 16 bars at 128 BPM = 30 seconds. 32 bars at 128 BPM = 60 seconds.
        </p>
      </div>

      {/* Calculator Link */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Interactive Calculator</CardTitle>
          <CardDescription>
            Enter any bar count and BPM for an exact duration
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
            <CardTitle>{bars} Bars — How Long at Common BPMs?</CardTitle>
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
                            Details →
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
          <CardTitle>All Bar/BPM Combinations</CardTitle>
          <CardDescription>Quick links to every combination</CardDescription>
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

      {/* FAQ */}
      <section className="mt-12 prose prose-neutral dark:prose-invert max-w-none">
        <h2>Frequently Asked Questions</h2>
        <dl>
          {faqs.map((faq) => (
            <div key={faq.question} className="mb-6">
              <dt className="font-semibold text-base not-prose mb-1">{faq.question}</dt>
              <dd className="text-[var(--muted-foreground)] not-prose">{faq.answer}</dd>
            </div>
          ))}
        </dl>

        <h2>Understanding Bars and Musical Structure</h2>
        <p>
          In music, a bar (or measure) is a segment of time defined by a given
          number of beats. Most electronic and pop music uses 4/4 time signature,
          meaning 4 beats per bar. To find how long any number of bars lasts, use
          the formula: <strong>bars × 4 × (60 ÷ BPM) = seconds</strong>.
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
