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
import bpmData from "@/data/bpm-list.json"
import { getGenreForBpm } from "@/lib/calculations"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "BPM Reference - Delay Times & Bar Durations",
  description:
    "Browse delay times and bar durations for all common BPMs. Quick reference for music producers and DJs.",
}

const bpmGroups = [
  { label: "Slow (60-90 BPM)", range: [60, 90], genres: ["Hip-Hop", "R&B", "Downtempo"] },
  { label: "Medium (90-120 BPM)", range: [90, 120], genres: ["Pop", "Deep House", "Funk"] },
  { label: "Dance (120-140 BPM)", range: [120, 140], genres: ["House", "Techno", "Trance"] },
  { label: "Fast (140-180 BPM)", range: [140, 180], genres: ["Dubstep", "Drum & Bass", "Psytrance"] },
]

export default function BpmHubPage() {
  const allBpms = bpmData.phase1

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
      <Breadcrumbs items={[{ name: "BPM Reference", path: "/bpm" }]} />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold lg:text-4xl">BPM Reference</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Quick access to delay times, bar durations, and genre info for common
          tempos. Click any BPM for detailed information.
        </p>
      </div>

      {/* Quick Tools */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>BPM Tools</CardTitle>
          <CardDescription>Interactive tools for working with tempo</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/tools/bpm-delay">BPM Delay Calculator</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools/tap-tempo">Tap Tempo</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools/bars-to-time">Bars to Time</Link>
          </Button>
        </CardContent>
      </Card>

      {/* BPM Groups */}
      <div className="space-y-8">
        {bpmGroups.map((group) => {
          const bpmsInGroup = allBpms.filter(
            (bpm) => bpm >= group.range[0] && bpm <= group.range[1]
          )
          if (bpmsInGroup.length === 0) return null

          return (
            <Card key={group.label}>
              <CardHeader>
                <CardTitle>{group.label}</CardTitle>
                <CardDescription>
                  Common genres: {group.genres.join(", ")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                  {bpmsInGroup.map((bpm) => (
                    <Button
                      key={bpm}
                      variant="outline"
                      size="sm"
                      asChild
                      className="font-mono"
                    >
                      <Link href={`/bpm/${bpm}`}>{bpm}</Link>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Popular BPMs */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Most Popular BPMs</CardTitle>
          <CardDescription>
            The most commonly used tempos in music production
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bpmData.popular.map((bpm) => (
              <Link key={bpm} href={`/bpm/${bpm}`}>
                <div className="rounded-lg border p-4 hover:bg-[var(--muted)] transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">{bpm} BPM</span>
                    <div className="flex flex-wrap gap-1">
                      {getGenreForBpm(bpm)
                        .slice(0, 2)
                        .map((g) => (
                          <Badge key={g} variant="secondary" className="text-xs">
                            {g}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SEO Content */}
      <section className="mt-12 prose prose-neutral dark:prose-invert max-w-none">
        <h2>About BPM (Beats Per Minute)</h2>
        <p>
          BPM (Beats Per Minute) is the standard measurement of tempo in music.
          Understanding BPM is essential for DJs when beatmatching and for
          producers when setting up effects like delay and reverb.
        </p>
        <p>
          Each BPM value has corresponding delay times that create rhythmic
          synchronization when used in your DAW or effects units. This reference
          provides quick access to these values for all common tempos.
        </p>
      </section>
    </div>
  )
}
