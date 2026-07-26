import type { Metadata } from "next"
import { StudioBuilderTool } from "@/components/tools/studio-builder-tool"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { generateToolSchema, generateFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Studio Setup Builder - Complete Gear Lists for Any Budget",
  description:
    "Enter your budget and the music you make, and get a complete home studio or DJ setup - hand-picked headphones, monitors, interface, controller, mic, stands and cables, with prices from Thomann and Gear4music.",
  keywords: [
    "home studio setup",
    "budget studio setup",
    "DJ starter setup",
    "music production gear",
    "studio equipment list",
    "beginner producer setup",
  ],
  alternates: {
    canonical: "https://tunetapper.com/tools/studio-builder",
  },
  openGraph: {
    title: "Studio Setup Builder | TuneTapper",
    description:
      "Enter your budget and the music you make, and get a complete studio or DJ setup with hand-picked gear.",
    url: "https://tunetapper.com/tools/studio-builder",
    images: [{ url: "/og/default.png", width: 1200, height: 630, alt: "Studio Setup Builder - TuneTapper" }],
  },
}

const faqs = [
  {
    question: "What do I need for a home music studio?",
    answer:
      "The core of a home studio is headphones, studio monitors, and an audio interface, plus the cables and a mic stand that make them usable. Producers add a MIDI keyboard, vocalists add a microphone, and DJs need a controller. A complete sensible starter setup is possible from around 300 euros; 800-1,500 euros covers solid mid-tier gear in every role.",
  },
  {
    question: "How much does a beginner DJ setup cost?",
    answer:
      "A real beginner DJ setup - controller, headphones, and small monitors - starts around 300-450 euros. The Pioneer DJ DDJ-FLX4 (around 299 euros) with Sennheiser HD 25 headphones (119 euros at Thomann) is the most common club-style starting point.",
  },
  {
    question: "Do studio monitor prices include both speakers?",
    answer:
      "Usually not. Most studio monitors are sold individually, so a stereo pair costs twice the listed price - Thomann labels these 'price per piece'. Compact desktop systems like the PreSonus Eris 3.5 and IK iLoud Micro Monitor are the exception and ship as a pair. The builder always costs a usable stereo pair and shows the per-unit price alongside it.",
  },
  {
    question: "Should I buy studio monitors or headphones first?",
    answer:
      "Headphones first. Good headphones work in any room at any hour, while monitors need volume and a decent room to be useful. In a small or shared space, quality headphones plus compact monitors beat big monitors you can never turn up.",
  },
  {
    question: "Are these picks sponsored?",
    answer:
      "No. The catalog is hand-curated based on track record at each price point. Some outbound store links may be affiliate links, which never affects which gear is recommended or what you pay.",
  },
]

export default function StudioBuilderPage() {
  const toolSchema = generateToolSchema({
    name: "Studio Setup Builder",
    description:
      "Interactive tool that turns a budget and a use case into a complete home studio or DJ setup with hand-picked gear recommendations.",
    url: "/tools/studio-builder",
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
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <Breadcrumbs items={[{ name: "Studio Setup Builder", path: "/tools/studio-builder" }]} />
      </div>
      <StudioBuilderTool />
    </>
  )
}
