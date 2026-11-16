/// <reference lib="webworker" />
/**
 * Runs the key finder and BPM detector DSP off the main thread, so the page
 * stays responsive while a folder of tracks is analysed. Decoding happens on
 * the main thread (Web Audio isn't available in workers); the decoded mono
 * samples are transferred here.
 */
import { analyzeKeyFromSamples } from "./key-detection"
import { detectBpm } from "./bpm-detection"

export interface AnalyzeRequest {
  id: string
  samples: Float32Array
  sampleRate: number
}

export type AnalyzeResponse =
  | {
      id: string
      ok: true
      camelot: string
      musicalName: string
      keyConfidence: number
      bpm: number
      alternativeBpm: number
      bpmConfidence: number
    }
  | { id: string; ok: false; error: string }

self.onmessage = (e: MessageEvent<AnalyzeRequest>) => {
  const { id, samples, sampleRate } = e.data
  try {
    const key = analyzeKeyFromSamples({ samples, sampleRate })
    const tempo = detectBpm({ samples, sampleRate })
    const res: AnalyzeResponse = {
      id,
      ok: true,
      camelot: key.camelot,
      musicalName: key.musicalName,
      keyConfidence: key.confidence,
      bpm: tempo.bpm,
      alternativeBpm: tempo.alternativeBpm,
      bpmConfidence: tempo.confidence,
    }
    self.postMessage(res)
  } catch (err) {
    const res: AnalyzeResponse = {
      id,
      ok: false,
      error: err instanceof Error ? err.message : "Analysis failed",
    }
    self.postMessage(res)
  }
}
