/**
 * Client-side BPM detection from decoded PCM.
 *
 * Pipeline (operates on the ~11 kHz mono output of decodeToMono):
 *  1. Take up to 60 s from after the intro (25% in, like key detection)
 *  2. Onset-strength envelope via half-wave-rectified spectral flux
 *     (FFT 512, hop 128 -> ~86 Hz envelope rate)
 *  3. Autocorrelate the detrended envelope over lags for 60-200 BPM
 *  4. Comb-weight each candidate with its half/double lags to resolve
 *     the octave ambiguity, with a mild preference for 70-180 BPM
 *  5. Parabolic interpolation around the winning lag for sub-BPM precision
 *
 * Runs entirely in the browser - no server requests.
 */

import type { DecodedAudio } from "./key-detection"

export interface BpmResult {
  /** Estimated tempo, snapped to an integer when very close to one */
  bpm: number
  /** 0-99, from the autocorrelation peak prominence */
  confidence: number
  /** The half/double-time reading, since genre feel is ambiguous */
  alternativeBpm: number
}

const FFT_SIZE = 512
const HOP_SIZE = 128
const MIN_BPM = 60
const MAX_BPM = 200

// In-place radix-2 FFT (duplicated from key-detection to keep both modules
// dependency-free; 25 lines is cheaper than a shared-module reshuffle)
function fft(re: Float32Array, im: Float32Array): void {
  const n = re.length
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

export function detectBpm({ samples, sampleRate }: DecodedAudio): BpmResult {
  // ── 1. Analysis segment: skip the intro, use up to 60 s ──────────────────
  const skip = Math.min(
    Math.max(Math.floor(samples.length * 0.25), sampleRate * 20),
    sampleRate * 90
  )
  const segment = samples.slice(skip, skip + sampleRate * 60)

  // ── 2. Onset-strength envelope via spectral flux ──────────────────────────
  const envRate = sampleRate / HOP_SIZE
  const numFrames = Math.floor((segment.length - FFT_SIZE) / HOP_SIZE)
  if (numFrames < envRate * 10) {
    // Under ~10 s of usable audio - not enough periodicity to measure
    return { bpm: 0, confidence: 0, alternativeBpm: 0 }
  }

  const hann = new Float32Array(FFT_SIZE)
  for (let i = 0; i < FFT_SIZE; i++) {
    hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (FFT_SIZE - 1)))
  }

  const re = new Float32Array(FFT_SIZE)
  const im = new Float32Array(FFT_SIZE)
  const nBins = FFT_SIZE >> 1
  const prevMag = new Float32Array(nBins)
  const envelope = new Float32Array(numFrames)

  for (let frame = 0; frame < numFrames; frame++) {
    const offset = frame * HOP_SIZE
    for (let i = 0; i < FFT_SIZE; i++) {
      re[i] = segment[offset + i] * hann[i]
      im[i] = 0
    }
    fft(re, im)
    let flux = 0
    for (let bin = 1; bin < nBins; bin++) {
      const mag = Math.sqrt(re[bin] * re[bin] + im[bin] * im[bin])
      const diff = mag - prevMag[bin]
      if (diff > 0) flux += diff
      prevMag[bin] = mag
    }
    envelope[frame] = flux
  }

  // Detrend: subtract a moving average so slow loudness changes don't
  // dominate the autocorrelation
  const winHalf = Math.round(envRate / 2) // ~1 s window
  const detrended = new Float32Array(numFrames)
  for (let i = 0; i < numFrames; i++) {
    const a = Math.max(0, i - winHalf)
    const b = Math.min(numFrames - 1, i + winHalf)
    let mean = 0
    for (let k = a; k <= b; k++) mean += envelope[k]
    mean /= b - a + 1
    detrended[i] = Math.max(0, envelope[i] - mean)
  }

  // ── 3. Autocorrelation over the plausible lag range ───────────────────────
  const minLag = Math.floor((envRate * 60) / MAX_BPM)
  const maxLag = Math.ceil((envRate * 60) / MIN_BPM)
  const ac = new Float32Array(maxLag + 2)
  for (let lag = minLag; lag <= maxLag + 1; lag++) {
    let sum = 0
    for (let i = 0; i + lag < numFrames; i++) sum += detrended[i] * detrended[i + lag]
    ac[lag] = sum / (numFrames - lag)
  }

  // ── 4. Comb-weighted candidate scoring with octave preference ────────────
  const acAt = (lag: number) => (lag >= minLag && lag <= maxLag ? ac[lag] : 0)
  let bestLag = minLag
  let bestScore = -Infinity
  for (let lag = minLag; lag <= maxLag; lag++) {
    const bpm = (envRate * 60) / lag
    // Reward agreement with the half/double interpretations
    let score = ac[lag] + 0.5 * acAt(lag * 2) + 0.5 * acAt(Math.round(lag / 2))
    // Mild preference for the range where produced tempos actually live
    if (bpm >= 70 && bpm <= 180) score *= 1.1
    if (score > bestScore) {
      bestScore = score
      bestLag = lag
    }
  }

  // ── 5. Parabolic interpolation for sub-lag precision ─────────────────────
  const y0 = acAt(bestLag - 1)
  const y1 = ac[bestLag]
  const y2 = acAt(bestLag + 1)
  const denom = y0 - 2 * y1 + y2
  const offset = denom === 0 ? 0 : Math.max(-0.5, Math.min(0.5, (0.5 * (y0 - y2)) / denom))
  const refinedLag = bestLag + offset

  let bpm = (envRate * 60) / refinedLag

  // Octave preference: a strongly periodic signal correlates at the beat
  // period AND its multiples, and the comb often lands on the half-time
  // reading. If we're under 90 BPM but the double-tempo lag is also well
  // supported, present the double (the produced tempo for dance music);
  // the half-time reading is still surfaced via alternativeBpm.
  const halfLag = Math.round(refinedLag / 2)
  if (bpm < 90 && bpm * 2 <= MAX_BPM && acAt(halfLag) >= 0.4 * y1) {
    bpm *= 2
  }

  // Produced dance/pop tracks sit on integer BPMs; snap when we're close
  if (Math.abs(bpm - Math.round(bpm)) < 0.25) bpm = Math.round(bpm)
  else bpm = Math.round(bpm * 10) / 10

  // Confidence: prominence of the winning peak over the average correlation
  let mean = 0
  let count = 0
  for (let lag = minLag; lag <= maxLag; lag++) {
    mean += ac[lag]
    count++
  }
  mean /= count
  const prominence = mean > 1e-12 ? y1 / mean : 0
  const confidence = Math.min(99, Math.max(0, Math.round((prominence - 1) * 33)))

  const alternativeBpm =
    bpm >= 120 ? Math.round((bpm / 2) * 10) / 10 : Math.round(bpm * 2 * 10) / 10

  return { bpm, confidence, alternativeBpm }
}
