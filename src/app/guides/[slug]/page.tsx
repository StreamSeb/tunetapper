import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
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
          <li>
            Analyze your tracks to find their keys — DJ software can do this, or
            use our free{" "}
            <Link href="/tools/key-analyzer">online key finder</Link> to detect
            the Camelot code of any track in your browser
          </li>
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
      { href: "/tools/key-analyzer", label: "Free Key Finder" },
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
  "tap-tempo-guide": {
    content: (
      <>
        <h2>What is Tap Tempo?</h2>
        <p>
          Tap tempo is a technique for finding the BPM of a song by tapping
          along to the beat. Each tap represents one beat, and the average
          interval between taps is used to calculate beats per minute. It&apos;s
          one of the most practical skills a DJ or producer can have — especially
          when you need a quick reading without loading a track into software.
        </p>

        <h2>How to Get an Accurate BPM Reading</h2>
        <p>
          Accuracy comes down to consistency and repetition. Follow these steps:
        </p>
        <ol>
          <li>
            <strong>Find the main beat:</strong> Tap on the kick drum or the
            dominant pulse of the track, not a hi-hat or off-beat element.
          </li>
          <li>
            <strong>Tap at least 8 times:</strong> The first 2–3 taps establish
            rhythm; later taps smooth out timing variations. 4 taps is the
            minimum for a rough reading.
          </li>
          <li>
            <strong>Use your whole body:</strong> Nod your head or tap your foot
            before tapping — letting your body internalize the rhythm first
            produces more consistent results.
          </li>
          <li>
            <strong>Use a keyboard:</strong> Keyboard taps (Space bar) are more
            precise than mouse clicks due to lower physical travel time.
          </li>
          <li>
            <strong>Reset and retry if needed:</strong> If your first reading
            feels off, reset and start again. One stray tap can throw off the
            average.
          </li>
        </ol>

        <h2>When DJs Use Tap Tempo</h2>
        <h3>Finding the BPM of a vinyl record</h3>
        <p>
          Vinyl tracks often have no embedded BPM metadata. Tap tempo is the
          fastest way to find the tempo before mixing it with a digital track.
        </p>
        <h3>Verifying BPM metadata accuracy</h3>
        <p>
          Automatically detected BPM values are sometimes wrong — especially
          for tracks with half-time or double-time feels. A quick tap check
          confirms whether the metadata is accurate.
        </p>
        <h3>Live performance and improvisation</h3>
        <p>
          When responding to a crowd or an unexpected track request, tap tempo
          gives you a BPM reading in seconds without interrupting the flow.
        </p>

        <h2>When Producers Use Tap Tempo</h2>
        <p>
          In the studio, tap tempo is useful for matching a sample&apos;s
          original BPM before time-stretching, or for quickly setting a project
          tempo to match a reference track. Most DAWs have a built-in tap tempo
          button — usually mapped to the T key or a toolbar button.
        </p>

        <h2>Common Mistakes to Avoid</h2>
        <ul>
          <li>
            <strong>Tapping too few times:</strong> Two or three taps gives an
            unreliable average. Always aim for 8+.
          </li>
          <li>
            <strong>Tapping off-beat elements:</strong> Tap the kick or snare,
            not cymbals or melody.
          </li>
          <li>
            <strong>Rushing the first tap:</strong> Start tapping on beat 1 of a
            bar for the cleanest reading.
          </li>
          <li>
            <strong>Ignoring half-time tracks:</strong> Some genres (trap, lo-fi)
            run at half the perceived tempo. If your reading seems too slow,
            double it — if too fast, halve it.
          </li>
        </ul>

        <h2>Using Your BPM Reading</h2>
        <p>
          Once you have the BPM, you can calculate delay times for live
          performance effects, plan harmonic transitions using the Camelot
          system, or set your DAW project tempo before importing a sample.
        </p>
      </>
    ),
    faqs: [
      {
        question: "How accurate is tap tempo?",
        answer:
          "With 8 or more taps, tap tempo is accurate to within 1–2 BPM for most tracks. Accuracy improves the more consistent your tapping is. Using a keyboard instead of a mouse click also reduces timing errors.",
      },
      {
        question: "How many times should I tap for an accurate BPM?",
        answer:
          "A minimum of 4 taps gives a rough estimate. 8 taps is the recommended minimum for reliable accuracy. The tool automatically averages your last 8 taps to smooth out any inconsistencies.",
      },
      {
        question: "Why does my tap tempo reading seem wrong?",
        answer:
          "Common causes: tapping on a half-time or double-time element (try doubling or halving the result), too few taps (try again with more), or tapping an off-beat part of the track. Reset and tap on the main kick drum pulse.",
      },
    ],
    relatedTools: [
      { href: "/tools/tap-tempo", label: "Tap Tempo Tool" },
      { href: "/tools/bpm-delay", label: "BPM Delay Calculator" },
      { href: "/bpm", label: "BPM Reference" },
    ],
  },
  "time-signatures-explained": {
    content: (
      <>
        <h2>What is a Time Signature?</h2>
        <p>
          A time signature tells you how many beats are in each bar and what
          note value counts as one beat. It appears as a fraction at the start
          of a piece of music — for example, 4/4, 3/4, or 6/8.
        </p>
        <ul>
          <li>
            <strong>Top number:</strong> How many beats are in one bar
          </li>
          <li>
            <strong>Bottom number:</strong> Which note value equals one beat
            (4 = quarter note, 8 = eighth note)
          </li>
        </ul>
        <p>
          So 4/4 means four quarter-note beats per bar. 3/4 means three
          quarter-note beats per bar. 6/8 means six eighth-note beats per bar.
        </p>

        <h2>4/4 — The Most Common Time Signature</h2>
        <p>
          4/4 (also called &quot;common time&quot;) is used in almost all
          electronic music, pop, rock, hip-hop, and dance music. It&apos;s the
          time signature you should assume unless something tells you otherwise.
        </p>
        <p>
          In 4/4, each bar has 4 beats. The kick drum typically falls on beats 1
          and 3, and the snare on beats 2 and 4. This is the &quot;four on the
          floor&quot; pattern that defines house music.
        </p>

        <h2>3/4 — The Waltz</h2>
        <p>
          3/4 has three beats per bar, giving it a rolling, triple feel. It&apos;s
          used in waltzes, some folk music, and ballads. You count it as
          &quot;1-2-3, 1-2-3.&quot; While rare in electronic music, some
          producers use 3/4 or 6/8 to create unusual rhythmic tension.
        </p>

        <h2>6/8 — Compound Time</h2>
        <p>
          6/8 has six eighth-note beats per bar, but feels like two groups of
          three. It creates a lilting, triplet-based feel. Many R&amp;B ballads
          and Afrobeats tracks use 6/8 or compound feels derived from it.
        </p>

        <h2>Bars, Beats, and BPM</h2>
        <p>
          In 4/4 time, which is what most BPM calculators assume:
        </p>
        <ul>
          <li>1 bar = 4 beats</li>
          <li>BPM = beats per minute (quarter notes per minute)</li>
          <li>Bar duration = 4 × (60 ÷ BPM) seconds</li>
        </ul>
        <p>
          At 128 BPM: one bar = 4 × (60 ÷ 128) = 1.875 seconds. 16 bars = 30
          seconds exactly.
        </p>

        <h2>How Producers Use Time Signatures</h2>
        <h3>Structuring tracks</h3>
        <p>
          Electronic music is almost always built in 8- or 16-bar phrases. A
          typical intro might be 8 bars, a verse 16 bars, a drop 32 bars. These
          multiples of 4 are why 4/4 dominates — everything divides cleanly.
        </p>
        <h3>Odd time for tension</h3>
        <p>
          5/4, 7/8, and other irregular signatures create rhythmic unease. Tool,
          Radiohead, and some progressive electronic artists use them
          deliberately for unsettling or complex feels.
        </p>
        <h3>Half-time and double-time</h3>
        <p>
          Many genres play with perceived tempo without changing the actual BPM.
          A trap beat at 140 BPM often feels like 70 BPM because the snare falls
          on beat 3 of every two bars instead of every bar — this is half-time.
          Drum &amp; bass at 174 BPM often uses double-time hi-hats to sound
          even faster.
        </p>

        <h2>Common Section Lengths in 4/4</h2>
        <ul>
          <li><strong>4 bars:</strong> A basic musical phrase</li>
          <li><strong>8 bars:</strong> Standard intro or transition</li>
          <li><strong>16 bars:</strong> Typical verse or chorus</li>
          <li><strong>32 bars:</strong> Extended section or combined verse+chorus</li>
          <li><strong>64 bars:</strong> Full arrangement block in EDM</li>
        </ul>
      </>
    ),
    faqs: [
      {
        question: "What time signature is most electronic music in?",
        answer:
          "Almost all electronic music — house, techno, drum & bass, hip-hop, pop — uses 4/4 time. This means 4 beats per bar and is why bar calculators assume 4 beats per bar by default.",
      },
      {
        question: "How many seconds is one bar at 128 BPM?",
        answer:
          "In 4/4 time at 128 BPM, one bar lasts exactly 1.875 seconds. 16 bars = 30 seconds. 32 bars = 60 seconds (1 minute).",
      },
      {
        question: "What is the difference between 4/4 and 3/4 time?",
        answer:
          "4/4 has four beats per bar and a straight, driving feel used in most popular music. 3/4 has three beats per bar and a waltz-like, rolling feel. Most DAWs default to 4/4.",
      },
    ],
    relatedTools: [
      { href: "/tools/bars-to-time", label: "Bars to Time Calculator" },
      { href: "/bars", label: "Bars Reference" },
      { href: "/tools/bpm-delay", label: "BPM Delay Calculator" },
    ],
  },
  "sync-daw-effects-to-bpm": {
    content: (
      <>
        <h2>Why Sync Effects to BPM?</h2>
        <p>
          When effects like delay, reverb, tremolo, and LFOs are synced to your
          track&apos;s tempo, they become rhythmically musical rather than random.
          A delay that repeats every 468ms at 128 BPM lands exactly on the beat.
          An LFO sweeping once every 4 beats adds groove instead of chaos.
          Tempo-synced effects are a cornerstone of professional-sounding music.
        </p>

        <h2>Delay</h2>
        <p>
          Delay is the most commonly synced effect. Instead of setting a delay
          time in milliseconds, most DAW delay plugins let you select a note
          value (1/4, 1/8, etc.) that automatically calculates the correct ms
          value for your project BPM.
        </p>
        <ul>
          <li>
            <strong>1/4 note delay at 128 BPM:</strong> 468.75ms — classic
            rhythmic echo
          </li>
          <li>
            <strong>Dotted 1/8 delay:</strong> 351.6ms — creates a
            &quot;ping-pong&quot; shuffle feel
          </li>
          <li>
            <strong>1/8 note delay:</strong> 234.4ms — tight doubling effect
          </li>
        </ul>
        <p>
          If you need a specific millisecond value (e.g., for a hardware
          processor), use the BPM Delay Calculator to find the exact number.
        </p>

        <h2>Reverb</h2>
        <p>
          Reverb pre-delay and decay time can also be synced. A pre-delay of one
          sixteenth note (at 128 BPM ≈ 117ms) separates the dry signal from the
          wet tail, adding space without muddiness. Match your reverb decay to
          the bar length so tails resolve cleanly at phrase boundaries.
        </p>

        <h2>LFOs (Low Frequency Oscillators)</h2>
        <p>
          Most modern synthesizers and effects allow LFOs to sync to host tempo.
          Common synced LFO rates:
        </p>
        <ul>
          <li><strong>1/1 (one bar):</strong> Slow, broad sweeps — good for filter
            automation</li>
          <li><strong>1/2:</strong> Two-bar cycle — tremolo on sustained chords</li>
          <li><strong>1/4:</strong> Quarter-note wobble — classic dubstep growl
            at slow rates</li>
          <li><strong>1/8 or 1/16:</strong> Fast, rhythmic modulation — trance
            gates and chord chops</li>
        </ul>

        <h2>Sidechain and Pumping Effects</h2>
        <p>
          Sidechain compression (the &quot;pumping&quot; effect in house music)
          is triggered by the kick drum, which plays every quarter note in 4/4.
          The attack and release of the compressor should be set so the volume
          recovers before the next kick — typically attack 0–10ms, release
          100–200ms at 128 BPM.
        </p>

        <h2>DAW-Specific Tips</h2>
        <h3>Ableton Live</h3>
        <p>
          Most native effects have a &quot;Sync&quot; button that locks the
          effect rate to the project BPM. Use the &quot;Ping Pong Delay&quot; in
          sync mode for instant tempo-locked delays.
        </p>
        <h3>FL Studio</h3>
        <p>
          The Fruity Peak Controller and automation clips can be synced to tempo.
          Use &quot;Tempo sync&quot; in any plugin parameter to beat-match
          modulation.
        </p>
        <h3>Logic Pro</h3>
        <p>
          Logic&apos;s built-in delay and modulation effects all support note-value
          sync. The &quot;Tape Delay&quot; in sync mode is particularly useful
          for vintage-sounding rhythmic echoes.
        </p>

        <h2>Working with Hardware Processors</h2>
        <p>
          If your hardware delay or reverb requires a manual millisecond entry,
          calculate the value using the BPM Delay Calculator. Note values and
          their multipliers:
        </p>
        <ul>
          <li>1/4 note = 60,000 ÷ BPM</li>
          <li>1/8 note = 30,000 ÷ BPM</li>
          <li>Dotted 1/8 = 45,000 ÷ BPM</li>
          <li>1/16 note = 15,000 ÷ BPM</li>
        </ul>
      </>
    ),
    faqs: [
      {
        question: "How do I calculate delay time in milliseconds from BPM?",
        answer:
          "For a quarter note (1/4): 60,000 ÷ BPM. For an eighth note: 30,000 ÷ BPM. For a dotted eighth: 45,000 ÷ BPM. At 128 BPM, a quarter note delay = 468.75ms.",
      },
      {
        question: "What delay time is used in most house music?",
        answer:
          "House music most commonly uses a dotted eighth note delay (45,000 ÷ BPM ms) for the classic ping-pong shuffle effect, or a plain quarter note delay for straight rhythmic echoes.",
      },
      {
        question: "Should I sync reverb to BPM?",
        answer:
          "Not always, but setting your reverb pre-delay to a short note value (1/16th note) and keeping the decay time shorter than one bar helps keep reverb tails clean and rhythmically cohesive.",
      },
    ],
    relatedTools: [
      { href: "/tools/bpm-delay", label: "BPM Delay Calculator" },
      { href: "/tools/tap-tempo", label: "Tap Tempo" },
      { href: "/bpm", label: "BPM Reference" },
    ],
  },
  "beatmatching-guide": {
    content: (
      <>
        <h2>What is Beatmatching?</h2>
        <p>
          Beatmatching is the process of adjusting two tracks so their beats
          play in sync, allowing you to mix between them without a rhythmic
          clash. It&apos;s the most fundamental DJ skill — once mastered, it
          lets you create seamless transitions between any two tracks.
        </p>

        <h2>The Two Parts of Beatmatching</h2>
        <h3>1. Tempo matching</h3>
        <p>
          Both tracks need to be playing at the same BPM. Use your DJ
          software&apos;s pitch/tempo fader to speed up or slow down the
          incoming track until it matches the playing track&apos;s BPM.
        </p>
        <h3>2. Phase alignment</h3>
        <p>
          Even at the same BPM, beats can be offset — one track&apos;s kick
          drum might be landing on the off-beat relative to the other. Phase
          alignment means nudging the track so beat 1 of both tracks lands at
          the same time.
        </p>

        <h2>Beatmatching by Ear (Manual)</h2>
        <ol>
          <li>
            <strong>Cue up the incoming track</strong> in your headphones while
            the current track plays through the speakers.
          </li>
          <li>
            <strong>Find the BPM difference.</strong> If the incoming track
            sounds faster, reduce its tempo. If slower, increase it. Make small
            adjustments — most tracks are within ±5 BPM of each other in a
            well-planned set.
          </li>
          <li>
            <strong>Listen for flamming.</strong> When the tempos are close but
            not exact, you&apos;ll hear the kicks &quot;flamming&quot; — one
            slightly ahead of the other. Adjust until they sound like one hit.
          </li>
          <li>
            <strong>Nudge to align the phase.</strong> Once tempos match, give
            the platter a light push or pull to shift the phase until the beats
            snap together.
          </li>
          <li>
            <strong>Let it ride for 8 bars,</strong> then check again. If it
            drifts, the BPM isn&apos;t quite locked — make a micro-adjustment.
          </li>
        </ol>

        <h2>Beatmatching with Software (Sync)</h2>
        <p>
          Modern DJ software (Serato, Rekordbox, Traktor, Ableton) includes a
          Sync button that automatically matches tempo and phase. This is a
          useful tool, but relying on it entirely can lead to problems:
        </p>
        <ul>
          <li>
            Sync fails if the track&apos;s BPM detection was wrong (common with
            live drums and half-time tracks)
          </li>
          <li>
            You won&apos;t develop the ear training needed when things go wrong
          </li>
          <li>
            Sync doesn&apos;t handle phrase alignment — you still need to count
            bars
          </li>
        </ul>
        <p>
          Best practice: use sync as a starting point, then refine manually.
        </p>

        <h2>Phrase Alignment</h2>
        <p>
          Beatmatching gets the beats in sync. Phrase alignment gets the musical
          structure in sync. In 4/4 electronic music, tracks are built in 8 and
          16-bar phrases. If you drop the incoming track in the middle of a
          phrase, the mix will feel awkward even with perfect tempo matching.
        </p>
        <p>
          Count the bars on both tracks (1-2-3-4-5-6-7-8) and start your mix at
          the beginning of a phrase — ideally bar 1 of the incoming track
          landing with bar 1 of a new section on the outgoing track.
        </p>

        <h2>EQ Mixing During the Transition</h2>
        <p>
          Once beatmatched, a classic technique is to cut the bass of the
          incoming track while you blend it in, then gradually swap the bass
          frequencies:
        </p>
        <ol>
          <li>Fade in the incoming track with its bass fully cut</li>
          <li>Slowly cut the outgoing track&apos;s bass</li>
          <li>Bring the incoming bass fully in</li>
          <li>Fade out the outgoing track</li>
        </ol>
        <p>
          This prevents the kick drums from clashing in the low end — one of the
          most common beginner mistakes.
        </p>

        <h2>Checking BPM Quickly</h2>
        <p>
          If you&apos;re unsure of a track&apos;s BPM — especially for vinyl or
          tracks with incorrect metadata — use a tap tempo tool to find it in
          seconds before loading it into your mix.
        </p>
      </>
    ),
    faqs: [
      {
        question: "How long does it take to learn beatmatching?",
        answer:
          "Most people can learn basic beatmatching in a few weeks of consistent practice. Getting it reliably fast (within seconds) takes months. Start by practicing with two copies of the same track — it removes the BPM variable so you can focus purely on phase alignment.",
      },
      {
        question: "Should I use sync or beatmatch manually?",
        answer:
          "Learn to beatmatch manually first so you understand what's happening. Once you have the skill, using sync for tempo and correcting manually when needed is a perfectly valid workflow. Many professional DJs use both.",
      },
      {
        question: "What is the difference between beatmatching and phrase matching?",
        answer:
          "Beatmatching syncs the tempo and phase so individual beats align. Phrase matching ensures the musical structure aligns — dropping a track at bar 1 of a new section rather than mid-phrase. Both are needed for smooth, musical transitions.",
      },
    ],
    relatedTools: [
      { href: "/tools/tap-tempo", label: "Tap Tempo — Find Track BPM" },
      { href: "/tools/bpm-transition", label: "BPM Transition Helper" },
      { href: "/tools/camelot", label: "Camelot Wheel — Harmonic Mixing" },
    ],
  },
  "key-detection-software": {
    content: (
      <>
        <h2>Why Key Detection Matters for DJs</h2>
        <p>
          Mixing tracks in clashing keys creates dissonance — even when the
          tempo is perfectly matched, something will sound &quot;off.&quot; Key
          detection software analyses the harmonic content of a track and
          returns either a standard musical key (e.g., A minor) or a Camelot
          Wheel code (e.g., 8A). With this information you can plan harmonic
          transitions that sound smooth and intentional.
        </p>

        <h2>How Key Detection Works</h2>
        <p>
          Key detection algorithms analyse the pitch content of an audio file
          and compare it against key profiles — mathematical models of how
          notes are distributed in each major and minor key. The algorithm
          returns the best-matching key, typically with a confidence score.
        </p>
        <p>
          Most tools are accurate for melodically clear tracks (house, trance,
          pop). Tracks with heavy distortion, noise, or atonal content are
          harder to detect accurately.
        </p>

        <h2>Key Detection Tools</h2>
        <h3>TuneTapper Key Finder (free, no upload)</h3>
        <p>
          If you just need the key of a single track without installing
          anything, our{" "}
          <Link href="/tools/key-analyzer">free online Key Finder</Link> detects
          the musical key and Camelot code straight from an audio file. It runs
          entirely in your browser using the Web Audio API and the
          Krumhansl-Schmuckler algorithm — your file is never uploaded to a
          server, there is no account, and it is completely free. It is the
          fastest option when you want to check one or two tracks rather than
          batch-tag a whole library.
        </p>
        <h3>Mixed In Key</h3>
        <p>
          The industry standard for DJs. Mixed In Key analyses your audio files
          and writes Camelot Wheel codes directly into the track&apos;s metadata
          (ID3 tags), which then appear in Serato, Rekordbox, Traktor, and other
          software. It also detects energy levels and cue points. Paid software,
          widely considered the most accurate for electronic music.
        </p>
        <h3>Rekordbox (Pioneer)</h3>
        <p>
          Pioneer&apos;s DJ software includes built-in key analysis that displays
          Camelot codes in the library. The detection is reliable for most
          electronic music. Key display can be toggled between Open Key notation
          and Camelot notation in settings.
        </p>
        <h3>Serato DJ</h3>
        <p>
          Serato includes key detection in its library analysis. Results appear
          in the Key column and can be displayed in either musical notation or
          Camelot notation. Accuracy is generally good for produced electronic
          music.
        </p>
        <h3>Traktor (Native Instruments)</h3>
        <p>
          Traktor analyses key during track import. Keys are shown in musical
          notation by default but can be configured to show Camelot codes via a
          community workaround or third-party tool.
        </p>
        <h3>KeyFinder (free)</h3>
        <p>
          An open-source key detection tool that analyses audio files in bulk.
          Accurate and completely free — a good choice for producers who want
          to tag large libraries without paying for Mixed In Key.
        </p>

        <h2>Understanding the Results</h2>
        <p>
          Key detection software typically returns one of two formats:
        </p>
        <ul>
          <li>
            <strong>Musical notation:</strong> e.g., &quot;Am&quot; (A minor),
            &quot;C&quot; (C major)
          </li>
          <li>
            <strong>Camelot notation:</strong> e.g., &quot;8A&quot; (A minor),
            &quot;5B&quot; (C major)
          </li>
        </ul>
        <p>
          The Camelot system is preferred by most DJs because compatible keys
          are immediately obvious — adjacent numbers mix well. Use the Camelot
          Wheel tool to look up compatible keys from any detected key.
        </p>

        <h2>When Key Detection Gets It Wrong</h2>
        <p>
          No algorithm is perfect. Common cases where detection fails:
        </p>
        <ul>
          <li>
            <strong>Modulating tracks:</strong> Tracks that change key during
            the song — the result will reflect the dominant key, which may not
            be what&apos;s playing at the mix point.
          </li>
          <li>
            <strong>Relative major/minor confusion:</strong> A minor and C major
            share the same notes. Some tools will detect one when a DJ might
            hear the other.
          </li>
          <li>
            <strong>Atonal or heavily processed tracks:</strong> Noise music,
            industrial, and some experimental tracks have no clear tonal centre.
          </li>
        </ul>
        <p>
          Always trust your ears over the algorithm. If a mix sounds wrong
          despite matching Camelot codes, try the relative major/minor (A↔B at
          the same number) or an adjacent key.
        </p>

        <h2>Building a Harmonically Tagged Library</h2>
        <p>
          The most efficient workflow is to run key detection on your entire
          library once, then sort and filter by Camelot key when planning sets.
          Most DJ software lets you filter the library by key column, making it
          easy to find tracks that will mix harmonically with what&apos;s currently
          playing.
        </p>
      </>
    ),
    faqs: [
      {
        question: "What is the most accurate key detection software for DJs?",
        answer:
          "Mixed In Key is widely considered the most accurate paid option for electronic music. For free alternatives, KeyFinder provides reliable results for most genres. Built-in detection in Rekordbox and Serato is accurate enough for most library management purposes.",
      },
      {
        question: "What is the difference between Camelot notation and musical key notation?",
        answer:
          "Musical notation uses standard key names (e.g., A minor, C major). Camelot notation assigns each key a number and letter (e.g., 8A, 5B) that makes compatible keys immediately obvious — adjacent numbers on the Camelot Wheel will mix harmonically.",
      },
      {
        question: "Can I find the key of a song without software?",
        answer:
          "Yes. By ear, hum along to the track to find the root note on an instrument, then decide major or minor from the scale and mood — good ear training, but it takes practice. For an instant answer, a free in-browser key finder like TuneTapper's analyses the audio file directly on your device (no upload, no install) and returns the musical key plus its Camelot code.",
      },
    ],
    relatedTools: [
      { href: "/tools/key-analyzer", label: "Free Key Finder" },
      { href: "/tools/camelot", label: "Camelot Wheel Calculator" },
      { href: "/camelot", label: "All Camelot Keys" },
      { href: "/guides/camelot-wheel-guide", label: "Camelot Wheel Guide" },
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
        <Breadcrumbs items={[{ name: "Guides", path: "/guides" }, { name: guide.title, path: `/guides/${slug}` }]} />
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
