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
import { generateFaqSchema, generateBreadcrumbSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "How Long Is 16 Bars? Bars to Seconds & Minutes Calculator",
  description:
    "16 bars is 30 seconds at 128 BPM. 32 bars is ~1 minute. Convert any bar count to seconds or minutes at any BPM — free calculator, formula, and full lookup table for DJs and producers.",
  alternates: {
    canonical: "https://tunetapper.com/bars",
  },
  openGraph: {
    title: "How Long Is 16 Bars? Bars to Seconds & Minutes Calculator",
    description:
      "16 bars is 30 seconds at 128 BPM. 32 bars is ~1 minute. Convert any bar count to seconds or minutes at any BPM — free calculator, formula, and full lookup table.",
    url: "https://tunetapper.com/bars",
  },
}

const faqs = [
  {
    question: "How many seconds is 16 bars?",
    answer:
      "16 bars is 30 seconds at 128 BPM, 32 seconds at 120 BPM, and about 27.4 seconds at 140 BPM. In 4/4 time the formula is bars × 4 × (60 ÷ BPM).",
  },
  {
    question: "How many seconds is 32 bars?",
    answer:
      "32 bars is exactly 60 seconds (1 minute) at 128 BPM, 64 seconds at 120 BPM, and about 54.9 seconds at 140 BPM.",
  },
  {
    question: "How long is 32 bars in minutes?",
    answer:
      "32 bars is about 1 minute at 128 BPM (exactly 60 seconds), 1 minute 4 seconds at 120 BPM, and roughly 55 seconds at 140 BPM.",
  },
  {
    question: "How long is 64 bars in minutes?",
    answer:
      "64 bars is 2 minutes at 128 BPM, 2 minutes 8 seconds at 120 BPM, and about 1 minute 50 seconds at 140 BPM.",
  },
  {
    question: "How long is 8 bars in seconds?",
    answer:
      "8 bars is 15 seconds at 128 BPM, 16 seconds at 120 BPM, and about 13.7 seconds at 140 BPM.",
  },
  {
    question: "How long is 4 bars in seconds?",
    answer:
      "4 bars is 7.5 seconds at 128 BPM, 8 seconds at 120 BPM, and about 6.9 seconds at 140 BPM.",
  },
  {
    question: "How many bars is one minute?",
    answer:
      "One minute is about 32 bars at 128 BPM, 30 bars at 120 BPM, and 35 bars at 140 BPM. Formula: bars per minute = BPM ÷ 4.",
  },
  {
    question: "How long is 16 bars at 174 BPM (drum & bass)?",
    answer:
      "16 bars at 174 BPM lasts about 22.1 seconds. At 174 BPM, 32 bars is roughly 44.1 seconds.",
  },
  {
    question: "How do you calculate bar duration from BPM?",
    answer:
      "Multiply the number of bars by 4 (beats per bar in 4/4 time) then by 60 ÷ BPM. Formula: bars × 4 × (60 ÷ BPM) = seconds. Divide by 60 for minutes.",
  },
]

// Headline answers that match the highest-impression "how long is X bars"
// queries — surfaced above the fold for featured-snippet eligibility.
const headlineAnswers = [16, 32, 64].map((bars) => {
  const seconds = calculateBarsDuration(bars, 128)
  return { bars, seconds, formatted: formatDuration(seconds) }
})

// HowTo structured data for the "how to calculate bar duration" query intent.
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to calculate how long a number of bars lasts",
  description:
    "Convert any number of musical bars to a duration in seconds or minutes using the song's BPM.",
  step: [
    {
      "@type": "HowToStep",
      name: "Find the BPM",
      text: "Get the track's tempo in beats per minute (BPM).",
    },
    {
      "@type": "HowToStep",
      name: "Multiply bars by beats per bar",
      text: "Most music is in 4/4 time, so multiply the bar count by 4 to get total beats.",
    },
    {
      "@type": "HowToStep",
      name: "Convert beats to seconds",
      text: "Multiply total beats by 60 ÷ BPM. Formula: bars × 4 × (60 ÷ BPM) = seconds.",
    },
    {
      "@type": "HowToStep",
      name: "Convert to minutes",
      text: "Divide the result by 60 to express the duration in minutes.",
    },
  ],
}

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Bars Reference", path: "/bars" }])) }}
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold lg:text-4xl">
          How Long Is 16 Bars? Bars to Seconds &amp; Minutes
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Convert any bar count to a precise duration at any BPM. The formula is{" "}
          <strong className="text-[var(--foreground)]">
            bars × 4 × (60 ÷ BPM) = seconds
          </strong>{" "}
          in 4/4 time.
        </p>
      </div>

      {/* At-a-glance answer box — featured-snippet target */}
      <Card className="mb-8 border-[var(--primary)]/30">
        <CardHeader>
          <CardTitle>Quick Answer (at 128 BPM)</CardTitle>
          <CardDescription>
            The most common bar lengths in seconds and minutes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-3">
            {headlineAnswers.map(({ bars, seconds, formatted }) => (
              <li
                key={bars}
                className="rounded-lg border border-[var(--border)] p-3"
              >
                <span className="block text-sm text-[var(--muted-foreground)]">
                  {bars} bars
                </span>
                <span className="block text-xl font-semibold">
                  {seconds % 60 === 0 && seconds >= 60
                    ? `${seconds / 60} min`
                    : `${seconds}s`}
                </span>
                <span className="block text-sm text-[var(--muted-foreground)]">
                  {formatted}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            Different tempo? Use the calculator below for an exact figure at any
            BPM, or jump to the full lookup table.
          </p>
        </CardContent>
      </Card>

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
                  <TableHead className="text-right">Minutes</TableHead>
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
                      <TableCell className="text-right text-[var(--muted-foreground)]">
                        {(duration / 60).toFixed(2)} min
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
          the formula: <strong>bars × 4 × (60 ÷ BPM) = seconds</strong>. To get
          the answer in minutes, divide that result by 60.
        </p>
        <h3>Bars to Minutes at a Glance</h3>
        <p>
          A quick shortcut: at 128 BPM one bar is exactly 1.875 seconds, so 32
          bars is one minute. As tempo rises, each bar gets shorter — at 174 BPM
          (drum &amp; bass) a bar is about 1.38 seconds, so it takes ~43 bars to
          fill a minute.
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
