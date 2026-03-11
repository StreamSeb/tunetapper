import type { Metadata } from "next"
import { AudioAnalyzerTool } from "@/components/tools/audio-analyzer-tool"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { generateToolSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Audio BPM & Key Analyzer - Detect Tempo and Musical Key",
  description:
    "Upload any audio file to detect its BPM and musical key — all in your browser. Get the Camelot code instantly. Free tool for DJs and music producers. No file uploads to any server.",
  keywords: [
    "audio key detector",
    "BPM detector",
    "song key finder",
    "Camelot key detector",
    "music key analyzer",
    "audio analyzer",
    "tempo detector",
    "DJ key finder",
  ],
  alternates: {
    canonical: "https://tunetapper.com/tools/audio-analyzer",
  },
  openGraph: {
    title: "Audio BPM & Key Analyzer | TuneTapper",
    description:
      "Detect the BPM and musical key of any audio file, entirely in your browser. Get the Camelot code for harmonic mixing.",
    url: "https://tunetapper.com/tools/audio-analyzer",
  },
}

export default function AudioAnalyzerPage() {
  const toolSchema = generateToolSchema({
    name: "Audio BPM & Key Analyzer",
    description:
      "Upload an audio file to detect its BPM and musical key entirely in your browser. Results include the Camelot wheel code for harmonic mixing.",
    url: "/tools/audio-analyzer",
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <Breadcrumbs
          items={[{ name: "Audio BPM & Key Analyzer", path: "/tools/audio-analyzer" }]}
        />
      </div>
      <AudioAnalyzerTool />
    </>
  )
}
