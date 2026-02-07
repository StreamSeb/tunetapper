import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
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
import {
  calculateBarsDuration,
  formatDuration,
  getBarsDurationTable,
} from "@/lib/calculations"
import { generateBarsPageMetadata } from "@/lib/seo"
import barsData from "@/data/bars-list.json"

interface Props {
  params: Promise<{ slug: string }>
}

function parseSlug(slug: string): { bars: number; bpm: number } | null {
  // Format: 32-at-128-bpm
  const match = slug.match(/^(\d+)-at-(\d+)-bpm$/)
  if (!match) return null
  const bars = parseInt(match[1], 10)
  const bpm = parseInt(match[2], 10)
  if (isNaN(bars) || isNaN(bpm) || bars < 1 || bars > 999 || bpm < 20 || bpm > 300) {
    return null
  }
  return { bars, bpm }
}

export async function generateStaticParams() {
  return barsData.phase1.map(({ bars, bpm }) => ({
    slug: `${bars}-at-${bpm}-bpm`,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const parsed = parseSlug(slug)
  if (!parsed) {
    return { title: "Not Found" }
  }
  return generateBarsPageMetadata(parsed.bars, parsed.bpm)
}

export default async function BarsPage({ params }: Props) {
  const { slug } = await params
  const parsed = parseSlug(slug)

  if (!parsed) {
    notFound()
  }

  const { bars, bpm } = parsed
  const duration = calculateBarsDuration(bars, bpm)
  const formattedDuration = formatDuration(duration)
  const barsTable = getBarsDurationTable(bpm)

  // Other bar counts at same BPM
  const otherBars = [4, 8, 16, 32, 64, 128].filter((b) => b !== bars)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
      <Breadcrumbs items={[{ name: "Bars Reference", path: "/bars" }, { name: `${bars} Bars at ${bpm} BPM`, path: `/bars/${bars}-at-${bpm}-bpm` }]} />
      {/* Header */}
      <div className="mb-8">
        <p className="text-[var(--muted-foreground)] mb-2">Duration Calculator</p>
        <h1 className="text-3xl font-bold lg:text-4xl">
          {bars} Bars at {bpm} BPM
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Calculate the exact duration of {bars} bars at {bpm} beats per minute.
        </p>
      </div>

      {/* Main Result */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-sm text-[var(--muted-foreground)] mb-2">
              {bars} bars × 4 beats × (60 ÷ {bpm}) seconds per beat
            </p>
            <p className="text-5xl font-bold font-mono">{formattedDuration}</p>
            <p className="text-lg text-[var(--muted-foreground)] mt-2">
              {duration.toFixed(3)} seconds
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Full Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>All Bar Lengths at {bpm} BPM</CardTitle>
          <CardDescription>
            Quick reference for common section lengths
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
              {barsTable.map((row) => (
                <TableRow
                  key={row.bars}
                  className={row.bars === bars ? "bg-[var(--muted)]" : ""}
                >
                  <TableCell className="font-medium">
                    {row.bars} bars
                    {row.bars === bars && (
                      <span className="ml-2 text-xs text-[var(--primary)]">
                        (current)
                      </span>
                    )}
                  </TableCell>
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
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Related Pages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-[var(--muted-foreground)] mb-2">
              Other bar lengths at {bpm} BPM:
            </p>
            <div className="flex flex-wrap gap-2">
              {otherBars.map((b) => (
                <Button key={b} variant="outline" size="sm" asChild>
                  <Link href={`/bars/${b}-at-${bpm}-bpm`}>{b} bars</Link>
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm text-[var(--muted-foreground)] mb-2">
              More tools:
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" asChild>
                <Link href={`/bpm/${bpm}`}>View {bpm} BPM Reference</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/tools/bars-to-time">Interactive Calculator</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Content */}
      <section className="prose prose-neutral dark:prose-invert max-w-none">
        <h2>About This Calculation</h2>
        <p>
          At {bpm} BPM with a 4/4 time signature, each beat lasts{" "}
          {(60 / bpm).toFixed(4)} seconds. Since there are 4 beats per bar, each
          bar is {(240 / bpm).toFixed(4)} seconds long.
        </p>
        <p>
          Therefore, {bars} bars = {bars} × {(240 / bpm).toFixed(4)} ={" "}
          {duration.toFixed(4)} seconds, or approximately {formattedDuration}.
        </p>
        <h3>Common Uses for {bars} Bars</h3>
        <ul>
          {bars <= 8 && <li>Short transition or fill</li>}
          {bars === 16 && <li>Standard verse or chorus length</li>}
          {bars === 32 && <li>Extended section or combined verse+chorus</li>}
          {bars >= 64 && <li>Full arrangement section in electronic music</li>}
          <li>Loop length for sampling and production</li>
          <li>DJ mixing cue point reference</li>
        </ul>
      </section>
    </div>
  )
}
