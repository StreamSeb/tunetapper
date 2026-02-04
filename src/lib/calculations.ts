/**
 * Calculate delay time in milliseconds for a given BPM and note division
 */
export function calculateDelayMs(bpm: number, division: number): number {
  // One beat (quarter note) in ms = 60000 / BPM
  const quarterNoteMs = 60000 / bpm
  // Division is relative to whole note (1 = whole, 2 = half, 4 = quarter, etc.)
  return (quarterNoteMs * 4) / division
}

/**
 * Calculate dotted note delay (1.5x the normal duration)
 */
export function calculateDottedDelayMs(bpm: number, division: number): number {
  return calculateDelayMs(bpm, division) * 1.5
}

/**
 * Calculate triplet note delay (2/3 of the normal duration)
 */
export function calculateTripletDelayMs(bpm: number, division: number): number {
  return (calculateDelayMs(bpm, division) * 2) / 3
}

/**
 * Get all delay times for a given BPM
 */
export function getAllDelayTimes(bpm: number) {
  const divisions = [
    { name: "1/1 (Whole)", division: 1 },
    { name: "1/2 (Half)", division: 2 },
    { name: "1/4 (Quarter)", division: 4 },
    { name: "1/8 (Eighth)", division: 8 },
    { name: "1/16 (Sixteenth)", division: 16 },
    { name: "1/32 (Thirty-second)", division: 32 },
  ]

  return divisions.map((d) => ({
    name: d.name,
    normal: calculateDelayMs(bpm, d.division),
    dotted: calculateDottedDelayMs(bpm, d.division),
    triplet: calculateTripletDelayMs(bpm, d.division),
  }))
}

/**
 * Calculate duration for a number of bars at a given BPM
 * @param bars Number of bars
 * @param bpm Beats per minute
 * @param beatsPerBar Beats per bar (time signature numerator, default 4)
 * @returns Duration in seconds
 */
export function calculateBarsDuration(
  bars: number,
  bpm: number,
  beatsPerBar: number = 4
): number {
  const totalBeats = bars * beatsPerBar
  const secondsPerBeat = 60 / bpm
  return totalBeats * secondsPerBeat
}

/**
 * Format seconds to mm:ss format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)
  
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`
  }
  return `${secs}.${ms.toString().padStart(3, "0")}s`
}

/**
 * Format milliseconds for display
 */
export function formatMs(ms: number): string {
  if (ms >= 1000) {
    return `${(ms / 1000).toFixed(3)}s`
  }
  return `${ms.toFixed(2)}ms`
}

/**
 * Get common bar lengths table for a given BPM
 */
export function getBarsDurationTable(bpm: number, beatsPerBar: number = 4) {
  const barCounts = [1, 2, 4, 8, 16, 32, 64, 128]
  return barCounts.map((bars) => ({
    bars,
    duration: calculateBarsDuration(bars, bpm, beatsPerBar),
    formatted: formatDuration(calculateBarsDuration(bars, bpm, beatsPerBar)),
  }))
}

/**
 * Get genre suggestions based on BPM
 */
export function getGenreForBpm(bpm: number): string[] {
  const genres: string[] = []
  
  if (bpm >= 60 && bpm <= 90) genres.push("Hip-Hop", "R&B", "Downtempo")
  if (bpm >= 70 && bpm <= 100) genres.push("Reggae", "Dub")
  if (bpm >= 100 && bpm <= 115) genres.push("Deep House", "Tech House")
  if (bpm >= 115 && bpm <= 125) genres.push("Progressive House", "Melodic House")
  if (bpm >= 120 && bpm <= 130) genres.push("House", "Disco", "Pop")
  if (bpm >= 125 && bpm <= 135) genres.push("UK Garage", "Electro House")
  if (bpm >= 130 && bpm <= 145) genres.push("Techno", "Trance", "Hard Dance")
  if (bpm >= 140 && bpm <= 150) genres.push("Dubstep (Half-time)", "Psytrance")
  if (bpm >= 160 && bpm <= 180) genres.push("Drum & Bass", "Jungle")
  if (bpm >= 170 && bpm <= 180) genres.push("Footwork", "Juke")
  
  return genres.length > 0 ? genres : ["Various"]
}

/**
 * Get nearby BPM values for navigation
 */
export function getNearbyBpms(bpm: number, count: number = 5): number[] {
  const nearby: number[] = []
  for (let i = -count; i <= count; i++) {
    if (i !== 0) {
      const nearbyBpm = bpm + i
      if (nearbyBpm >= 20 && nearbyBpm <= 300) {
        nearby.push(nearbyBpm)
      }
    }
  }
  return nearby
}
