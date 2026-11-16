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
      "Any length. The tool skips the intro (the first quarter of the track, between 20 and 90 seconds) and analyzes up to two minutes from there, which is more than enough for reliable key detection. Only the analysis window is capped, for speed.",
  },
  {
    question: "It says A minor but my DJ software says C major. Which is right?",
    answer:
      "Possibly both. A minor and C major share exactly the same notes, so key detectors often swap them. On the Camelot wheel they are 8A and 8B, which mix together without clashing, so for harmonic mixing the difference rarely matters.",
  },
  {
    question: "Can I find the key of a song on Spotify or YouTube?",
    answer:
      "Not directly. Streaming audio is protected, so the key finder needs an audio file on your device, such as an MP3 you bought or a bounce from your own project. If you only need the tempo of something playing, the BPM detector can listen through your microphone.",
  },
  {
    question: "Does the key finder work on a phone?",
    answer:
      "Yes. It runs in any modern mobile browser. Pick a file from your phone's storage and it is analyzed on the device itself, just like on a computer.",
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
