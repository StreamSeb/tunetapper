import type { Metadata } from "next"
import { TapTempoEmbed } from "@/components/embed/tap-tempo-embed"

export const metadata: Metadata = {
  title: "Tap Tempo Widget",
  robots: { index: false, follow: true },
}

export default function TapTempoEmbedPage() {
  return <TapTempoEmbed />
}
