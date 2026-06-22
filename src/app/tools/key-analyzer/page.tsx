import type { Metadata } from "next"
import { KeyAnalyzerTool } from "@/components/tools/key-analyzer-tool"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { generateToolSchema, generateFaqSchema, generateBreadcrumbSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Free Online Key Finder — Detect Song Key, No Upload Needed",
  description:
    "Find the musical key and Camelot code of any song free — no upload, no software, no account. Drop in an MP3, WAV, or FLAC and it's analysed privately in your browser.",
  keywords: [
    "online key finder",
    "find key of song online",
    "key finder no upload",
    "key finder without uploading",
    "find song key without software",
    "free key finder no download",
    "private key finder",
    "audio key detector",
    "song key analyzer",
    "free key detection",
    "what key is this song",
    "camelot key finder",
    "musical key detector",
    "key finder DJ",
    "harmonic mixing key finder",
  ],
  alternates: {
    canonical: "https://tunetapper.com/tools/key-analyzer",
  },
  openGraph: {
    title: "Free Online Key Finder — Detect Song Key, No Upload Needed | TuneTapper",
    description:
      "Find the key and Camelot code of any song free — no upload, no software, no account. Analysed privately in your browser.",
    url: "https://tunetapper.com/tools/key-analyzer",
  },
}

const faqs = [
  {
    question: "What audio formats does the key finder support?",
    answer:
      "The tool supports MP3, WAV, FLAC, AAC, OGG, and M4A files. If your browser can play it, the key finder can analyze it — audio decoding is handled by the browser's native Web Audio API.",
  },
  {
    question: "Is my audio file uploaded to a server?",
    answer:
      "No. Everything runs locally in your browser using the Web Audio API. Your audio file never leaves your device and is not stored or transmitted anywhere.",
  },
  {
    question: "How accurate is the key detection?",
    answer:
      "The tool uses the Krumhansl-Schmuckler algorithm — the academic standard for musical key estimation. Accuracy is typically 70–90% on commercial music. It works best on tracks with a clear tonal center, which covers most EDM, house, techno, pop, and hip-hop.",
  },
  {
    question: "What is the Camelot notation shown in the result?",
    answer:
      "The Camelot Wheel assigns each musical key a code like 8A (A minor) or 8B (C major). DJs use these codes for harmonic mixing — tracks that share the same number, or differ by one step, blend together without harmonic clashing.",
  },
  {
    question: "The result doesn't match what my DJ software says — why?",
    answer:
      "Key detection is probabilistic. Different algorithms can disagree, especially for tracks with key changes, heavy modulation, or very sparse harmonic content. As a rule of thumb, if confidence is below 70%, try a section of the track that has more melodic content.",
  },
  {
    question: "How long can the audio file be?",
    answer:
      "The tool analyzes up to the first 90 seconds of a track, which is more than enough for reliable key detection. Longer files are supported — only the analysis window is capped for performance.",
  },
]

export default function KeyAnalyzerPage() {
  const toolSchema = generateToolSchema({
    name: "Free Online Key Finder",
    description:
      "Detect the musical key and Camelot notation of any audio file. Runs entirely in your browser.",
    url: "/tools/key-analyzer",
  })

  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Tools", path: "/tools" },
    { name: "Key Finder", path: "/tools/key-analyzer" },
  ]

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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateBreadcrumbSchema(breadcrumbItems)),
        }}
      />
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <Breadcrumbs
          items={[{ name: "Key Finder", path: "/tools/key-analyzer" }]}
        />
      </div>
      <KeyAnalyzerTool faqs={faqs} />
    </>
  )
}
