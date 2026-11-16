import type { Metadata } from "next"
import Link from "next/link"
import { SetPlannerLoader } from "@/components/tools/set-planner-loader"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Badge } from "@/components/ui/badge"
import { generateToolSchema, generateFaqSchema, socialMetadata } from "@/lib/seo"

const TITLE = "DJ Set Planner - Sort a Playlist by Key & BPM, Free"
const DESCRIPTION =
  "Drop in a folder of tracks and get a harmonic set order: key, Camelot code and BPM for every track, transitions rated, then export to CSV or M3U. Free, and nothing is uploaded."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "dj set planner",
    "sort playlist by key",
    "harmonic mixing playlist",
    "dj playlist order",
    "camelot playlist sorter",
    "sort songs by bpm and key",
    "dj set builder",
  ],
  alternates: {
    canonical: "https://tunetapper.com/tools/set-planner",
  },
  ...socialMetadata({
    title: `${TITLE} | TuneTapper`,
    description:
      "Drop in your tracks and get a harmonic set order with key, Camelot and BPM for each one. Runs in your browser, nothing uploaded.",
    path: "/tools/set-planner",
    image: "/og/set-planner.png",
    imageAlt: "DJ Set Planner - TuneTapper",
  }),
}

const faqs = [
  {
    question: "How does the set planner decide the order?",
    answer:
      "It scores every possible pair of tracks. Mixing into the same Camelot key or one step around the wheel scores best, the relative major or minor next, then energy boosts (+2), and clashing keys worst. Tempo jumps add to the score: a nudge of a few percent is free, a big jump costs a lot. The planner then searches for the order with the lowest total, so the set flows from one compatible track to the next.",
  },
  {
    question: "Are my tracks uploaded anywhere?",
    answer:
      "No. Every file is decoded and analysed inside your browser with the Web Audio API. Nothing is sent to a server, and the audio is discarded once the key and BPM are measured. Only the results (titles, keys, tempos) are kept in your browser so the set is still there when you come back.",
  },
  {
    question: "How many tracks can I add?",
    answer:
      "Up to 500 per set. A typical track takes one to two seconds to analyse on a laptop, and several are processed at once, so a 50-track folder is done in about a minute. Phones are slower but work the same way.",
  },
  {
    question: "Can I import the order into rekordbox, Serato, Traktor or VirtualDJ?",
    answer:
      "Yes. Export an M3U playlist and save it in the same folder as the tracks; all four apps import M3U playlists and will find the files by their relative paths. The CSV export opens in Excel, Numbers or Google Sheets if you want a printed or shared tracklist.",
  },
  {
    question: "What do Build energy and Smoothest mix mean?",
    answer:
      "Smoothest mix finds the order with the fewest key clashes and tempo jumps, wherever that starts. Build energy keeps the harmonic rules but also makes the tempo climb, starting from your slowest tracks, which suits a warm-up that builds into a peak. As added keeps your own order and only rates each transition.",
  },
  {
    question: "Can I change the order myself?",
    answer:
      "Yes. Move any track up or down, remove tracks, or choose which track opens the set and let the planner order the rest around it. The transition rating between each pair updates as you go.",
  },
  {
    question: "Why does a key show a question mark?",
    answer:
      "The question mark means low detection confidence, usually a sparse, percussive or key-changing track. Check it by ear or open it in the key finder. Relative major and minor keys (8A and 8B, for example) are the most common mix-up, and they mix together anyway.",
  },
]

export default function SetPlannerPage() {
  const toolSchema = {
    ...generateToolSchema({
      name: "DJ Set Planner",
      description:
        "Sort a playlist into a harmonic DJ set order. Detects key, Camelot code and BPM of each track in the browser and exports CSV or M3U.",
      url: "/tools/set-planner",
    }),
    applicationCategory: "MultimediaApplication",
    featureList: [
      "Key and Camelot detection for every track",
      "BPM detection",
      "Harmonic set ordering",
      "Energy build-up ordering",
      "CSV and M3U export",
      "Runs entirely in the browser",
    ],
  }

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
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <Breadcrumbs
          items={[
            { name: "Tools", path: "/tools" },
            { name: "DJ Set Planner", path: "/tools/set-planner" },
          ]}
        />
      </div>
      <div className="mx-auto max-w-4xl px-4 py-8 lg:py-10">
        <div className="mb-8">
          <Badge variant="secondary" className="mb-3">
            New
          </Badge>
          <h1 className="text-3xl font-bold lg:text-4xl">DJ Set Planner</h1>
          <p className="mt-3 text-lg text-[var(--muted-foreground)]">
            Drop in the tracks for your next set. The planner finds the key,
            Camelot code and BPM of each one and sorts them into an order that
            mixes harmonically. Everything runs in your browser, so nothing is
            uploaded.
          </p>
        </div>

        <SetPlannerLoader />

        <section className="mt-10 prose prose-neutral dark:prose-invert max-w-none">
          <h2>How to Plan a DJ Set by Key and BPM</h2>
          <ol>
            <li>
              <strong>Add your tracks.</strong> Drag a folder or a selection of
              MP3, WAV, FLAC, AAC, OGG, M4A or AIFF files onto the page, or pick
              them with the buttons. Folders are read with their subfolders.
            </li>
            <li>
              <strong>Let it analyse.</strong> Each track is decoded on your
              device and run through the same detection as the{" "}
              <Link href="/tools/key-analyzer">key finder</Link> and the{" "}
              <Link href="/tools/bpm-detector">BPM detector</Link>. You can keep
              adding tracks while it works.
            </li>
            <li>
              <strong>Pick an order.</strong> <em>Smoothest mix</em> keeps every
              transition as harmonic as possible, <em>Build energy</em> also
              makes the tempo climb, and <em>Open with</em> fixes the first
              track.
            </li>
            <li>
              <strong>Fine-tune and export.</strong> Move or remove tracks, then
              export a CSV tracklist or an M3U playlist for your DJ software.
            </li>
          </ol>

          <h2>Sort a Playlist by Key</h2>
          <p>
            Sorting a playlist alphabetically by key puts 1A next to 1B and 2A,
            but it can&apos;t tell you that 12A should lead back into 1A, or that
            a 124 BPM track and a 140 BPM track in the same key still make a
            rough mix. The planner treats the{" "}
            <Link href="/tools/camelot">Camelot wheel</Link> as a circle and
            weighs key and tempo together, so the order it gives you is one you
            can actually play from top to bottom.
          </p>

          <h2>What the Transition Ratings Mean</h2>
          <ul>
            <li>
              <strong>Smooth</strong>: same key or one step around the wheel,
              with the tempo within a few percent. Mix it any way you like.
            </li>
            <li>
              <strong>Good</strong>: a relative major/minor switch or a slightly
              bigger tempo change. Long blends still work.
            </li>
            <li>
              <strong>Workable</strong>: an energy boost (+2), a diagonal move,
              or a tempo jump that needs a ride on the pitch fader. Keep the
              overlap short.
            </li>
            <li>
              <strong>Rough</strong>: keys that clash or a large tempo jump. Use
              a cut, an echo out, or a breakdown to get across.
            </li>
          </ul>
          <p>
            Under each rating you&apos;ll see the Camelot move (for example{" "}
            <em>+1</em> or <em>Relative</em>) and the tempo change in percent.
            When two tracks only line up at half or double time, such as drum
            &amp; bass into halftime, the planner says so. For the theory behind
            the ratings, read the{" "}
            <Link href="/guides/camelot-wheel-guide">Camelot wheel guide</Link>
            , and for tempo moves the{" "}
            <Link href="/tools/bpm-transition">BPM transition helper</Link>.
          </p>

          <h2>Private by Design</h2>
          <p>
            Most online playlist tools want your files on their server. This
            one doesn&apos;t: decoding and analysis happen in your browser, and
            the audio never leaves your computer or phone. Once the page has
            loaded, it keeps working offline. The results are saved in your
            browser, so the set is still there when you come back, and{" "}
            <em>Clear set</em> deletes them.
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

          <p>
            New to the planner? Read{" "}
            <Link href="/guides/dj-set-planner">
              how to plan a harmonic DJ set with the set planner
            </Link>
            .
          </p>
        </section>
      </div>
    </>
  )
}
