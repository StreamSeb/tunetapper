import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import guidesData from "@/data/guides.json"
import { generateMetadata as genMeta, generateFaqSchema } from "@/lib/seo"

interface Props {
  params: Promise<{ slug: string }>
}

const guideContent: Record<
  string,
  {
    content: React.ReactNode
    faqs: { question: string; answer: string }[]
    relatedTools: { href: string; label: string }[]
  }
> = {
  "delay-times-explained": {
    content: (
      <>
        <h2>What Are Delay Times?</h2>
        <p>
          Delay is an audio effect that records a signal and plays it back after
          a set period of time. When that time is synchronized to your
          track&apos;s tempo, the echoes become rhythmic and musical rather than
          random.
        </p>

        <h2>Understanding Note Values</h2>
        <p>
          Delay times are typically expressed as note values relative to your
          tempo:
        </p>
        <ul>
          <li>
            <strong>1/1 (Whole Note):</strong> 4 beats - creates long, spacious
            echoes
          </li>
          <li>
            <strong>1/2 (Half Note):</strong> 2 beats - rhythmic but still
            relaxed
          </li>
          <li>
            <strong>1/4 (Quarter Note):</strong> 1 beat - the most common delay
            time
          </li>
          <li>
            <strong>1/8 (Eighth Note):</strong> Half a beat - creates tighter
            rhythmic patterns
          </li>
          <li>
            <strong>1/16 (Sixteenth Note):</strong> Quarter beat - rapid echoes
            for texture
          </li>
          <li>
            <strong>1/32 (Thirty-second Note):</strong> Very short - creates
            thickening effects
          </li>
        </ul>

        <h2>Dotted and Triplet Variations</h2>
        <p>Beyond standard note values, two variations add rhythmic interest:</p>
        <h3>Dotted Notes (1.5x)</h3>
        <p>
          A dotted note is 1.5 times the length of the regular note. This creates
          a &quot;ping-pong&quot; or shuffle feel that&apos;s popular in many
          genres. Dotted eighth notes (dotted 1/8) are particularly common in
          rock and country music.
        </p>
        <h3>Triplet Notes (2/3x)</h3>
        <p>
          Triplet notes divide the beat into three equal parts instead of two.
          This creates a swinging, waltz-like feel. Triplet delays work well in
          6/8 time signatures or when you want a more fluid, organic echo.
        </p>

        <h2>Practical Tips for Using Delays</h2>
        <h3>1. Match the Genre</h3>
        <ul>
          <li>
            EDM/Dance: 1/4 or 1/8 note delays for rhythmic precision
          </li>
          <li>
            Ambient/Chill: Longer delays (1/2 or 1/1) for spaciousness
          </li>
          <li>
            Rock/Pop: Dotted 1/8 for the classic slapback effect
          </li>
        </ul>

        <h3>2. Use Feedback Wisely</h3>
        <p>
          Feedback controls how many times the delay repeats. Low feedback (1-3
          repeats) keeps things clean, while high feedback creates evolving
          textures but can muddy the mix.
        </p>

        <h3>3. Filter the Delays</h3>
        <p>
          Many producers filter the delayed signal (cutting highs and lows) to
          keep echoes from competing with the dry signal. This creates a more
          &quot;vintage&quot; delay sound.
        </p>

        <h2>The Formula</h2>
        <p>If you ever need to calculate manually:</p>
        <pre>
          Delay (ms) = (60,000 ÷ BPM) × Note Multiplier
        </pre>
        <p>Where Note Multiplier is:</p>
        <ul>
          <li>1/1 = 4</li>
          <li>1/2 = 2</li>
          <li>1/4 = 1</li>
          <li>1/8 = 0.5</li>
          <li>1/16 = 0.25</li>
        </ul>
        <p>
          For dotted notes, multiply by 1.5. For triplets, multiply by 2/3.
        </p>
      </>
    ),
    faqs: [
      {
        question: "What is a sync'd delay?",
        answer:
          "A sync'd delay is a delay effect where the delay time is set to match your project's tempo, creating rhythmic echoes that align with the beat.",
      },
      {
        question: "What's the difference between dotted and triplet delays?",
        answer:
          "Dotted delays are 1.5x the normal note length, creating a shuffle feel. Triplet delays are 2/3 the normal length, creating a swinging, three-beat feel.",
      },
      {
        question: "How do I calculate delay time for my BPM?",
        answer:
          "Use the formula: (60,000 ÷ BPM) × note multiplier. For a 1/4 note at 128 BPM: 60,000 ÷ 128 = 468.75ms.",
      },
    ],
    relatedTools: [
      { href: "/tools/bpm-delay", label: "BPM Delay Calculator" },
      { href: "/tools/tap-tempo", label: "Tap Tempo" },
      { href: "/bpm", label: "BPM Reference" },
    ],
  },
  "camelot-wheel-guide": {
    content: (
      <>
        <h2>What is the Camelot Wheel?</h2>
        <p>
          The Camelot Wheel is a visual tool designed to help DJs mix tracks
          harmonically. Created by Mark Davis of Mixed In Key, it simplifies
          music theory by replacing traditional key names with a numbered system.
        </p>
        <p>
          The wheel arranges all 24 musical keys in a circle, with harmonically
          compatible keys positioned adjacent to each other. This makes it easy
          to see at a glance which keys will mix well together.
        </p>

        <h2>How to Read the Camelot Wheel</h2>
        <p>Each key is represented by a number (1-12) and a letter (A or B):</p>
        <ul>
          <li>
            <strong>Numbers (1-12):</strong> Position on the wheel, representing
            the key&apos;s tonal center
          </li>
          <li>
            <strong>Letter A:</strong> Minor keys (darker, more melancholic)
          </li>
          <li>
            <strong>Letter B:</strong> Major keys (brighter, more uplifting)
          </li>
        </ul>

        <h2>Compatible Key Combinations</h2>
        <h3>Perfect Match (Same Number)</h3>
        <p>
          Keys with the same number are either the same key or relative
          major/minor pairs. These create the smoothest transitions.
        </p>
        <p>Example: 8A (Am) and 8B (C) share the same notes and blend
          perfectly.</p>

        <h3>Adjacent Keys (+1 or -1)</h3>
        <p>
          Moving up or down one number creates a subtle energy shift while
          maintaining harmonic compatibility. This is the most common DJ
          technique.
        </p>
        <p>Example: 8A → 9A moves the energy up slightly.</p>

        <h3>Major/Minor Switch (A ↔ B)</h3>
        <p>
          Switching between A and B at the same number changes the mood without
          changing the tonal center.
        </p>
        <p>
          Example: 8A (Am, minor) → 8B (C, major) shifts from dark to bright.
        </p>

        <h3>Energy Boost (+2)</h3>
        <p>
          Jumping two numbers creates a more dramatic shift that still sounds
          musical. Use this for building energy or creating contrast.
        </p>

        <h2>Practical DJ Workflow</h2>
        <ol>
          <li>Analyze your tracks using DJ software (most can detect Camelot keys)</li>
          <li>Sort your crates/playlists by Camelot key</li>
          <li>Plan your sets to move smoothly around the wheel</li>
          <li>Use the +1/-1 technique for seamless transitions</li>
          <li>Save dramatic jumps (+2 or more) for intentional energy shifts</li>
        </ol>

        <h2>Beyond Basic Mixing</h2>
        <h3>Creating Energy Flows</h3>
        <p>
          Moving consistently in one direction (always +1 or always -1) creates a
          steady energy progression throughout your set.
        </p>

        <h3>Key Changes for Impact</h3>
        <p>
          Save incompatible key changes for drops or dramatic moments where the
          contrast is intentional and impactful.
        </p>
      </>
    ),
    faqs: [
      {
        question: "What is the Camelot Wheel used for?",
        answer:
          "The Camelot Wheel is used by DJs to identify which songs can be mixed together harmonically. Keys that are adjacent on the wheel will sound good when mixed.",
      },
      {
        question: "What does the A and B mean in Camelot?",
        answer:
          "A represents minor keys (darker mood) and B represents major keys (brighter mood). Keys with the same number but different letters are relative major/minor pairs.",
      },
      {
        question: "Can I mix keys that aren't compatible on the Camelot Wheel?",
        answer:
          "Yes, but it requires more skill. Use breakdowns, effects, or quick cuts to mask the key clash. Some DJs intentionally use key clashes for dramatic effect.",
      },
    ],
    relatedTools: [
      { href: "/tools/camelot", label: "Camelot Wheel Tool" },
      { href: "/camelot", label: "All Camelot Keys" },
      { href: "/tools/bpm-transition", label: "BPM Transition Helper" },
    ],
  },
  "bpm-genres": {
    content: (
      <>
        <h2>Understanding BPM in Different Genres</h2>
        <p>
          Every music genre has characteristic tempo ranges that define its feel
          and energy. Understanding these ranges helps producers create authentic
          tracks and helps DJs plan smooth transitions between genres.
        </p>

        <h2>Electronic Music</h2>
        <h3>Ambient / Downtempo (60-90 BPM)</h3>
        <p>
          Relaxed, atmospheric music designed for listening rather than dancing.
          Often used in chillout rooms and meditation.
        </p>

        <h3>Deep House / Tech House (115-125 BPM)</h3>
        <p>
          Smooth, groovy house music with emphasis on bass and subtle rhythms.
          The most common tempo range for underground club music.
        </p>

        <h3>House / Progressive House (120-130 BPM)</h3>
        <p>
          The classic four-on-the-floor beat. 128 BPM is particularly common and
          often called &quot;the house music sweet spot.&quot;
        </p>

        <h3>Techno (125-145 BPM)</h3>
        <p>
          Harder, more driving beats than house. Berlin-style techno often sits
          around 130-140 BPM.
        </p>

        <h3>Trance / Psytrance (130-150 BPM)</h3>
        <p>
          Euphoric, melodic electronic music. Psytrance typically runs faster at
          140-150 BPM.
        </p>

        <h3>Drum & Bass (160-180 BPM)</h3>
        <p>
          High-energy breakbeats with heavy bass. 174 BPM is particularly common.
        </p>

        <h2>Hip-Hop and R&B</h2>
        <h3>Classic Hip-Hop (85-95 BPM)</h3>
        <p>
          The boom-bap sound of 90s hip-hop. Provides space for complex lyrics.
        </p>

        <h3>Trap (60-75 BPM, half-time feel)</h3>
        <p>
          Modern trap often uses slow tempos with half-time hi-hats, creating an
          intense, heavy feeling.
        </p>

        <h3>R&B / Neo-Soul (65-85 BPM)</h3>
        <p>
          Smooth, laid-back grooves designed for listening and slow dancing.
        </p>

        <h2>Other Genres</h2>
        <h3>Pop (100-130 BPM)</h3>
        <p>
          Modern pop ranges widely but often sits around 120 BPM for radio
          friendliness.
        </p>

        <h3>Rock (110-140 BPM)</h3>
        <p>
          Varies widely by subgenre. Punk rock runs faster (140+), while classic
          rock often sits around 120.
        </p>

        <h3>Reggae / Dub (60-90 BPM)</h3>
        <p>
          Relaxed, offbeat rhythms with emphasis on the &quot;and&quot; beats.
        </p>

        <h2>Tips for Producers</h2>
        <ul>
          <li>Start with genre-typical tempos, then adjust for your style</li>
          <li>Consider half-time or double-time relationships for versatility</li>
          <li>Faster isn&apos;t always more energetic - groove matters more than speed</li>
          <li>Leave some flexibility - not every track needs to be exactly 128 BPM</li>
        </ul>
      </>
    ),
    faqs: [
      {
        question: "What BPM is house music?",
        answer:
          "House music typically ranges from 120-130 BPM, with 128 BPM being the most common tempo for mainstream house and EDM.",
      },
      {
        question: "What BPM is hip-hop?",
        answer:
          "Hip-hop ranges from 60-95 BPM. Classic boom-bap is around 85-95 BPM, while modern trap often uses 60-75 BPM with half-time hi-hats.",
      },
      {
        question: "What is the fastest EDM genre?",
        answer:
          "Drum & Bass is one of the fastest mainstream EDM genres at 160-180 BPM. Speedcore and related genres can exceed 300 BPM.",
      },
    ],
    relatedTools: [
      { href: "/tools/tap-tempo", label: "Tap Tempo" },
      { href: "/bpm", label: "BPM Reference" },
      { href: "/tools/bpm-delay", label: "BPM Delay Calculator" },
    ],
  },
}

export async function generateStaticParams() {
  return guidesData.guides.map((guide) => ({
    slug: guide.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = guidesData.guides.find((g) => g.slug === slug)
  if (!guide) {
    return { title: "Guide Not Found" }
  }
  return genMeta({
    title: guide.title,
    description: guide.description,
    path: `/guides/${slug}`,
  })
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const guide = guidesData.guides.find((g) => g.slug === slug)

  if (!guide || !guideContent[slug]) {
    notFound()
  }

  const { content, faqs, relatedTools } = guideContent[slug]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFaqSchema(faqs)),
        }}
      />
      <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-2">
            {guide.category}
          </Badge>
          <h1 className="text-3xl font-bold lg:text-4xl">{guide.title}</h1>
          <p className="mt-3 text-lg text-[var(--muted-foreground)]">
            {guide.description}
          </p>
        </div>

        {/* Content */}
        <article className="prose prose-neutral dark:prose-invert max-w-none mb-12">
          {content}
        </article>

        {/* FAQ */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i}>
                <h3 className="font-semibold">{faq.question}</h3>
                <p className="text-[var(--muted-foreground)] mt-1">
                  {faq.answer}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Related Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Related Tools</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {relatedTools.map((tool) => (
              <Button key={tool.href} variant="outline" asChild>
                <Link href={tool.href}>{tool.label}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
