import Link from "next/link"
import {
  Clock,
  Music2,
  Disc3,
  Timer,
  ArrowLeftRight,
  Keyboard,
  ScanSearch,
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
    title: "Key Finder",
    description:
      "Detect the musical key and Camelot notation of any track. Upload an audio file and get the key instantly — runs in your browser, nothing uploaded.",
    href: "/tools/key-analyzer",
    icon: ScanSearch,
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
              <span className="text-[var(--primary)]">Music Producers</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--muted-foreground)]">
              Calculate BPM delay times, find compatible keys, convert bars to
              time, and more. All the essential utilities you need, free and
              easy to use.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/tools/bpm-delay">
                  <Clock className="mr-2 h-5 w-5" />
                  BPM Delay Calculator
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
              <Card className="h-full transition-shadow hover:shadow-lg">
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
