import type { Metadata } from "next"
import { CamelotTool } from "@/components/tools/camelot-tool"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { generateToolSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Camelot Wheel - Find Compatible Keys for Harmonic Mixing",
  description:
    "Find compatible keys for harmonic DJ mixing using the Camelot Wheel. Discover which keys blend perfectly together. Free online tool for DJs.",
  keywords: [
    "Camelot wheel",
    "harmonic mixing",
    "DJ key mixing",
    "compatible keys",
    "mixed in key",
    "key compatibility",
  ],
  alternates: {
    canonical: "https://tunetapper.com/tools/camelot",
  },
  openGraph: {
    title: "Camelot Wheel - Harmonic Mixing Tool | TuneTapper",
    description:
      "Find compatible keys for harmonic DJ mixing using the Camelot Wheel system.",
    url: "https://tunetapper.com/tools/camelot",
  },
}

export default function CamelotPage() {
  const toolSchema = generateToolSchema({
    name: "Camelot Wheel - Key Compatibility Tool",
    description:
      "Find compatible keys for harmonic DJ mixing using the Camelot Wheel system.",
    url: "/tools/camelot",
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }}
      />
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <Breadcrumbs items={[{ name: "Tools", path: "/tools/camelot" }, { name: "Camelot Wheel", path: "/tools/camelot" }]} />
      </div>
      <CamelotTool />
    </>
  )
}
