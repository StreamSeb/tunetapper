import type { Metadata } from "next"
import { BarsToTimeTool } from "@/components/tools/bars-to-time-tool"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { generateToolSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Bars to Time Calculator - Convert Bars to Duration",
  description:
    "Calculate exact duration for any number of bars at any BPM. Find out how long 16, 32, or 64 bars last. Free tool for DJs and music producers.",
  keywords: [
    "bars to time calculator",
    "bar duration calculator",
    "how long is 32 bars",
    "music timing calculator",
    "DJ tools",
    "arrangement calculator",
  ],
  alternates: {
    canonical: "https://tunetapper.com/tools/bars-to-time",
  },
  openGraph: {
    title: "Bars to Time Calculator | TuneTapper",
    description:
      "Calculate exact duration for any number of bars at any BPM. Essential for music arrangement and DJ mixing.",
    url: "https://tunetapper.com/tools/bars-to-time",
  },
}

export default function BarsToTimePage() {
  const toolSchema = generateToolSchema({
    name: "Bars to Time Calculator",
    description:
      "Calculate exact duration for any number of bars at any BPM. Find out how long 16, 32, or 64 bars last.",
    url: "/tools/bars-to-time",
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <Breadcrumbs items={[{ name: "Tools", path: "/tools/bars-to-time" }, { name: "Bars to Time", path: "/tools/bars-to-time" }]} />
      </div>
      <BarsToTimeTool />
    </>
  )
}
