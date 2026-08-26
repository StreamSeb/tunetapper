import type { Metadata } from "next"
import { KeyAnalyzerTool } from "@/components/tools/key-analyzer-tool"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { generateToolSchema, generateFaqSchema, socialMetadata } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Song Key Finder - Detect the Key of Any MP3, No Upload",
  description:
    "Free online key finder: drop in an MP3, WAV, or FLAC and read its musical key and Camelot code in seconds. Nothing is uploaded - the file is analysed privately in your browser.",
  keywords: [
    "song key finder",
    "key detector",
    "mp3 key finder",
    "camelot key finder",
    "key finder no upload",
  ],
  alternates: {
    canonical: "https://tunetapper.com/tools/key-analyzer",
  },
  ...socialMetadata({
    title: "Song Key Finder - Detect the Key of Any MP3, No Upload | TuneTapper",
    description:
      "Drop in an MP3 and read its musical key and Camelot code in seconds. Nothing is uploaded - analysed privately in your browser.",
    path: "/tools/key-analyzer",
    image: "/og/key-analyzer.png",
    imageAlt: "Song Key Finder - TuneTapper",
  }),
}

const faqs = [
  {
    question: "What audio formats does the key finder support?",
    answer:
      "The tool supports MP3, WAV, FLAC, AAC, OGG, and M4A files. If your browser can play it, the key finder can analyze it - audio decoding is handled by the browser's native Web Audio API.",
  },
  {
    question: "Is my audio file uploaded to a server?",
    answer:
      "No. Everything runs locally in your browser using the Web Audio API. Your audio file never leaves your device and is not stored or transmitted anywhere.",
  },
  {
    question: "How accurate is the key detection?",
    answer:
      "The tool uses the Krumhansl-Schmuckler algorithm - the academic standard for musical key estimation. Accuracy is typically 70-90% on commercial music. It works best on tracks with a clear tonal center, which covers most EDM, house, techno, pop, and hip-hop.",
  },
  {
    question: "What is the Camelot notation shown in the result?",
    answer:
      "The Camelot Wheel assigns each musical key a code like 8A (A minor) or 8B (C major). DJs use these codes for harmonic mixing - tracks that share the same number, or differ by one step, blend together without harmonic clashing.",
  },
  {
    question: "The result doesn't match what my DJ software says - why?",
    answer:
      "Key detection is probabilistic. Different algorithms can disagree, especially for tracks with key changes, heavy modulation, or very sparse harmonic content. As a rule of thumb, if confidence is below 70%, try a section of the track that has more melodic content.",
  },
  {
    question: "How long can the audio file be?",
    answer:
      "The tool analyzes up to the first 90 seconds of a track, which is more than enough for reliable key detection. Longer files are supported - only the analysis window is capped for performance.",
  },
]

export default function KeyAnalyzerPage() {
  const toolSchema = generateToolSchema({
    name: "Song Key Finder",
    description:
      "Detect the musical key and Camelot notation of any audio file. Runs entirely in your browser - nothing is uploaded.",
    url: "/tools/key-analyzer",
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
        <Breadcrumbs
          items={[
            { name: "Tools", path: "/tools" },
            { name: "Key Finder", path: "/tools/key-analyzer" },
          ]}
        />
      </div>
      <KeyAnalyzerTool faqs={faqs} />
    </>
  )
}
