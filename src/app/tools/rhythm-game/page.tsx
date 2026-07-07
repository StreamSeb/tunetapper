import type { Metadata } from "next"
import Link from "next/link"
import { RhythmGame } from "@/components/tools/rhythm-game"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { generateToolSchema, generateFaqSchema } from "@/lib/seo"

export const metadata: Metadata = {
  title: "Rhythm Test - How Accurate Is Your Internal Metronome?",
  description:
    "Test your rhythm online: tap along with a metronome, keep the beat when it goes silent, and get a timing accuracy score out of 100. Free, works on phone and desktop - share your score.",
  keywords: [
    "rhythm test",
    "rhythm game online",
    "timing test",
    "internal metronome test",
    "beat accuracy test",
    "tempo test",
    "tap rhythm game",
    "rhythm trainer",
    "test your rhythm",
  ],
  alternates: {
    canonical: "https://tunetapper.com/tools/rhythm-game",
  },
  openGraph: {
    title: "Rhythm Test - How Accurate Is Your Internal Metronome? | TuneTapper",
    description:
      "Tap along with a metronome, keep the beat when it goes silent, and get a timing accuracy score out of 100. Can you hit Drum Machine tier?",
    url: "https://tunetapper.com/tools/rhythm-game",
    images: [{ url: "/og/rhythm-game.png", width: 1200, height: 630, alt: "Rhythm Test - TuneTapper" }],
  },
}

const faqs = [
  {
    question: "How does the rhythm test work?",
    answer:
      "A metronome plays a few beats so you can lock into the tempo, then goes silent while you keep tapping on the beat from memory. Your score measures how close each of your silent-phase taps lands to the true beat grid, from 0 to 100.",
  },
  {
    question: "What is a good rhythm test score?",
    answer:
      "Timing research shows most people drift by 20-50 milliseconds per tap when synchronizing to a beat. On this test, 85+ (Drum Machine tier) means your average deviation is under roughly 20 ms - excellent. 60-85 is solid; below 40 means you drifted off the tempo once the metronome stopped.",
  },
  {
    question: "Why is a slower tempo harder?",
    answer:
      "With more time between beats, your brain has to bridge a longer silent gap using its internal clock, and small errors in your tempo estimate add up more between taps. Musicians practice slow-tempo click tracks for exactly this reason.",
  },
  {
    question: "How can I improve my rhythm and timing?",
    answer:
      "Practice with a metronome daily at different tempos, especially slow ones. Try subdividing silently (count eighth notes in your head between beats), record yourself playing to a click, and replay this test at the Hard level - your average deviation in milliseconds is a concrete number you can track over time.",
  },
  {
    question: "Does the test work on a phone?",
    answer:
      "Yes - tap the large button with your finger. For the most precise timing use a desktop keyboard (Space or Enter), since touchscreens add a few milliseconds of input latency.",
  },
]

export default function RhythmGamePage() {
  const toolSchema = generateToolSchema({
    name: "Rhythm Test - Internal Metronome Game",
    description:
      "Tap along with a metronome, keep the beat when it goes silent, and get a timing accuracy score out of 100.",
    url: "/tools/rhythm-game",
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
            { name: "Rhythm Test", path: "/tools/rhythm-game" },
          ]}
        />
      </div>
      <RhythmGame />
      <div className="mx-auto max-w-2xl px-4 pb-12">
        <section className="prose prose-neutral dark:prose-invert max-w-none">
          <h2>What This Tests</h2>
          <p>
            Keeping time without an external reference is called{" "}
            <em>sensorimotor synchronization</em>, and it is one of the most
            studied skills in music psychology. When the metronome is audible
            you can correct each tap against what you hear; the moment it goes
            silent, you are running on your internal clock alone. The test
            measures, in milliseconds, how far each of your unaccompanied taps
            lands from the true beat - the same drift a drummer fights when the
            click drops out, or a DJ feels when riding a long blend.
          </p>
          <p>
            Your score is deliberately concrete: average deviation in
            milliseconds, per beat. That makes it a trainable number - play the
            same difficulty weekly and watch it drop.
          </p>

          <h2>Why Musicians Should Care</h2>
          <p>
            Tight internal timing is the difference between a mix that breathes
            and one that flams. Drummers audition against silent-click tests
            like this one; DJs who beatmatch by ear are doing a continuous
            version of it on every transition. If you want to work on the
            related skill of <em>reading</em> a tempo by ear, our{" "}
            <Link href="/tools/tap-tempo">tap BPM counter</Link> measures how
            steadily you tap while you find a song&apos;s tempo - and once you
            have a BPM, the <Link href="/tools/bpm-delay">delay calculator</Link>{" "}
            and <Link href="/tools/bars-to-time">bars-to-time converter</Link>{" "}
            put it to work.
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
