import type { Metadata } from "next"
import Link from "next/link"
import { TapTempoTool } from "@/components/tools/tap-tempo-tool"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { generateToolSchema, generateFaqSchema, socialMetadata } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Tap BPM Counter - Free Online Tap Tempo Tool",
  description:
    "Count the BPM of any song by tapping along to the beat - free online tap tempo tool, no signup. Works on phone (tap the button) and desktop (Space/Enter). Accurate after 4-8 taps.",
  keywords: [
    "tap bpm",
    "tap bpm counter",
    "bpm counter online",
    "tap tempo",
    "tap tempo online",
    "bpm tapper",
    "find bpm by tapping",
    "beat counter online",
    "BPM finder",
    "find BPM of a song",
    "tempo finder",
  ],
  alternates: {
    canonical: "https://tunetapper.com/tools/tap-tempo",
  },
  ...socialMetadata({
    title: "Tap BPM Counter - Free Online Tap Tempo Tool | TuneTapper",
    description:
      "Count the BPM of any song by tapping along to the beat - free, no signup. Works on phone and desktop. Accurate after 4-8 taps.",
    path: "/tools/tap-tempo",
    image: "/og/tap-tempo.png",
    imageAlt: "Tap BPM Counter - TuneTapper",
  }),
}

const faqs = [
  {
    question: "How do I find the BPM of a song?",
    answer:
      "Tap along to the beat using the button above, your mouse, or the Space/Enter key. After 4-8 taps the tool calculates and displays the BPM automatically.",
  },
  {
    question: "How many taps do I need for an accurate BPM reading?",
    answer:
      "4 taps gives a rough estimate. 8 taps is recommended for accuracy. The tool uses a rolling average of your last 8 taps to smooth out any timing variations.",
  },
  {
    question: "How accurate is a tap tempo BPM counter?",
    answer:
      "With 8 or more steady taps, a tap tempo reading is typically within ±1 BPM of the true tempo - accurate enough for DJ beatmatching, delay calculations, and DAW project setup. Human timing jitter averages out over more taps, which is why the tool keeps a rolling average of your last 8.",
  },
  {
    question: "Why is my BPM reading double or half the real tempo?",
    answer:
      "You are probably tapping every kick in a half-time groove (reading doubles) or only every other beat (reading halves). Dubstep is the classic case: it is produced at ~140 BPM but the snare lands half-time, so many people tap 70. If a reading looks off, sanity-check it against the typical BPM range for the genre.",
  },
  {
    question: "Can I use this BPM counter on my phone?",
    answer:
      "Yes - tap the large button with your finger. The tool works in any mobile browser with no app or install; the button is deliberately large so it is easy to hit in time on a touchscreen.",
  },
  {
    question: "What is tap tempo?",
    answer:
      "Tap tempo is the method of finding a song's BPM by tapping along to the beat. Each tap represents one beat, and the tool calculates the average interval between taps to determine beats per minute.",
  },
  {
    question: "What is the difference between tap tempo and automatic BPM detection?",
    answer:
      "Automatic detection (in DJ software or a DAW) analyses the audio file itself, while tap tempo measures your taps - so it works on anything you can hear: a radio, a live band, a track playing in another room. Tapping is faster for a single track; automatic analysis is better for batch-processing a library.",
  },
  {
    question: "What BPM is common in different music genres?",
    answer:
      "House music is typically 120-130 BPM, techno 130-150 BPM, drum and bass 160-180 BPM, hip-hop 80-100 BPM, and pop 100-130 BPM.",
  },
]

// Static, server-rendered genre table - crawlable reference content that also
// helps users sanity-check a half/double-time misread.
const genreBpms = [
  { genre: "Hip-hop / boom bap", range: "80-100", note: "Trap is produced at 130-170 but feels half-time (65-85)" },
  { genre: "Reggaeton", range: "88-98", note: "Dembow rhythm sits in a narrow band" },
  { genre: "Pop", range: "100-130", note: "Most chart pop lands near 100-120" },
  { genre: "Disco / funk", range: "110-120", note: "" },
  { genre: "House", range: "120-130", note: "128 is the club standard" },
  { genre: "Techno", range: "130-150", note: "" },
  { genre: "Trance", range: "135-145", note: "" },
  { genre: "Dubstep", range: "138-142", note: "Half-time feel - often tapped as ~70" },
  { genre: "Drum & bass", range: "160-180", note: "174 is the scene default" },
  { genre: "Ambient / downtempo", range: "60-90", note: "" },
]

export default function TapTempoPage() {
  const toolSchema = generateToolSchema({
    name: "Tap BPM Counter - Tap Tempo",
    description:
      "Count the BPM of any song by tapping along to the beat. Works with touch, mouse, or keyboard.",
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
        <Breadcrumbs
          items={[
            { name: "Tools", path: "/tools" },
            { name: "Tap BPM Counter", path: "/tools/tap-tempo" },
          ]}
        />
      </div>
      <TapTempoTool />
      <div className="mx-auto max-w-2xl px-4 pb-12">
        <section className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>How This Tap Tempo Tool Works</h2>
          <p>
            Every tap is timestamped, and the BPM is calculated as{" "}
            <strong>60,000 ÷ average milliseconds between taps</strong>. The tool
            keeps a rolling average of your last 8 taps, so small timing wobbles
            cancel out instead of skewing the result - that is why the reading
            settles down after 4-8 taps. Pause for more than 3 seconds and it
            starts a fresh measurement, and readings outside the musical range of
            20-300 BPM are discarded as mis-taps.
          </p>
          <p>
            Because it measures <em>you</em> rather than an audio file, tap tempo
            works on anything you can hear: streaming, vinyl, a live drummer, or
            a track playing across the room. Prefer not to tap? The{" "}
            <Link href="/tools/bpm-detector">microphone BPM detector</Link>{" "}
            listens to the room and finds the tempo automatically. And if you
            have the audio file, our{" "}
            <Link href="/tools/key-analyzer">key &amp; BPM analyzer</Link>{" "}
            reads the tempo and musical key directly from the file in your
            browser.
          </p>

          <h2>Typical BPM by Genre</h2>
          <p>
            Use this table to sanity-check your reading - if you tapped 70 BPM on
            a dubstep track, you caught the half-time feel of a 140 BPM
            production. See the full{" "}
            <Link href="/guides/bpm-genres">genre BPM guide</Link> for more
            detail.
          </p>
        </section>
        <div className="my-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Genre</TableHead>
                <TableHead>Typical BPM</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {genreBpms.map(({ genre, range, note }) => (
                <TableRow key={genre}>
                  <TableCell className="font-medium">{genre}</TableCell>
                  <TableCell className="font-mono">{range}</TableCell>
                  <TableCell className="text-[var(--muted-foreground)]">
                    {note}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <section className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>Half-Time and Double-Time: The Classic Tap Tempo Mistake</h2>
          <p>
            The most common tap tempo error is landing on exactly half or double
            the true BPM. It happens because many genres put the snare on a
            half-time backbeat: your ear locks onto the snare, you tap every
            other beat, and a 140 BPM track reads as 70. The reverse happens in
            fast four-on-the-floor music when you tap the off-beat hats as well
            as the kick. If a number looks wrong for the genre, double it or
            halve it - one of the two is almost always the produced tempo.
          </p>

          <h2>What to Do With Your BPM</h2>
          <p>Once you have the tempo, it feeds directly into the rest of your workflow:</p>
          <ul>
            <li>
              <Link href="/tools/bpm-delay">BPM delay calculator</Link> - get
              delay and reverb pre-delay times in milliseconds for that tempo
            </li>
            <li>
              <Link href="/tools/bars-to-time">Bars to time calculator</Link> -
              find how long 8, 16, or 32 bars last at your BPM
            </li>
            <li>
              <Link href="/tools/bpm-transition">BPM transition helper</Link> -
              plan a tempo change between two tracks in a DJ set
            </li>
            <li>
              <Link href="/guides/tap-tempo-guide">Tap tempo technique guide</Link>{" "}
              - when to tap, when to trust software, and how DJs use it live
            </li>
            <li>
              <Link href="/guides/beatmatching-guide">Beatmatching guide</Link> -
              put the BPM to work matching two tracks by ear
            </li>
            <li>
              <Link href="/tools/rhythm-game">Rhythm test</Link> - think your
              timing is tight? Keep the beat after the metronome goes silent
              and get a score to share
            </li>
          </ul>

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
