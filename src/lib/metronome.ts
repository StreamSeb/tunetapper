/**
 * Web Audio metronome with lookahead scheduling.
 *
 * A bare setInterval drifts badly (timer clamping, GC pauses), so beats are
 * scheduled ahead of time on the audio clock: a coarse JS timer wakes up every
 * LOOKAHEAD_MS and schedules every click that falls within the next
 * SCHEDULE_AHEAD_S seconds at sample-accurate AudioContext times.
 *
 * Client-side only - constructing an AudioContext requires the browser.
 */

export interface MetronomeOptions {
  bpm: number
  /**
   * Called once per beat when it is scheduled (up to SCHEDULE_AHEAD_S early).
   * `audioTime` is the exact AudioContext time the beat will sound; for visual
   * feedback, delay by (audioTime - metronome.now()).
   */
  onBeat?: (beatIndex: number, audioTime: number) => void
  /** Return false to schedule a silent beat (used by the rhythm game). */
  isAudible?: (beatIndex: number) => boolean
  /** Accent the first beat of every N (default 4). Set 0 to disable accents. */
  accentEvery?: number
}

const LOOKAHEAD_MS = 25
const SCHEDULE_AHEAD_S = 0.1

export class Metronome {
  private ctx: AudioContext | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private nextBeatTime = 0
  private beatIndex = 0
  private readonly opts: MetronomeOptions

  constructor(opts: MetronomeOptions) {
    this.opts = { ...opts }
  }

  get isRunning(): boolean {
    return this.timer !== null
  }

  /** Current time on the audio clock - use this to timestamp user taps. */
  now(): number {
    return this.ctx?.currentTime ?? 0
  }

  setBpm(bpm: number): void {
    this.opts.bpm = bpm
  }

  start(): void {
    if (this.timer) return
    if (!this.ctx) this.ctx = new AudioContext()
    // Resume covers the autoplay policy: contexts start suspended until a
    // user gesture, and start() is always called from one.
    void this.ctx.resume()
    this.beatIndex = 0
    this.nextBeatTime = this.ctx.currentTime + 0.1
    this.timer = setInterval(() => this.schedule(), LOOKAHEAD_MS)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  dispose(): void {
    this.stop()
    void this.ctx?.close()
    this.ctx = null
  }

  private schedule(): void {
    if (!this.ctx) return
    while (this.nextBeatTime < this.ctx.currentTime + SCHEDULE_AHEAD_S) {
      const audible = this.opts.isAudible?.(this.beatIndex) ?? true
      if (audible) {
        const accentEvery = this.opts.accentEvery ?? 4
        const accent = accentEvery > 0 && this.beatIndex % accentEvery === 0
        scheduleClick(this.ctx, this.nextBeatTime, accent)
      }
      this.opts.onBeat?.(this.beatIndex, this.nextBeatTime)
      this.beatIndex += 1
      this.nextBeatTime += 60 / this.opts.bpm
    }
  }
}

function scheduleClick(ctx: AudioContext, time: number, accent: boolean): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.value = accent ? 1600 : 1100
  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.exponentialRampToValueAtTime(accent ? 0.5 : 0.35, time + 0.002)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(time)
  osc.stop(time + 0.08)
}
