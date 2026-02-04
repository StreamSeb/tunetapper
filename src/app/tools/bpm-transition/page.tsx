import type { Metadata } from "next"
import { BpmTransitionTool } from "@/components/tools/bpm-transition-tool"
import { generateToolSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "BPM Transition Helper - Plan Smooth Tempo Changes",
  description:
    "Plan smooth BPM transitions between tracks. Get strategies for half-time, double-time, and gradual tempo changes. Free tool for DJs.",
  keywords: [
    "BPM transition",
    "tempo transition",
    "DJ mixing techniques",
    "half-time mixing",
    "double-time mixing",
    "tempo change",
  ],
  alternates: {
    canonical: "https://tunetapper.com/tools/bpm-transition",
  },
  openGraph: {
    title: "BPM Transition Helper | TuneTapper",
    description:
      "Plan smooth BPM transitions between tracks. Get strategies for half-time, double-time, and gradual tempo changes.",
    url: "https://tunetapper.com/tools/bpm-transition",
  },
}

export default function BpmTransitionPage() {
  const toolSchema = generateToolSchema({
    name: "BPM Transition Helper",
    description:
      "Plan smooth BPM transitions between tracks at different tempos. Get strategies for half-time, double-time, and gradual tempo changes.",
    url: "/tools/bpm-transition",
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <BpmTransitionTool />
    </>
  )
}
