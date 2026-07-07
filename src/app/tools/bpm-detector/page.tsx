import type { Metadata } from "next"
import Link from "next/link"
import { BpmDetectorTool } from "@/components/tools/bpm-detector-tool"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { generateToolSchema, generateFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "BPM Detector - Find a Song's Tempo With Your Microphone",
  description:
    "Free online BPM detector: play music out loud and your microphone finds the tempo automatically. No recording, no upload - all analysis happens on your device. No app needed.",
  keywords: [
    "bpm detector",
    "bpm detector online",
    "bpm finder microphone",
    "detect bpm from audio",
    "automatic bpm detection",
    "bpm counter microphone",
    "song tempo detector",
    "live bpm detection",
  ],
  alternates: {
    canonical: "https://tunetapper.com/tools/bpm-detector",
  },
  openGraph: {
    title: "BPM Detector - Find a Song's Tempo With Your Microphone | TuneTapper",
    description:
      "Play music out loud and your microphone finds the tempo automatically. No recording, no upload - all analysis on your device.",
    url: "https://tunetapper.com/tools/bpm-detector",
  },
}

const faqs = [
  {
    question: "How does the BPM detector work?",
    answer:
      "It listens through your microphone, measures the energy of the incoming audio about 47 times per second, and finds the repeating pattern of energy spikes - the drum hits. The spacing of that pattern is the tempo. Everything runs in your browser; no audio is recorded, stored, or sent anywhere.",
  },
  {
    question: "Why does it need microphone access?",
    answer:
      "The microphone is the only way a web page can hear music playing in the room. The audio stream is analyzed in real time and immediately discarded - the tool keeps only a running loudness curve (a list of numbers), never the sound itself.",
  },
  {
    question: "The reading looks double or half the tempo I expected - which is right?",
    answer:
      "Both describe the same groove. Genres with half-time drum patterns (dubstep, trap) are often produced at one tempo but felt at half of it. The detector prefers the produced-tempo reading; if it looks off for the genre, halve or double it.",
  },
  {
    question: "What if it can't find a beat?",
    answer:
      "Turn the volume up, move the device closer to the speaker, and make sure the track has a clear drum pattern. Beatless or rubato music has no steady onset pattern to measure - for those, tap the tempo yourself with the tap BPM counter.",
  },
  {
    question: "Is there a BPM detector that works without installing an app?",
    answer:
      "Yes - this one. It runs in any modern browser on desktop or mobile using the Web Audio API, with no app, account, or upload. For a file on disk, the key & BPM analyzer reads the tempo directly from the audio file instead.",
  },
]

export default function BpmDetectorPage() {
  const toolSchema = generateToolSchema({
    name: "BPM Detector (Microphone)",
    description:
      "Detect a song's BPM automatically through the microphone. On-device analysis, no recording.",
    url: "/tools/bpm-detector",
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
        <Breadcrumbs
          items={[
            { name: "Tools", path: "/tools" },
            { name: "BPM Detector", path: "/tools/bpm-detector" },
          ]}
        />
      </div>
      <BpmDetectorTool />
      <div className="mx-auto max-w-2xl px-4 pb-12">
        <section className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Three Ways to Find a Song&apos;s BPM</h2>
          <p>
            This page listens through the microphone, which is ideal when the
            music is playing in the room - a DJ set, vinyl, the radio. If you
            have the track as a file, the{" "}
            <Link href="/tools/key-analyzer">key &amp; BPM analyzer</Link> reads
            the tempo (and musical key) straight from the audio with no
            microphone involved. And if you would rather trust your own ears,
            the <Link href="/tools/tap-tempo">tap BPM counter</Link> measures
            the tempo from your taps - it works on anything you can hear, even
            through headphones.
          </p>
          <h2>Privacy</h2>
          <p>
            The audio stream never leaves your device. The detector converts
            the microphone input into a loudness envelope - a few dozen numbers
            per second describing how energy rises and falls - and finds the
            repeating beat pattern in that envelope. No recording is made, no
            audio is stored, and nothing is transmitted to any server. Stop
            listening and the data is gone.
          </p>

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
