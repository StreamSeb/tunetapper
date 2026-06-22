import Link from "next/link"
import type { Metadata } from "next"
import {
  Clock,
  Timer,
  Keyboard,
  Disc3,
  ArrowLeftRight,
  ScanSearch,
} from "lucide-react"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { generateMetadata as genMeta, generateBreadcrumbSchema } from "@/lib/seo"

export const metadata: Metadata = genMeta({
  title: "Free Music Production & DJ Tools",
  description:
    "Every free TuneTapper tool in one place — BPM delay calculator, bars-to-time converter, tap tempo, Camelot wheel, BPM transition helper, and an in-browser song key finder. No signup, no upload.",
  path: "/tools",
})

const tools = [
  {
    title: "BPM Delay Calculator",
    description:
      "Calculate precise delay times in milliseconds for any BPM, including dotted and triplet 1/4, 1/8, and 1/16 note values.",
    href: "/tools/bpm-delay",
    icon: Clock,
    badge: "Popular",
  },
  {
    title: "Bars to Time Calculator",
    description:
      "Convert bars to an exact duration. Find out how long 16, 32, or 64 bars last at your track's tempo, in seconds and minutes.",
    href: "/tools/bars-to-time",
    icon: Timer,
    badge: null,
  },
  {
    title: "Tap Tempo",
    description:
      "Tap along to any song to find its BPM. Works with mouse clicks or the keyboard — ideal for quickly reading a track's tempo by ear.",
    href: "/tools/tap-tempo",
    icon: Keyboard,
    badge: "Mobile Friendly",
  },
  {
    title: "Camelot Wheel Calculator",
    description:
      "Find harmonically compatible keys for DJ mixing. Click any Camelot key (1A–12B) to see every key it blends with, plus a full 24-key chart.",
    href: "/tools/camelot",
    icon: Disc3,
    badge: "DJ Essential",
  },
  {
    title: "BPM Transition Helper",
    description:
      "Plan smooth tempo changes between tracks with half-time, double-time, and gradual BPM transition suggestions.",
    href: "/tools/bpm-transition",
    icon: ArrowLeftRight,
    badge: null,
  },
  {
    title: "Key Finder",
    description:
      "Detect the musical key and Camelot code of any song. Drop in an audio file and it's analysed privately in your browser — no upload, no software, no account.",
    href: "/tools/key-analyzer",
    icon: ScanSearch,
    badge: "New",
  },
]

// ItemList structured data so the tools collection is eligible for rich results.
const itemListSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "TuneTapper Music Production & DJ Tools",
  itemListElement: tools.map((tool, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: tool.title,
    url: `https://tunetapper.com${tool.href}`,
  })),
}

export default function ToolsHubPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            generateBreadcrumbSchema([
              { name: "Home", path: "/" },
              { name: "Tools", path: "/tools" },
            ])
          ),
        }}
      />

      <Breadcrumbs items={[{ name: "Tools", path: "/tools" }]} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold lg:text-4xl">
          Free Music Production &amp; DJ Tools
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          A complete set of free, browser-based utilities for DJs and producers
          — calculate delay times, convert bars to time, tap out a tempo, mix in
          key with the Camelot wheel, plan BPM transitions, and detect the key of
          any track. No signup, nothing to install.
        </p>
      </div>

      {/* Tools grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link key={tool.href} href={tool.href} className="group">
            <Card className="h-full transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-[var(--primary)] p-2 text-[var(--primary-foreground)]">
                    <tool.icon className="h-5 w-5" />
                  </div>
                  {tool.badge && <Badge variant="secondary">{tool.badge}</Badge>}
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

      {/* Cross-links to references and guides */}
      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Keep Exploring</CardTitle>
          <CardDescription>
            References and guides that pair with these tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2">
            <li>
              <Link href="/camelot" className="text-sm hover:underline">
                All Camelot keys & compatible mixes →
              </Link>
            </li>
            <li>
              <Link href="/bpm" className="text-sm hover:underline">
                BPM delay & bar references →
              </Link>
            </li>
            <li>
              <Link
                href="/guides/key-detection-software"
                className="text-sm hover:underline"
              >
                Key detection software compared →
              </Link>
            </li>
            <li>
              <Link
                href="/guides/camelot-wheel-guide"
                className="text-sm hover:underline"
              >
                The Camelot wheel explained →
              </Link>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
