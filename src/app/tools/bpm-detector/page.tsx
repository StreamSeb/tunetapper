import type { Metadata } from "next"
import Link from "next/link"
import { BpmDetectorTool } from "@/components/tools/bpm-detector-tool"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { generateToolSchema, generateFaqSchema, socialMetadata } from "@/lib/seo"

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
  ...socialMetadata({
    title: "BPM Detector - Find a Song's Tempo With Your Microphone | TuneTapper",
    description:
      "Play music out loud and your microphone finds the tempo automatically. No recording, no upload - all analysis on your device.",
    path: "/tools/bpm-detector",
    image: "/og/bpm-detector.png",
    imageAlt: "BPM Detector - TuneTapper",
  }),
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
          <h2>Find the BPM of a Song Playing on a Speaker</h2>
          <p>
            Point the device at the speaker, start listening, and the tempo
            appears within a few bars. Nothing needs to be connected to the
            sound system - the detector works from the sound in the air, so it
            reads a track coming out of a club PA, a monitor, a laptop, or a
            Bluetooth speaker just as well as one playing on headphones held
            close to the mic.
          </p>

          <h2>BPM Counter Using Your Phone&apos;s Microphone</h2>
          <p>
            The page runs in the mobile browser, so your phone becomes a
            pocket <strong>BPM counter</strong> with nothing to install. Open it
            on the dancefloor, in a record shop, or in a rehearsal room, hold the
            phone toward the source, and read the tempo. Because the analysis is
            on-device, it keeps working with no signal.
          </p>

          <h2>Detect BPM from Vinyl, Radio, or a Live DJ Set</h2>
          <p>
            Sources with no file to analyse are exactly where microphone
            detection earns its place. A record on a turntable, a radio
            broadcast, a support DJ&apos;s set you want to mix into - none of
            them exist as an audio file you can drop into an analyzer, but all of
            them are audible in the room. Pitch-adjusted vinyl works too: the
            detector reads the tempo actually playing, not the tempo printed on
            the label.
          </p>

          <h2>Find the Tempo of a Live Band or Drummer</h2>
          <p>
            Live performance drifts, and the detector follows it. Point it at a
            drummer to check whether the band is rushing, confirm a click-track
            tempo in rehearsal, or capture the tempo of a live take you want to
            rebuild in the studio later. A clear, steady backbeat gives the most
            stable reading.
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
