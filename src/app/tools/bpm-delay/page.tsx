import type { Metadata } from "next"
import { BpmDelayTool } from "@/components/tools/bpm-delay-tool"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { generateToolSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "BPM Delay Time Calculator - Sync Delay to Tempo",
  description:
    "Calculate precise delay times in milliseconds for any BPM. Get values for 1/4, 1/8, 1/16 notes with dotted and triplet variants. Free online tool for music producers.",
  keywords: [
    "BPM delay calculator",
    "delay time calculator",
    "tempo sync delay",
    "ms to BPM",
    "music production tools",
    "DAW delay settings",
  ],
  alternates: {
    canonical: "https://tunetapper.com/tools/bpm-delay",
  },
  openGraph: {
    title: "BPM Delay Time Calculator | TuneTapper",
    description:
      "Calculate precise delay times in milliseconds for any BPM. Perfect for syncing delay effects to your track's tempo.",
    url: "https://tunetapper.com/tools/bpm-delay",
  },
}

export default function BpmDelayPage() {
  const toolSchema = generateToolSchema({
    name: "BPM Delay Time Calculator",
    description:
      "Calculate precise delay times in milliseconds for any BPM. Get values for 1/4, 1/8, 1/16 notes with dotted and triplet variants.",
    url: "/tools/bpm-delay",
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <Breadcrumbs items={[{ name: "BPM Delay Calculator", path: "/tools/bpm-delay" }]} />
      </div>
      <BpmDelayTool />
    </>
  )
}
