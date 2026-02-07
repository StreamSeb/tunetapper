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
import { Badge } from "@/components/ui/badge"
import { CAMELOT_KEYS } from "@/lib/camelot"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Camelot Wheel Reference - All Keys for Harmonic Mixing",
  description:
    "Complete Camelot Wheel reference with all 24 keys. Find compatible keys for harmonic DJ mixing.",
}

export default function CamelotHubPage() {
  const minorKeys = CAMELOT_KEYS.filter((k) => k.letter === "A")
  const majorKeys = CAMELOT_KEYS.filter((k) => k.letter === "B")

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
      <Breadcrumbs items={[{ name: "Camelot Keys", path: "/camelot" }]} />
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold lg:text-4xl">Camelot Wheel Reference</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Complete reference for all 24 Camelot keys. Click any key to see
          compatible mixing options.
        </p>
      </div>

      {/* Tool Link */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Interactive Camelot Tool</CardTitle>
          <CardDescription>
            Find compatible keys with our interactive tool
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/tools/camelot">Open Camelot Wheel Tool</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/guides/camelot-wheel-guide">
              Learn About Harmonic Mixing
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Visual Wheel Representation */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>The Camelot Wheel</CardTitle>
          <CardDescription>
            Minor keys (A) on the inner ring, Major keys (B) on the outer ring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Minor Keys */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Badge variant="outline">A</Badge>
                Minor Keys
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {minorKeys.map((key) => (
                  <Link
                    key={key.camelot}
                    href={`/camelot/${key.camelot.toLowerCase()}`}
                    className={cn(
                      "rounded-lg border p-3 text-center transition-all hover:scale-105",
                      "hover:bg-[var(--accent)] hover:border-[var(--primary)]"
                    )}
                  >
                    <div className="text-lg font-bold">{key.camelot}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {key.musical}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Major Keys */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Badge>B</Badge>
                Major Keys
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {majorKeys.map((key) => (
                  <Link
                    key={key.camelot}
                    href={`/camelot/${key.camelot.toLowerCase()}`}
                    className={cn(
                      "rounded-lg border p-3 text-center transition-all hover:scale-105",
                      "hover:bg-[var(--accent)] hover:border-[var(--primary)]"
                    )}
                  >
                    <div className="text-lg font-bold">{key.camelot}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {key.musical}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Compatibility Guide */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Compatibility Guide</CardTitle>
          <CardDescription>How to read Camelot keys for mixing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg p-4 border bg-key-green-bg text-key-green border-key-green-border">
              <h4 className="font-semibold">
                Same Number
              </h4>
              <p className="text-sm mt-1">
                e.g., 8A → 8A or 8A → 8B. Perfect harmonic match or relative
                major/minor switch.
              </p>
            </div>
            <div className="rounded-lg p-4 border bg-key-blue-bg text-key-blue border-key-blue-border">
              <h4 className="font-semibold">
                +1 or -1
              </h4>
              <p className="text-sm mt-1">
                e.g., 8A → 9A or 8A → 7A. Smooth energy transition, classic DJ
                move.
              </p>
            </div>
            <div className="rounded-lg p-4 border bg-key-purple-bg text-key-purple border-key-purple-border">
              <h4 className="font-semibold">
                A ↔ B Switch
              </h4>
              <p className="text-sm mt-1">
                e.g., 8A → 8B. Change mood between minor and major while keeping
                tonal center.
              </p>
            </div>
            <div className="rounded-lg p-4 border bg-key-orange-bg text-key-orange border-key-orange-border">
              <h4 className="font-semibold">
                +2 Energy Boost
              </h4>
              <p className="text-sm mt-1">
                e.g., 8A → 10A. More dramatic but still musically coherent
                transition.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full Key List */}
      <Card>
        <CardHeader>
          <CardTitle>All 24 Keys</CardTitle>
          <CardDescription>
            Click any key for detailed compatibility information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {CAMELOT_KEYS.map((key) => (
              <Button
                key={key.camelot}
                variant="outline"
                asChild
                className="min-w-[80px]"
              >
                <Link href={`/camelot/${key.camelot.toLowerCase()}`}>
                  <span className="font-bold mr-1">{key.camelot}</span>
                  <span className="text-[var(--muted-foreground)]">
                    {key.musical}
                  </span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SEO Content */}
      <section className="mt-12 prose prose-neutral dark:prose-invert max-w-none">
        <h2>What is the Camelot Wheel?</h2>
        <p>
          The Camelot Wheel (also known as the Camelot Sound Easymix System) is a
          tool that helps DJs mix tracks harmonically. It was created by Mark
          Davis and is based on the Circle of Fifths from music theory.
        </p>
        <p>
          The system uses numbers 1-12 and letters A or B to represent all 24
          musical keys. Keys with adjacent numbers or the same number with
          different letters will mix harmonically.
        </p>
        <h3>Why Use Camelot for DJing?</h3>
        <ul>
          <li>Creates smooth, professional-sounding transitions</li>
          <li>Avoids clashing melodies between tracks</li>
          <li>Easier to understand than traditional music theory</li>
          <li>Most DJ software can analyze and display Camelot keys</li>
        </ul>
      </section>
    </div>
  )
}
