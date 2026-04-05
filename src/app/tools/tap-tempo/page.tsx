import type { Metadata } from "next"
import { TapTempoTool } from "@/components/tools/tap-tempo-tool"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { generateToolSchema, generateFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Online BPM Finder — Tap to Find Any Song's Tempo",
  description:
    "Find the BPM of any song instantly — just tap along to the beat. Works with mouse or keyboard (Space/Enter). Free tap tempo tool for DJs and producers.",
  keywords: [
    "BPM finder",
    "tap tempo",
    "find BPM of a song",
    "online BPM finder",
    "beats per minute finder",
    "tempo finder",
    "DJ tools",
  ],
  alternates: {
    canonical: "https://tunetapper.com/tools/tap-tempo",
  },
  openGraph: {
    title: "Online BPM Finder — Tap to Find Any Song's Tempo | TuneTapper",
    description:
      "Find the BPM of any song instantly — just tap along to the beat. Works with mouse or keyboard (Space/Enter). Free tap tempo tool for DJs and producers.",
    url: "https://tunetapper.com/tools/tap-tempo",
  },
}

const faqs = [
  {
    question: "How do I find the BPM of a song?",
    answer:
      "Tap along to the beat using the button above, your mouse, or the Space/Enter key. After 4–8 taps the tool calculates and displays the BPM automatically.",
  },
  {
    question: "How many taps do I need for an accurate BPM reading?",
    answer:
      "4 taps gives a rough estimate. 8 taps is recommended for accuracy. The tool uses a rolling average of your last 8 taps to smooth out any timing variations.",
  },
  {
    question: "What is tap tempo?",
    answer:
      "Tap tempo is the method of finding a song's BPM by tapping along to the beat. Each tap represents one beat, and the tool calculates the average interval between taps to determine beats per minute.",
  },
  {
    question: "What BPM is common in different music genres?",
    answer:
      "House music is typically 120–130 BPM, techno 130–150 BPM, drum and bass 160–180 BPM, hip-hop 80–100 BPM, and pop 100–130 BPM.",
  },
]

export default function TapTempoPage() {
  const toolSchema = generateToolSchema({
    name: "BPM Finder — Tap Tempo",
    description:
      "Find the BPM of any song by tapping along to the beat. Works with mouse or keyboard.",
    url: "/tools/tap-tempo",
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
      <div className="mx-auto max-w-2xl px-4 pt-6">
        <Breadcrumbs items={[{ name: "BPM Finder — Tap Tempo", path: "/tools/tap-tempo" }]} />
      </div>
      <TapTempoTool />
      <div className="mx-auto max-w-2xl px-4 pb-12">
        <section className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Frequently Asked Questions</h2>
          <dl>
            {faqs.map((faq) => (
              <div key={faq.question} className="mb-6">
                <dt className="font-semibold text-base not-prose mb-1">{faq.question}</dt>
                <dd className="text-[var(--muted-foreground)] not-prose">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  )
}
