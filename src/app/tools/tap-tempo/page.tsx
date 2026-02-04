import type { Metadata } from "next"
import { TapTempoTool } from "@/components/tools/tap-tempo-tool"
import { generateToolSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Tap Tempo - Find the BPM of Any Song",
  description:
    "Tap along to find the BPM of any song. Works with mouse clicks or keyboard. Free online tap tempo tool for DJs and musicians.",
  keywords: [
    "tap tempo",
    "BPM finder",
    "beats per minute",
    "tempo detector",
    "find song BPM",
    "DJ tools",
  ],
  alternates: {
    canonical: "https://tunetapper.com/tools/tap-tempo",
  },
  openGraph: {
    title: "Tap Tempo - Find BPM | TuneTapper",
    description:
      "Tap along to find the BPM of any song. Works with mouse clicks or keyboard.",
    url: "https://tunetapper.com/tools/tap-tempo",
  },
}

export default function TapTempoPage() {
  const toolSchema = generateToolSchema({
    name: "Tap Tempo",
    description:
      "Tap along to find the BPM of any song. Works with mouse clicks or keyboard taps.",
    url: "/tools/tap-tempo",
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <TapTempoTool />
    </>
  )
}
