import type { Metadata } from "next"
import Link from "next/link"
import { CamelotTool } from "@/components/tools/camelot-tool"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
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
import { CAMELOT_KEYS, getCompatibleKeys } from "@/lib/camelot"
import {
  generateToolSchema,
  generateFaqSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo"

export const metadata: Metadata = {
  title: "Camelot Wheel Chart & Calculator — Harmonic Mixing Key Guide",
  description:
    "Interactive Camelot wheel plus a full 24-key compatibility chart. Click any key (1A–12B) to see every compatible mix, or scan the harmonic mixing table. Free, no signup.",
  keywords: [
    "camelot wheel",
    "camelot wheel chart",
    "camelot wheel calculator",
    "harmonic mixing chart",
    "key compatibility chart",
    "camelot wheel online",
    "DJ key mixing",
    "mixed in key",
  ],
  alternates: {
    canonical: "https://tunetapper.com/tools/camelot",
  },
  openGraph: {
    title: "Camelot Wheel Chart & Calculator — Harmonic Mixing Key Guide | TuneTapper",
    description:
      "Interactive Camelot wheel plus a full 24-key compatibility chart. Click any key to see every compatible mix, or scan the harmonic mixing table. Free, no signup.",
    url: "https://tunetapper.com/tools/camelot",
  },
}

const faqs = [
  {
    question: "What is the Camelot Wheel?",
    answer:
      "The Camelot Wheel is a system that assigns a number and letter (e.g. 8A, 8B) to each musical key, making it easy to find harmonically compatible keys for DJ mixing. Adjacent numbers on the wheel blend smoothly together.",
  },
  {
    question: "How do I use the Camelot Wheel for harmonic mixing?",
    answer:
      "Select your current track's Camelot key. Compatible keys are: the same key (perfect match), +1 or -1 (smooth energy shift), the relative major/minor (A↔B, mood change), and +2 (energy boost). Avoid clashing keys outside these rules.",
  },
  {
    question: "What does 8A mean in Camelot?",
    answer:
      "8A is A minor in the Camelot system. The number (8) indicates its position on the wheel, and A means it is a minor key. Its closest compatible keys are 7A, 9A, and 8B (A major).",
  },
  {
    question: "What keys are compatible with 8A?",
    answer:
      "8A (A minor) mixes harmonically with 8A (same key), 7A (D minor) and 9A (E minor) for ±1 energy shifts, 8B (C major) as the relative major, and 10A (B minor) as a +2 energy boost.",
  },
  {
    question: "What is the difference between A and B keys in Camelot?",
    answer:
      "In the Camelot system, A keys are minor keys and B keys are major keys. The same number with A or B (e.g. 8A and 8B) are relative minor and major — they share the same notes and mix well together.",
  },
  {
    question: "What is the +2 energy boost in harmonic mixing?",
    answer:
      "Moving +2 on the same letter (e.g. 8A → 10A) is a two-step jump that lifts the energy of a set more noticeably than a ±1 move while still staying musically compatible. DJs use it intentionally for dramatic build-ups.",
  },
  {
    question: "Is the Camelot Wheel the same as the circle of fifths?",
    answer:
      "It is a relabelled circle of fifths. Each Camelot number maps to a position on the circle of fifths, and the A/B letters distinguish the relative minor and major. The numbering simply makes compatible-key math easier without needing music theory.",
  },
  {
    question: "How do I find the Camelot key of a song?",
    answer:
      "Use a key-detection tool (such as our Key Analyzer) or DJ software like Mixed In Key, Serato, or rekordbox, then look up the detected musical key in the chart below to get its Camelot code.",
  },
  {
    question: "Can I mix keys that are not adjacent on the Camelot Wheel?",
    answer:
      "Technically yes, but they may sound dissonant. The safest mixes are within ±1 of your current key or the relative major/minor. The +2 energy boost is a common exception DJs use intentionally for dramatic effect.",
  },
]

// HowTo structured data for the "how to mix harmonically with the Camelot
// wheel" query intent. Inlined (not in seo.ts) to keep this PR independent.
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to use the Camelot Wheel for harmonic mixing",
  description:
    "Find harmonically compatible keys for a DJ transition using the Camelot Wheel.",
  step: [
    {
      "@type": "HowToStep",
      name: "Find your track's key",
      text: "Detect the current track's musical or Camelot key with DJ software or a key-detection tool.",
    },
    {
      "@type": "HowToStep",
      name: "Locate it on the wheel",
      text: "Find the matching Camelot code (1A–12B) on the wheel or in the compatibility chart.",
    },
    {
      "@type": "HowToStep",
      name: "Pick a compatible key",
      text: "Mix into the same key, ±1 (smooth shift), the relative major/minor (A↔B), or +2 for an energy boost.",
    },
    {
      "@type": "HowToStep",
      name: "Cue the next track",
      text: "Choose a track in the compatible key and beatmatch it for a clean harmonic transition.",
    },
  ],
}

export default function CamelotPage() {
  const toolSchema = generateToolSchema({
    name: "Camelot Wheel Calculator",
    description:
      "Free online Camelot wheel calculator. Find compatible keys for harmonic DJ mixing.",
    url: "/tools/camelot",
  })

  // Static, server-rendered compatibility chart for all 24 keys. This gives
  // the page crawlable, authoritative content that targets the long tail of
  // "what mixes with <key>" queries the page already ranks ~10 for.
  const compatibilityChart = CAMELOT_KEYS.map((key) => {
    const c = getCompatibleKeys(key)
    return {
      key,
      mixes: [c.minusOne, c.plusOne, c.relative, ...(c.energyBoost ? [c.energyBoost] : [])],
    }
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Tools", path: "/tools" }, { name: "Camelot Wheel Calculator", path: "/tools/camelot" }])) }}
      />
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <Breadcrumbs items={[{ name: "Camelot Wheel Calculator", path: "/tools/camelot" }]} />
      </div>
      <CamelotTool faqs={faqs} />

      {/* Static compatibility chart — crawlable authoritative content */}
      <div className="mx-auto max-w-4xl px-4 pb-12">
        <Card>
          <CardHeader>
            <CardTitle>Camelot Wheel Compatibility Chart (All 24 Keys)</CardTitle>
            <CardDescription>
              Every Camelot key and the keys it mixes with harmonically. Tap a
              key for its full reference page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Camelot</TableHead>
                  <TableHead>Musical Key</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Mixes Well With</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compatibilityChart.map(({ key, mixes }) => (
                  <TableRow key={key.camelot}>
                    <TableCell className="font-bold">
                      <Link
                        href={`/camelot/${key.camelot.toLowerCase()}`}
                        className="hover:underline"
                      >
                        {key.camelot}
                      </Link>
                    </TableCell>
                    <TableCell>{key.musical}</TableCell>
                    <TableCell className="capitalize text-[var(--muted-foreground)]">
                      {key.mode}
                    </TableCell>
                    <TableCell>
                      <span className="flex flex-wrap gap-x-2 gap-y-1">
                        {mixes.map((m) => (
                          <Link
                            key={m.camelot}
                            href={`/camelot/${m.camelot.toLowerCase()}`}
                            className="font-mono text-sm hover:underline"
                          >
                            {m.camelot}
                          </Link>
                        ))}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="mt-4 text-sm text-[var(--muted-foreground)]">
              &ldquo;Mixes Well With&rdquo; lists the −1, +1, relative major/minor,
              and +2 energy-boost keys. The key itself is always a perfect match.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
