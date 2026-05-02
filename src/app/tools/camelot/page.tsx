import type { Metadata } from "next"
import { CamelotTool } from "@/components/tools/camelot-tool"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { generateToolSchema, generateFaqSchema, generateBreadcrumbSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Camelot Wheel Online — Click a Key, See Compatible Mixes",
  description:
    "Free interactive Camelot wheel. Click any key (1A–12B) to instantly see every compatible mix — adjacent keys, relative major/minor, and energy-boost moves. No signup, works in your browser.",
  keywords: [
    "Camelot wheel calculator",
    "harmonic mixing",
    "key compatibility",
    "camelot wheel online",
    "DJ key mixing",
    "mixed in key",
  ],
  alternates: {
    canonical: "https://tunetapper.com/tools/camelot",
  },
  openGraph: {
    title: "Camelot Wheel Online — Click a Key, See Compatible Mixes | TuneTapper",
    description:
      "Free interactive Camelot wheel. Click any key (1A–12B) to instantly see every compatible mix — adjacent keys, relative major/minor, and energy-boost moves. No signup, works in your browser.",
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
    question: "What is the difference between A and B keys in Camelot?",
    answer:
      "In the Camelot system, A keys are minor keys and B keys are major keys. The same number with A or B (e.g. 8A and 8B) are relative minor and major — they share the same notes and mix well together.",
  },
  {
    question: "Can I mix keys that are not adjacent on the Camelot Wheel?",
    answer:
      "Technically yes, but they may sound dissonant. The safest mixes are within ±1 of your current key or the relative major/minor. The +2 energy boost is a common exception DJs use intentionally for dramatic effect.",
  },
]

export default function CamelotPage() {
  const toolSchema = generateToolSchema({
    name: "Camelot Wheel Calculator",
    description:
      "Free online Camelot wheel calculator. Find compatible keys for harmonic DJ mixing.",
    url: "/tools/camelot",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBreadcrumbSchema([{ name: "Home", path: "/" }, { name: "Tools", path: "/tools" }, { name: "Camelot Wheel Calculator", path: "/tools/camelot" }])) }}
      />
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <Breadcrumbs items={[{ name: "Camelot Wheel Calculator", path: "/tools/camelot" }]} />
      </div>
      <CamelotTool faqs={faqs} />
    </>
  )
}
