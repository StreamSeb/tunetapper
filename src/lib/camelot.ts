export interface CamelotKey {
  camelot: string
  musical: string
  mode: "major" | "minor"
  number: number
  letter: "A" | "B"
}

// All 24 Camelot keys
export const CAMELOT_KEYS: CamelotKey[] = [
  // Minor keys (A column)
  { camelot: "1A", musical: "A♭m", mode: "minor", number: 1, letter: "A" },
  { camelot: "2A", musical: "E♭m", mode: "minor", number: 2, letter: "A" },
  { camelot: "3A", musical: "B♭m", mode: "minor", number: 3, letter: "A" },
  { camelot: "4A", musical: "Fm", mode: "minor", number: 4, letter: "A" },
  { camelot: "5A", musical: "Cm", mode: "minor", number: 5, letter: "A" },
  { camelot: "6A", musical: "Gm", mode: "minor", number: 6, letter: "A" },
  { camelot: "7A", musical: "Dm", mode: "minor", number: 7, letter: "A" },
  { camelot: "8A", musical: "Am", mode: "minor", number: 8, letter: "A" },
  { camelot: "9A", musical: "Em", mode: "minor", number: 9, letter: "A" },
  { camelot: "10A", musical: "Bm", mode: "minor", number: 10, letter: "A" },
  { camelot: "11A", musical: "F♯m", mode: "minor", number: 11, letter: "A" },
  { camelot: "12A", musical: "D♭m", mode: "minor", number: 12, letter: "A" },
  // Major keys (B column)
  { camelot: "1B", musical: "B", mode: "major", number: 1, letter: "B" },
  { camelot: "2B", musical: "G♭", mode: "major", number: 2, letter: "B" },
  { camelot: "3B", musical: "D♭", mode: "major", number: 3, letter: "B" },
  { camelot: "4B", musical: "A♭", mode: "major", number: 4, letter: "B" },
  { camelot: "5B", musical: "E♭", mode: "major", number: 5, letter: "B" },
  { camelot: "6B", musical: "B♭", mode: "major", number: 6, letter: "B" },
  { camelot: "7B", musical: "F", mode: "major", number: 7, letter: "B" },
  { camelot: "8B", musical: "C", mode: "major", number: 8, letter: "B" },
  { camelot: "9B", musical: "G", mode: "major", number: 9, letter: "B" },
  { camelot: "10B", musical: "D", mode: "major", number: 10, letter: "B" },
  { camelot: "11B", musical: "A", mode: "major", number: 11, letter: "B" },
  { camelot: "12B", musical: "E", mode: "major", number: 12, letter: "B" },
]

/**
 * Get a Camelot key by its code (e.g., "8A")
 */
export function getCamelotKey(code: string): CamelotKey | undefined {
  return CAMELOT_KEYS.find(
    (k) => k.camelot.toLowerCase() === code.toLowerCase()
  )
}

/**
 * Get compatible keys for mixing
 * Compatible keys are: same key, +1, -1, and relative major/minor (A↔B)
 */
export function getCompatibleKeys(key: CamelotKey): {
  same: CamelotKey
  plusOne: CamelotKey
  minusOne: CamelotKey
  relative: CamelotKey
  energyBoost: CamelotKey | null
} {
  const { number, letter } = key

  // Same key
  const same = key

  // Plus one (wraps from 12 to 1)
  const plusOneNum = number === 12 ? 1 : number + 1
  const plusOne = CAMELOT_KEYS.find(
    (k) => k.number === plusOneNum && k.letter === letter
  )!

  // Minus one (wraps from 1 to 12)
  const minusOneNum = number === 1 ? 12 : number - 1
  const minusOne = CAMELOT_KEYS.find(
    (k) => k.number === minusOneNum && k.letter === letter
  )!

  // Relative major/minor (A↔B)
  const relativeLetter = letter === "A" ? "B" : "A"
  const relative = CAMELOT_KEYS.find(
    (k) => k.number === number && k.letter === relativeLetter
  )!

  // Energy boost (+2, more dramatic but still works)
  const energyBoostNum = number >= 11 ? number - 10 : number + 2
  const energyBoost =
    CAMELOT_KEYS.find(
      (k) => k.number === energyBoostNum && k.letter === letter
    ) || null

  return { same, plusOne, minusOne, relative, energyBoost }
}

/**
 * Get all compatible keys as a flat array
 */
export function getAllCompatibleKeys(key: CamelotKey): CamelotKey[] {
  const compatible = getCompatibleKeys(key)
  const result = [
    compatible.same,
    compatible.plusOne,
    compatible.minusOne,
    compatible.relative,
  ]
  if (compatible.energyBoost) {
    result.push(compatible.energyBoost)
  }
  return result
}

/**
 * Check if two keys are compatible for mixing
 */
export function areKeysCompatible(key1: CamelotKey, key2: CamelotKey): boolean {
  const compatible = getAllCompatibleKeys(key1)
  return compatible.some((k) => k.camelot === key2.camelot)
}

/**
 * Get mixing tip for a key transition
 */
export function getMixingTip(from: CamelotKey, to: CamelotKey): string {
  if (from.camelot === to.camelot) {
    return "Perfect match! Same key - this will blend seamlessly."
  }

  const fromNum = from.number
  const toNum = to.number
  const diff =
    toNum - fromNum === 0
      ? 0
      : (((toNum - fromNum + 12 - 1) % 12) + 1) - 1 === 0
        ? 0
        : ((toNum - fromNum + 12 - 1) % 12) + 1 - 12 < 0
          ? ((toNum - fromNum + 12 - 1) % 12) + 1
          : ((toNum - fromNum + 12 - 1) % 12) + 1 - 12

  if (from.letter !== to.letter && from.number === to.number) {
    return `Relative ${to.mode} - smooth transition between major and minor with the same tonal center.`
  }

  if (Math.abs(diff) === 1 || Math.abs(diff) === 11) {
    return `Moving ${diff > 0 || diff === -11 ? "up" : "down"} one key - classic harmonic mixing with subtle energy shift.`
  }

  if (Math.abs(diff) === 2 || Math.abs(diff) === 10) {
    return "Energy boost! Two steps creates a noticeable but still musical transition."
  }

  return "This combination may clash - use with caution or use creative transitions."
}
