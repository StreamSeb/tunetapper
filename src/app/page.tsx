import Link from "next/link"
import {
  Clock,
  Music2,
  Disc3,
  Timer,
  ArrowLeftRight,
  Keyboard,
  ScanSearch,
  Gauge,
  Mic,
  Wrench,
  ListMusic,
  ArrowRight,
} from "lucide-react"
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const tools = [
  {
    title: "DJ Set Planner",
    description:
      "Drop in a folder of tracks and get a harmonic set order. Key, Camelot and BPM for every track, transitions rated, export to CSV or M3U. Nothing uploaded.",
    href: "/tools/set-planner",
    icon: ListMusic,
    badge: "New",
  },
  {
    title: "BPM Delay Calculator",
    description:
      "Calculate precise delay times in milliseconds for any BPM. Get values for 1/4, 1/8, 1/16 notes with dotted and triplet variants.",
    href: "/tools/bpm-delay",
    icon: Clock,
    badge: "Popular",
  },
  {
    title: "Bars to Time Calculator",
    description:
      "Convert bars to actual time duration. Find out exactly how long 16, 32, or 64 bars last at your track's tempo.",
    href: "/tools/bars-to-time",
    icon: Timer,
    badge: null,
  },
  {
    title: "Tap Tempo",
    description:
      "Tap to find the BPM of any song. Works with mouse clicks or keyboard. Perfect for finding the tempo of a track.",
    href: "/tools/tap-tempo",
    icon: Keyboard,
    badge: "Mobile Friendly",
  },
  {
    title: "Camelot Wheel",
    description:
      "Find compatible keys for harmonic mixing. The Camelot system makes it easy to mix tracks that sound great together.",
    href: "/tools/camelot",
    icon: Disc3,
    badge: "DJ Essential",
  },
  {
    title: "BPM Transition Helper",
    description:
      "Plan smooth BPM transitions between tracks. Get suggestions for half-time, double-time, and gradual tempo changes.",
    href: "/tools/bpm-transition",
    icon: ArrowLeftRight,
    badge: null,
  },
  {
    title: "Key & BPM Analyzer",
    description:
      "Detect the musical key, Camelot notation, and BPM of any track. Drop in an audio file and get the result instantly - runs in your browser, nothing uploaded.",
    href: "/tools/key-analyzer",
    icon: ScanSearch,
    badge: null,
  },
  {
    title: "Rhythm Test",
    description:
      "How accurate is your internal metronome? Tap along with the click, keep the beat when it goes silent, and get a timing score out of 100 to share.",
    href: "/tools/rhythm-game",
    icon: Gauge,
    badge: "New",
  },
  {
    title: "BPM Detector",
    description:
      "Drop in an MP3 or let your microphone listen, and get the tempo in seconds. All analysis happens on your device - nothing is uploaded.",
    href: "/tools/bpm-detector",
    icon: Mic,
    badge: "New",
  },
  {
    title: "Studio Setup Builder",
    description:
      "Enter your budget and the music you make, and get a complete studio or DJ setup - hand-picked gear with live-checked Thomann and Gear4music prices.",
    href: "/tools/studio-builder",
    icon: Wrench,
    badge: "New",
  },
]

const features = [
  {
    title: "100% Free",
    description: "All tools are completely free to use, no sign-up required.",
  },
  {
    title: "Works Offline",
    description: "Once loaded, most tools work without an internet connection.",
  },
  {
    title: "Mobile Friendly",
    description: "Designed to work great on phones, tablets, and desktops.",
  },
  {
    title: "No Ads Overload",
    description: "Minimal, non-intrusive ads that don't interrupt your workflow.",
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateOrganizationSchema()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateWebSiteSchema()),
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--muted)]/50 to-transparent">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              Free Music Production Tools
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Tools for DJs &<br />
              Music Producers
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted-foreground)]">
              Plan a harmonic DJ set, calculate BPM delay times, find
              compatible keys, detect any song&apos;s key and BPM, and more. All the
              essential utilities you need, free and easy to use.
            </p>
            {/* Camelot Wheel and Studio Setup Builder lead here on purpose -
                they are the two tools worth promoting hardest, so they take the
                two filled buttons and BPM Delay drops to the grid below. */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/tools/camelot">
                  <Disc3 className="mr-2 h-5 w-5" />
                  Camelot Wheel
                </Link>
              </Button>
              <Button asChild size="lg">
                <Link href="/tools/studio-builder">
                  <Wrench className="mr-2 h-5 w-5" />
                  Studio Setup Builder
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/tools/tap-tempo">
                  <Music2 className="mr-2 h-5 w-5" />
                  Tap Tempo
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured: DJ Set Planner */}
      <section className="mx-auto w-full max-w-7xl px-4 pt-4 lg:px-8">
        <Link
          href="/tools/set-planner"
          className="group block rounded-2xl border border-[var(--primary)]/40 bg-[var(--primary)]/[0.06] p-6 transition-colors hover:border-[var(--primary)] sm:p-8"
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <Badge className="mb-3">New</Badge>
              <h2 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
                <ListMusic className="h-7 w-7 shrink-0 text-[var(--primary)]" aria-hidden="true" />
                DJ Set Planner
              </h2>
              <p className="mt-3 text-[var(--muted-foreground)]">
                Drop in a folder of tracks. The planner detects the key, Camelot
                code and BPM of each one and sorts them into a set that mixes
                harmonically, with every transition rated. Export to CSV or an
                M3U playlist for your DJ software. It all runs in your browser.
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
              {/* A preview of the output: a short harmonic run */}
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {[
                  ["8A", 8, true],
                  ["9A", 9, true],
                  ["9B", 9, false],
                  ["10B", 10, false],
                ].map(([code, num, minor]) => (
                  <span
                    key={code as string}
                    className={`inline-flex h-9 w-12 items-center justify-center rounded-md text-sm font-bold ${minor ? "text-white" : "text-black"}`}
                    style={{
                      background: minor
                        ? `hsl(${((num as number) - 1) * 30}, 72%, 40%)`
                        : `hsl(${((num as number) - 1) * 30}, 62%, 62%)`,
                    }}
                  >
                    {code}
                  </span>
                ))}
              </div>
              <span className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]">
                Plan a set <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* Tools Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">All Tools</h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Everything you need for music production and DJing
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className="group">
              <Card className="h-full transition-colors hover:border-[var(--primary)]">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-[var(--primary)] p-2 text-[var(--primary-foreground)]">
                      <tool.icon className="h-5 w-5" />
                    </div>
                    {tool.badge && (
                      <Badge variant="secondary">{tool.badge}</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 group-hover:text-[var(--primary)] transition-colors">
                    {tool.title}
                  </CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-[var(--muted)]/30 py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why TuneTapper?</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* BPM Reference */}
          <Card>
            <CardHeader>
              <CardTitle>BPM Reference</CardTitle>
              <CardDescription>
                Quick access to delay times and bar durations for common tempos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[120, 128, 130, 140, 150, 174].map((bpm) => (
                  <Button key={bpm} variant="outline" size="sm" asChild>
                    <Link href={`/bpm/${bpm}`}>{bpm} BPM</Link>
                  </Button>
                ))}
              </div>
              <Button variant="link" className="mt-4 px-0" asChild>
                <Link href="/bpm">View all BPM references →</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Camelot Keys */}
          <Card>
            <CardHeader>
              <CardTitle>Camelot Keys</CardTitle>
              <CardDescription>
                Find compatible keys for smooth harmonic mixing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["1A", "5A", "8A", "8B", "11A", "12B"].map((key) => (
                  <Button key={key} variant="outline" size="sm" asChild>
                    <Link href={`/camelot/${key.toLowerCase()}`}>{key}</Link>
                  </Button>
                ))}
              </div>
              <Button variant="link" className="mt-4 px-0" asChild>
                <Link href="/camelot">View all Camelot keys →</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Guides */}
          <Card>
            <CardHeader>
              <CardTitle>Learn More</CardTitle>
              <CardDescription>
                Guides and tutorials for music production
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/guides/dj-set-planner"
                    className="text-sm hover:underline"
                  >
                    How to Plan a DJ Set by Key and BPM →
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guides/delay-times-explained"
                    className="text-sm hover:underline"
                  >
                    How to Use Delay Times →
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guides/camelot-wheel-guide"
                    className="text-sm hover:underline"
                  >
                    Camelot Wheel Explained →
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guides/bpm-genres"
                    className="text-sm hover:underline"
                  >
                    BPM by Music Genre →
                  </Link>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
