"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { Upload, Music, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CAMELOT_KEYS } from "@/lib/camelot"

// Temperley (2007) key profiles — better major/minor distinction for pop/EDM.
// The minor-third weight (4.5) vs major-third weight (2.0) gives a much sharper
// mode contrast than the original Krumhansl-Schmuckler profiles.
const MAJOR_PROFILE = [5.0, 2.0, 3.5, 2.0, 4.5, 4.0, 2.0, 4.5, 2.0, 3.5, 1.5, 4.0]
const MINOR_PROFILE = [5.0, 2.0, 3.5, 4.5, 2.0, 4.0, 2.0, 4.5, 3.5, 2.0, 1.5, 4.0]

// Note names matching CAMELOT_KEYS[].musical exactly (C = semitone 0)
const MAJOR_NAMES = ["C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭", "A", "B♭", "B"]
const MINOR_NAMES = ["Cm", "D♭m", "Dm", "E♭m", "Em", "Fm", "F♯m", "Gm", "A♭m", "Am", "B♭m", "Bm"]

interface AnalysisResult {
  bpm: number
  musicalKey: string
  camelotCode: string
  camelotSlug: string
}

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length
  const meanX = x.reduce((a, b) => a + b, 0) / n
  const meanY = y.reduce((a, b) => a + b, 0) / n
  let num = 0, dx2 = 0, dy2 = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY
    num += dx * dy
    dx2 += dx * dx
    dy2 += dy * dy
  }
  const denom = Math.sqrt(dx2 * dy2)
  return denom === 0 ? 0 : num / denom
}

function detectKey(chroma: number[]): string {
  let bestCorr = -Infinity
  let bestName = "C"
  for (let i = 0; i < 12; i++) {
    // Rotate so that MAJOR_PROFILE[0] (root weight) aligns with chroma[i] (the candidate tonic)
    const rot = 12 - i
    const rotMajor = [...MAJOR_PROFILE.slice(rot), ...MAJOR_PROFILE.slice(0, rot)]
    const rotMinor = [...MINOR_PROFILE.slice(rot), ...MINOR_PROFILE.slice(0, rot)]
    const corrMajor = pearsonCorrelation(chroma, rotMajor)
    const corrMinor = pearsonCorrelation(chroma, rotMinor)
    if (corrMajor > bestCorr) { bestCorr = corrMajor; bestName = MAJOR_NAMES[i] }
    if (corrMinor > bestCorr) { bestCorr = corrMinor; bestName = MINOR_NAMES[i] }
  }
  return bestName
}

// Chroma extraction using Harmonic-Percussive Source Separation (HPSS)
// with per-octave chroma normalisation.
//
// HPSS works by median-filtering the spectrogram along the time axis
// (extracts sustained "harmonic" content like bass, pads, chords) and
// along the frequency axis (extracts transient "percussive" content like
// kick and snare). A soft mask M_h = P_h/(P_h+P_p) suppresses transient
// kick harmonics before summing bins into pitch classes.
//
// Key design decisions vs a naïve chromagram:
//  • 50% frame overlap (HOP_SIZE = FRAME_SIZE/2) — at 21.5 fps a 1/8-note
//    bass note at 128 BPM (~234 ms) spans ~5 frames, enough for L_HARM=9
//    to classify it as "harmonic" rather than "percussive".
//  • Dense frames, no subsampling — HPSS requires consecutive frames; if we
//    skip every 12th frame the time-axis median sees 12-second gaps and
//    classifies every note as percussive.
//  • Per-octave normalisation — each octave's chromagram is normalised to
//    a unit-sum vector before averaging. This prevents loud mid-range pads
//    (octaves 4-5) from drowning out the quieter bass (octaves 2-3) that
//    carries the crucial major/minor third information.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function computeChromaHPSS(mono: Float32Array, sampleRate: number, Meyda: any): number[] {
  const FRAME_SIZE = 4096
  const HOP_SIZE  = 2048          // 50% overlap → ~21.5 fps at 44100 Hz
  const MAX_FRAMES = 750          // analyse first ~35 s — sufficient for key detection
  const L_HARM = 9               // time-axis median kernel: sustains ≥ ~0.19 s are "harmonic"
  const L_PERC = 17              // freq-axis median kernel (bins)
  const halfH = (L_HARM - 1) >> 1
  const halfP = (L_PERC - 1) >> 1

  // ~40 Hz (E1) to 2100 Hz — covers bass fundamentals and full tonal range
  const BIN_LO = Math.max(1, Math.floor(40 * FRAME_SIZE / sampleRate))
  const BIN_HI = Math.min(FRAME_SIZE / 2 - 1, Math.ceil(2100 * FRAME_SIZE / sampleRate))
  const N_USED = BIN_HI - BIN_LO + 1

  const totalHops = Math.floor((mono.length - FRAME_SIZE) / HOP_SIZE) + 1
  const numFrames = Math.min(totalHops, MAX_FRAMES)
  if (numFrames === 0) return new Array(12).fill(1 / 12)

  // Map each analysis bin → pitch class (0=C…11=B) and octave (1=C1-B1, 2=C2-B2…)
  const binToPC  = new Int8Array(N_USED).fill(-1)
  const binToOct = new Int8Array(N_USED).fill(-1)
  for (let i = 0; i < N_USED; i++) {
    const freq = (i + BIN_LO) * sampleRate / FRAME_SIZE
    const midi  = Math.round(69 + 12 * Math.log2(freq / 440))
    binToPC[i]  = ((midi % 12) + 12) % 12
    binToOct[i] = Math.floor(midi / 12) - 1   // C0-B0 → oct 0; C1-B1 → oct 1; …
  }

  // ── Step 1: Power spectrogram ──────────────────────────────────────────
  Meyda.bufferSize = FRAME_SIZE
  Meyda.sampleRate = sampleRate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(Meyda as any).chromaFilterBank = undefined

  const spectrogram = new Float32Array(numFrames * N_USED)
  const rmsValues   = new Float32Array(numFrames)

  for (let i = 0; i < numFrames; i++) {
    const start = i * HOP_SIZE
    const frame = mono.slice(start, start + FRAME_SIZE)
    let rms = 0
    for (let j = 0; j < FRAME_SIZE; j++) rms += frame[j] * frame[j]
    rmsValues[i] = Math.sqrt(rms / FRAME_SIZE)
    const ampSpec = Meyda.extract("amplitudeSpectrum", frame) as Float32Array | null
    if (ampSpec) {
      for (let j = 0; j < N_USED; j++) {
        const v = ampSpec[j + BIN_LO]
        spectrogram[i * N_USED + j] = v * v
      }
    }
  }

  // ── Step 2: HPSS ──────────────────────────────────────────────────────
  const harmPower = new Float32Array(numFrames * N_USED)
  const percPower = new Float32Array(numFrames * N_USED)
  const scratch   = new Array<number>(Math.max(L_HARM, L_PERC))

  // Harmonic: median along time axis (horizontal = sustained = tonal)
  for (let j = 0; j < N_USED; j++) {
    for (let t = 0; t < numFrames; t++) {
      const t0 = Math.max(0, t - halfH), t1 = Math.min(numFrames - 1, t + halfH)
      let len = 0
      for (let k = t0; k <= t1; k++) scratch[len++] = spectrogram[k * N_USED + j]
      for (let a = 1; a < len; a++) {
        const key = scratch[a]; let b = a - 1
        while (b >= 0 && scratch[b] > key) { scratch[b + 1] = scratch[b]; b-- }
        scratch[b + 1] = key
      }
      harmPower[t * N_USED + j] = scratch[len >> 1]
    }
  }

  // Percussive: median along frequency axis (vertical = transient)
  for (let t = 0; t < numFrames; t++) {
    for (let j = 0; j < N_USED; j++) {
      const j0 = Math.max(0, j - halfP), j1 = Math.min(N_USED - 1, j + halfP)
      let len = 0
      for (let k = j0; k <= j1; k++) scratch[len++] = spectrogram[t * N_USED + k]
      for (let a = 1; a < len; a++) {
        const key = scratch[a]; let b = a - 1
        while (b >= 0 && scratch[b] > key) { scratch[b + 1] = scratch[b]; b-- }
        scratch[b + 1] = key
      }
      percPower[t * N_USED + j] = scratch[len >> 1]
    }
  }

  // ── Step 3: Per-octave chroma accumulation ────────────────────────────
  // Normalise each octave's chromagram to a unit-sum vector, then average.
  // This equalises the influence of quiet bass octaves vs loud pad octaves.
  const MIN_OCT = 1, MAX_OCT = 6
  const NUM_OCT = MAX_OCT - MIN_OCT + 1
  const chromaPerOct = Array.from({ length: NUM_OCT }, () => new Float64Array(12))
  const weightPerOct = new Float64Array(NUM_OCT)

  for (let t = 0; t < numFrames; t++) {
    if (rmsValues[t] < 0.001) continue
    for (let j = 0; j < N_USED; j++) {
      const pc  = binToPC[j]
      if (pc < 0) continue
      const oct = binToOct[j]
      if (oct < MIN_OCT || oct > MAX_OCT) continue
      const oi  = oct - MIN_OCT
      const ph  = harmPower[t * N_USED + j]
      const pp  = percPower[t * N_USED + j]
      const maskedPower = spectrogram[t * N_USED + j] * (ph / (ph + pp + 1e-10))
      chromaPerOct[oi][pc] += maskedPower
      weightPerOct[oi]     += maskedPower
    }
  }

  // Average the per-octave unit-sum vectors into a single chromagram
  const chroma = new Array(12).fill(0)
  let octavesUsed = 0
  for (let oi = 0; oi < NUM_OCT; oi++) {
    const w = weightPerOct[oi]
    if (w < 1e-10) continue
    for (let pc = 0; pc < 12; pc++) chroma[pc] += chromaPerOct[oi][pc] / w
    octavesUsed++
  }

  if (octavesUsed === 0) return new Array(12).fill(1 / 12)
  const total = chroma.reduce((a, b) => a + b, 0)
  return total > 0 ? chroma.map(v => v / total) : new Array(12).fill(1 / 12)
}

async function analyzeFile(file: File): Promise<AnalysisResult> {
  // Dynamic imports so these browser-only modules never run on the server
  const { analyze: analyzeBPM } = await import("web-audio-beat-detector")
  const { default: Meyda } = await import("meyda")

  const arrayBuffer = await file.arrayBuffer()
  const audioCtx = new AudioContext()

  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)

    // BPM detection
    const bpm = await analyzeBPM(audioBuffer)

    // Mix down to mono
    const { sampleRate } = audioBuffer
    const numChannels = audioBuffer.numberOfChannels
    const length = audioBuffer.length
    const mono = new Float32Array(length)
    for (let c = 0; c < numChannels; c++) {
      const channel = audioBuffer.getChannelData(c)
      for (let i = 0; i < length; i++) mono[i] += channel[i] / numChannels
    }

    const chroma = computeChromaHPSS(mono, sampleRate, Meyda)

    const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"]
    const cd = Object.fromEntries(NOTE_NAMES.map((n, i) => [n, +chroma[i].toFixed(4)]))
    console.log("Chroma (post-HPSS):", cd)
    console.log("Ranked:", [...NOTE_NAMES].sort((a,b) => cd[b]-cd[a]).map(n=>`${n}=${cd[n]}`).join(", "))

    const musicalKey = detectKey(chroma)

    const camelotEntry = CAMELOT_KEYS.find((k) => k.musical === musicalKey)
    const camelotCode = camelotEntry?.camelot ?? "?"
    const camelotSlug = camelotCode.toLowerCase()

    return { bpm: Math.round(bpm), musicalKey, camelotCode, camelotSlug }
  } finally {
    await audioCtx.close()
  }
}

export function AudioAnalyzerTool() {
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isLargeFile = file ? file.size > 25 * 1024 * 1024 : false

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    setFile(selected)
    setResult(null)
    setError(null)
    setStatus("idle")
  }

  const handleAnalyze = async () => {
    if (!file) return
    setStatus("loading")
    setError(null)
    try {
      const res = await analyzeFile(file)
      setResult(res)
      setStatus("done")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Analysis failed. Try a different file."
      )
      setStatus("error")
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold lg:text-4xl">
          Audio BPM & Key Analyzer
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Upload an audio file to detect its BPM and musical key — analyzed
          entirely in your browser. No files are sent to any server.
        </p>
      </div>

      {/* Upload Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Audio File</CardTitle>
          <CardDescription>
            Supports MP3, WAV, OGG, AAC, FLAC — any format your browser can
            decode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="cursor-pointer rounded-lg border-2 border-dashed border-[var(--border)] p-8 text-center transition-colors hover:border-[var(--primary)]"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mx-auto mb-3 h-8 w-8 text-[var(--muted-foreground)]" />
            <p className="text-sm text-[var(--muted-foreground)]">
              {file ? file.name : "Click to choose a file"}
            </p>
            {file && (
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {isLargeFile && (
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Large file (&gt;25 MB) — analysis may take a while.</span>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={!file || status === "loading"}
            className="w-full"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing&hellip;
              </>
            ) : (
              <>
                <Music className="mr-2 h-4 w-4" />
                Analyze
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error state */}
      {status === "error" && error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {status === "done" && result && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            {file && (
              <CardDescription>{file.name}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* BPM */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-[var(--muted-foreground)]">
                  Tempo
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">{result.bpm}</span>
                  <span className="text-xl text-[var(--muted-foreground)]">
                    BPM
                  </span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/bpm/${result.bpm}`}>
                    View {result.bpm} BPM reference
                  </Link>
                </Button>
              </div>

              {/* Key */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-[var(--muted-foreground)]">
                  Key
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-bold">{result.musicalKey}</span>
                  <Badge variant="secondary" className="px-3 py-1 text-lg">
                    {result.camelotCode}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/camelot/${result.camelotSlug}`}>
                    Find compatible keys for {result.camelotCode}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Explainer */}
      <section className="mt-8 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How It Works</h2>
        <p>
          Your audio file is decoded entirely in your browser using the Web
          Audio API — nothing is sent to a server.
        </p>
        <ul>
          <li>
            <strong>BPM detection</strong> uses onset detection and
            autocorrelation to find the rhythmic pulse of the track.
          </li>
          <li>
            <strong>Key detection</strong> extracts chroma features — the energy
            distribution across the 12 musical pitch classes — then correlates
            the averaged chromagram against the Krumhansl-Schmuckler key
            profiles (major and minor) to find the best match.
          </li>
          <li>
            <strong>Camelot notation</strong> maps the detected key to its
            position on the Camelot Wheel so you can instantly find harmonically
            compatible tracks.
          </li>
        </ul>
        <p>
          Accuracy is best on tracks with clear rhythmic patterns and tonal
          content. Very complex or atonal music may produce less reliable key
          detection.
        </p>
      </section>
    </div>
  )
}
