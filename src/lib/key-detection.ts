/**
 * Client-side musical key detection using the Krumhansl-Schmuckler algorithm.
 *
 * Pipeline:
 *  1. Decode audio via Web Audio API
 *  2. Mix to mono + decimate to ~11 kHz
 *  3. Skip the intro (25% of track) to land in the main section
 *  4. Compute chromagram via overlapping FFT windows (120 s window)
 *  5. Correlate chroma against major/minor key profiles (Pearson r)
 *  6. Return best matching key in standard + Camelot notation
 *
 * Runs entirely in the browser — no server requests, no WASM dependencies.
 */

// Key profiles — Krumhansl & Schmuckler (1990)
// Index 0 = C, 1 = C#/D♭, ..., 11 = B
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

// Pitch class names (sharps)
const PITCH_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

// Display names that follow music convention (flats where standard)
const MAJOR_DISPLAY = ["C", "D♭", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"]
const MINOR_DISPLAY = ["Cm", "C♯m", "Dm", "E♭m", "Em", "Fm", "F♯m", "Gm", "A♭m", "Am", "B♭m", "Bm"]

// Camelot codes indexed by pitch class (0=C … 11=B)
const MAJOR_TO_CAMELOT = ["8B", "3B", "10B", "5B", "12B", "7B", "2B", "9B", "4B", "11B", "6B", "1B"]
const MINOR_TO_CAMELOT = ["5A", "12A", "7A", "2A", "9A", "4A", "11A", "6A", "1A", "8A", "3A", "10A"]

export interface KeyResult {
  /** Pitch name using sharps, e.g. "A#" */
  key: string
  scale: "major" | "minor"
  /** Camelot wheel code, e.g. "8A" */
  camelot: string
  /** Display-friendly name, e.g. "Am" or "B♭" */
  musicalName: string
  /** Pearson r × 100, clamped to [0, 99] */
  confidence: number
}

// ---------------------------------------------------------------------------
// In-place radix-2 Cooley-Tukey FFT (power-of-two sizes only)
// ---------------------------------------------------------------------------
function fft(re: Float32Array, im: Float32Array): void {
  const n = re.length

  // Bit-reversal permutation
  let j = 0
  for (let i = 1; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      let t = re[i]; re[i] = re[j]; re[j] = t
      t = im[i]; im[i] = im[j]; im[j] = t
    }
  }

  // Butterfly stages
  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len
    const wRe = Math.cos(ang)
    const wIm = Math.sin(ang)
    for (let i = 0; i < n; i += len) {
      let curRe = 1.0, curIm = 0.0
      const half = len >> 1
      for (let k = 0; k < half; k++) {
        const uRe = re[i + k]
        const uIm = im[i + k]
        const vRe = re[i + k + half] * curRe - im[i + k + half] * curIm
        const vIm = re[i + k + half] * curIm + im[i + k + half] * curRe
        re[i + k] = uRe + vRe
        im[i + k] = uIm + vIm
        re[i + k + half] = uRe - vRe
        im[i + k + half] = uIm - vIm
        const nextRe = curRe * wRe - curIm * wIm
        curIm = curRe * wIm + curIm * wRe
        curRe = nextRe
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Pearson correlation between two equal-length arrays
// ---------------------------------------------------------------------------
function pearsonR(x: number[], y: number[]): number {
  const n = x.length
  let sx = 0, sy = 0
  for (let i = 0; i < n; i++) { sx += x[i]; sy += y[i] }
  const mx = sx / n, my = sy / n
  let num = 0, dx2 = 0, dy2 = 0
  for (let i = 0; i < n; i++) {
    const dx = x[i] - mx, dy = y[i] - my
    num += dx * dy
    dx2 += dx * dx
    dy2 += dy * dy
  }
  const den = Math.sqrt(dx2 * dy2)
  return den < 1e-10 ? 0 : num / den
}

// ---------------------------------------------------------------------------
// Main analysis function — call from a client component only
// ---------------------------------------------------------------------------
export async function analyzeKey(
  file: File,
  onProgress?: (message: string) => void
): Promise<KeyResult> {
  onProgress?.("Decoding audio…")

  const arrayBuffer = await file.arrayBuffer()
  const audioCtx = new AudioContext()

  let audioBuffer: AudioBuffer
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
  } catch {
    await audioCtx.close()
    throw new Error(
      "Could not decode this file. Try MP3, WAV, FLAC, or AAC."
    )
  }
  await audioCtx.close()

  onProgress?.("Analyzing key…")

  // ── 1. Mix to mono ────────────────────────────────────────────────────────
  const nCh = audioBuffer.numberOfChannels
  const len = audioBuffer.length
  const mono = new Float32Array(len)
  for (let c = 0; c < nCh; c++) {
    const ch = audioBuffer.getChannelData(c)
    for (let i = 0; i < len; i++) mono[i] += ch[i] / nCh
  }

  // ── 2. Decimate to ~11025 Hz ──────────────────────────────────────────────
  const srcRate = audioBuffer.sampleRate
  const targetRate = 11025
  const step = Math.max(1, Math.round(srcRate / targetRate))
  const decimLen = Math.floor(len / step)
  const decimated = new Float32Array(decimLen)
  for (let i = 0; i < decimLen; i++) decimated[i] = mono[i * step]

  // ── 3. Skip intro, then analyze up to 120 seconds ────────────────────────
  // Electronic tracks typically have drum-only intros. Skipping the first
  // 25% lands in the main section for most DJ music.
  // Floor at 20 s so we don't overshoot on short tracks.
  // Cap the skip at 90 s so we never start past the midpoint of a long track.
  const totalSamples = decimated.length
  const skipSamples = Math.min(
    Math.max(Math.floor(totalSamples * 0.25), targetRate * 20),
    targetRate * 90
  )
  const maxSamples = targetRate * 120
  const samples = decimated.slice(skipSamples, skipSamples + maxSamples)

  // ── 4. Dual chromagram via overlapping FFT windows ───────────────────────
  //
  // Two chromagrams are built simultaneously:
  //
  //  chromaFull   — 300–2093 Hz, octave-weighted (higher octaves weighted more
  //                 to reduce kick/sub-bass dominance). Used to find the tonic
  //                 via Krumhansl-Schmuckler profile matching.
  //
  //  chromaTreble — 500–2093 Hz, unweighted. Used to resolve major vs minor
  //                 by comparing the minor 3rd vs major 3rd above the detected
  //                 tonic — the melody range where that distinction is audible
  //                 and uncontaminated by bass.
  //
  const FFT_SIZE = 4096 // ≈ 372 ms per frame at 11025 Hz
  const HOP_SIZE = 2048

  const hann = new Float32Array(FFT_SIZE)
  for (let i = 0; i < FFT_SIZE; i++) {
    hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (FFT_SIZE - 1)))
  }

  const chromaFull   = new Float32Array(12).fill(0)
  const chromaTreble = new Float32Array(12).fill(0)

  const re = new Float32Array(FFT_SIZE)
  const im = new Float32Array(FFT_SIZE)
  const numFrames = Math.floor((samples.length - FFT_SIZE) / HOP_SIZE)

  // Per-frame chroma buffers for CENS normalization
  const frameChromaFull   = new Float32Array(12)
  const frameChromaTreble = new Float32Array(12)

  for (let frame = 0; frame < numFrames; frame++) {
    const offset = frame * HOP_SIZE
    for (let i = 0; i < FFT_SIZE; i++) {
      re[i] = samples[offset + i] * hann[i]
      im[i] = 0
    }
    fft(re, im)

    frameChromaFull.fill(0)
    frameChromaTreble.fill(0)

    for (let bin = 1; bin < FFT_SIZE >> 1; bin++) {
      const freq = (bin * targetRate) / FFT_SIZE
      if (freq < 300.0 || freq > 2093.0) continue
      const mag = Math.sqrt(re[bin] * re[bin] + im[bin] * im[bin])
      if (mag < 1e-5) continue
      const midi = 12 * Math.log2(freq / 440) + 69
      const pc = ((Math.round(midi) % 12) + 12) % 12
      // Octave weight: capped at 1.0 — downweights notes below A4 to reduce
      // bass contamination, but does NOT amplify the very high notes above A4
      // (amplifying high harmonics was causing phantom pitch-class artifacts).
      const octW = Math.min(1.0, (midi / 69) * (midi / 69))
      frameChromaFull[pc] += mag * octW
      if (freq >= 500.0) frameChromaTreble[pc] += mag
    }

    // CENS (Chroma Energy Normalized Statistics): L1-normalize each frame before
    // accumulation so a brief loud synth burst doesn't dominate the whole window.
    let l1Full = 0, l1Treble = 0
    for (let i = 0; i < 12; i++) { l1Full += frameChromaFull[i]; l1Treble += frameChromaTreble[i] }
    if (l1Full   > 1e-5) for (let i = 0; i < 12; i++) chromaFull[i]   += frameChromaFull[i]   / l1Full
    if (l1Treble > 1e-5) for (let i = 0; i < 12; i++) chromaTreble[i] += frameChromaTreble[i] / l1Treble
  }

  // Normalize both chromagrams
  const maxFull = Math.max(...chromaFull)
  if (maxFull > 0) for (let i = 0; i < 12; i++) chromaFull[i] /= maxFull
  const maxTreble = Math.max(...chromaTreble)
  if (maxTreble > 0) for (let i = 0; i < 12; i++) chromaTreble[i] /= maxTreble

  // ── 5. Hybrid key detection ───────────────────────────────────────────────
  //
  // Step A — tonic: for each of 12 roots, take the better of its major/minor
  //           KS correlation on the full chromagram. Best root wins.
  //
  // Step B — mode: correlate the treble chromagram against both the major and
  //           minor KS profiles for the detected root. Full 12-note Pearson r
  //           is more robust than comparing just the 3rd degree, particularly
  //           when the track's melody uses a raised 3rd over a minor bass.
  //
  const chromaArr = Array.from(chromaFull)
  const chromaTrebleArr = Array.from(chromaTreble)
  let bestRoot = 0
  let bestR = -Infinity

  for (let root = 0; root < 12; root++) {
    const rotated = [...chromaArr.slice(root), ...chromaArr.slice(0, root)]
    const r = Math.max(pearsonR(rotated, MAJOR_PROFILE), pearsonR(rotated, MINOR_PROFILE))
    if (r > bestR) { bestR = r; bestRoot = root }
  }

  console.log("[key] full:", PITCH_NAMES.map((n, i) => `${n}=${chromaFull[i].toFixed(3)}`).join(" "))
  console.log("[key] treble:", PITCH_NAMES.map((n, i) => `${n}=${chromaTreble[i].toFixed(3)}`).join(" "))
  console.log("[key] bestRoot:", PITCH_NAMES[bestRoot], bestRoot, "bestR:", bestR.toFixed(3))

  const rotatedTreble = [...chromaTrebleArr.slice(bestRoot), ...chromaTrebleArr.slice(0, bestRoot)]
  const rTrebleMaj = pearsonR(rotatedTreble, MAJOR_PROFILE)
  const rTrebleMin = pearsonR(rotatedTreble, MINOR_PROFILE)
  const bestScale: "major" | "minor" = rTrebleMin >= rTrebleMaj ? "minor" : "major"

  const rotatedBest = [...chromaArr.slice(bestRoot), ...chromaArr.slice(0, bestRoot)]
  const bestR2 = pearsonR(rotatedBest, bestScale === "minor" ? MINOR_PROFILE : MAJOR_PROFILE)
  const confidence = Math.min(99, Math.max(0, Math.round(bestR2 * 100)))
  const camelot = bestScale === "major"
    ? MAJOR_TO_CAMELOT[bestRoot]
    : MINOR_TO_CAMELOT[bestRoot]
  const musicalName = bestScale === "major"
    ? MAJOR_DISPLAY[bestRoot]
    : MINOR_DISPLAY[bestRoot]

  return {
    key: PITCH_NAMES[bestRoot],
    scale: bestScale,
    camelot,
    musicalName,
    confidence,
  }
}
