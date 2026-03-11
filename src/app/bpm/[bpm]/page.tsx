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
import { Badge } from "@/components/ui/badge"
import {
  getAllDelayTimes,
  formatMs,
  getGenreForBpm,
  getNearbyBpms,
  getBarsDurationTable,
} from "@/lib/calculations"
import { generateBpmPageMetadata, generateFaqSchema } from "@/lib/seo"
import bpmData from "@/data/bpm-list.json"

interface Props {
  params: Promise<{ bpm: string }>
}

export async function generateStaticParams() {
  return bpmData.phase2.map((bpm) => ({
    bpm: bpm.toString(),
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bpm } = await params
  const bpmNum = parseInt(bpm, 10)
  if (isNaN(bpmNum) || bpmNum < 20 || bpmNum > 300) {
    return { title: "BPM Not Found" }
  }
  return generateBpmPageMetadata(bpmNum)
}

export default async function BpmPage({ params }: Props) {
  const { bpm } = await params
  const bpmNum = parseInt(bpm, 10)

  if (isNaN(bpmNum) || bpmNum < 20 || bpmNum > 300) {
    notFound()
  }

  const delayTimes = getAllDelayTimes(bpmNum)
  const genres = getGenreForBpm(bpmNum)
  const nearbyBpms = getNearbyBpms(bpmNum, 3)
  const barsTable = getBarsDurationTable(bpmNum)

  const faqs = [
    {
      question: `What are the delay times for ${bpmNum} BPM?`,
      answer: `At ${bpmNum} BPM, a quarter note (1/4) delay is ${formatMs(delayTimes[2].normal)}, an eighth note (1/8) is ${formatMs(delayTimes[3].normal)}, and a sixteenth note (1/16) is ${formatMs(delayTimes[4].normal)}.`,
    },
    {
      question: `What genres typically use ${bpmNum} BPM?`,
      answer: genres.length > 0 ? `${bpmNum} BPM is commonly used in ${genres.join(", ")}.` : `${bpmNum} BPM is used across various genres.`,
    },
    {
      question: `How long is 32 bars at ${bpmNum} BPM?`,
      answer: `32 bars at ${bpmNum} BPM is ${barsTable.find((b) => b.bars === 32)?.formatted || "about a minute"}.`,
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFaqSchema(faqs)),
        }}
      />
      <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
        <Breadcrumbs items={[{ name: "BPM Reference", path: "/bpm" }, { name: `${bpmNum} BPM`, path: `/bpm/${bpmNum}` }]} />
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {genres.map((genre) => (
              <Badge key={genre} variant="secondary">
                {genre}
              </Badge>
            ))}
          </div>
          <h1 className="text-4xl font-bold lg:text-5xl">{bpmNum} BPM</h1>
          <p className="mt-3 text-lg text-[var(--muted-foreground)]">
            Complete reference for {bpmNum} beats per minute. Delay times, bar
            durations, and more.
          </p>
        </div>

        {/* Delay Times */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Delay Times</CardTitle>
            <CardDescription>
              Sync your delay effects to {bpmNum} BPM
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Note Value</TableHead>
                  <TableHead className="text-right">Normal</TableHead>
                  <TableHead className="text-right">Dotted</TableHead>
                  <TableHead className="text-right">Triplet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delayTimes.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatMs(row.normal)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatMs(row.dotted)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatMs(row.triplet)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4">
              <Button asChild>
                <Link href={`/tools/bpm-delay?bpm=${bpmNum}`}>
                  Open Interactive Calculator
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bar Durations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Bar Durations</CardTitle>
            <CardDescription>How long bars last at {bpmNum} BPM</CardDescription>
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
                {barsTable.slice(0, 6).map((row) => (
                  <TableRow key={row.bars}>
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
            <div className="mt-4">
              <Button variant="outline" asChild>
                <Link href={`/tools/bars-to-time?bpm=${bpmNum}`}>
                  Open Bars Calculator
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Nearby BPMs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Related BPMs</CardTitle>
            <CardDescription>Browse nearby tempos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {nearbyBpms.map((nearby) => (
                <Button key={nearby} variant="outline" size="sm" asChild>
                  <Link href={`/bpm/${nearby}`}>{nearby} BPM</Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i}>
                <h3 className="font-semibold">{faq.question}</h3>
                <p className="text-[var(--muted-foreground)] mt-1">
                  {faq.answer}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
