// Deterministic budget allocator for the studio setup builder.
//
// Recommendations come from the hand-curated catalog in src/data/gear.json -
// never from a model at runtime - so results are instant, reproducible, and
// can't invent products (see docs/studio-builder-plan.md).

export type Role =
  | "headphones"
  | "monitors"
  | "interface"
  | "controller"
  | "midi-keyboard"
  | "mic"

export type UseCase = "dj" | "producer" | "hybrid"

export interface GearItem {
  id: string
  role: Role
  name: string
  priceUsd: number
  why: string
  tags: string[]
  search: string
}

export interface BuildInput {
  budgetUsd: number
  useCase: UseCase
  recordsVocals: boolean
  smallRoom: boolean
  /** Roles the user already owns - excluded and their budget share redistributed */
  ownedRoles: Role[]
}

export interface BuildPick {
  role: Role
  item: GearItem
  cheaperAlternative: GearItem | null
  pricierAlternative: GearItem | null
}

export interface BuildResult {
  picks: BuildPick[]
  skipped: { role: Role; reason: string }[]
  totalUsd: number
  remainingUsd: number
}

export const ROLE_LABELS: Record<Role, string> = {
  headphones: "Headphones",
  monitors: "Studio Monitors",
  interface: "Audio Interface",
  controller: "DJ Controller",
  "midi-keyboard": "MIDI Keyboard",
  mic: "Microphone",
}

// Budget share per role by use case. A DJ's money goes to the controller;
// a producer's to monitoring and capture. Weights are normalized after
// constraint filtering, so they only need to be right relative to each other.
const ROLE_WEIGHTS: Record<UseCase, Partial<Record<Role, number>>> = {
  dj: { controller: 0.45, monitors: 0.3, headphones: 0.25 },
  producer: {
    monitors: 0.32,
    mic: 0.2,
    interface: 0.18,
    headphones: 0.15,
    "midi-keyboard": 0.15,
  },
  hybrid: {
    controller: 0.3,
    monitors: 0.25,
    headphones: 0.13,
    interface: 0.12,
    mic: 0.1,
    "midi-keyboard": 0.1,
  },
}

// Letting a pick run slightly past its slice produces better setups than
// strict slicing (the leftover from other roles absorbs it), but the running
// remaining-budget cap below guarantees the total never exceeds the budget.
const SLICE_OVERSHOOT = 1.25

export function buildSetup(input: BuildInput, catalog: GearItem[]): BuildResult {
  const { budgetUsd, useCase, recordsVocals, smallRoom, ownedRoles } = input

  const weights = new Map<Role, number>()
  for (const [role, weight] of Object.entries(ROLE_WEIGHTS[useCase]) as [
    Role,
    number,
  ][]) {
    if (ownedRoles.includes(role)) continue
    if (role === "mic" && !recordsVocals) continue
    weights.set(role, weight)
  }

  // A small room shifts monitoring money toward headphones - near-field
  // volume is the constraint, and good headphones spend it better.
  if (smallRoom && weights.has("monitors") && weights.has("headphones")) {
    weights.set("monitors", weights.get("monitors")! - 0.08)
    weights.set("headphones", weights.get("headphones")! + 0.08)
  }

  // Highest-weight roles pick first so the core of the setup gets the most
  // room to spend before leftovers shrink.
  const orderedRoles = [...weights.keys()].sort(
    (a, b) => weights.get(b)! - weights.get(a)!
  )

  const picks: BuildPick[] = []
  const skipped: BuildResult["skipped"] = []
  let remaining = budgetUsd
  let remainingWeight = [...weights.values()].reduce((s, w) => s + w, 0)

  for (const role of orderedRoles) {
    const weight = weights.get(role)!
    const slice = remaining * (weight / remainingWeight)
    remainingWeight -= weight

    let candidates = catalog
      .filter((item) => item.role === role)
      .sort((a, b) => a.priceUsd - b.priceUsd)

    // In a small room, prefer compact monitors when any fit the budget.
    if (smallRoom && role === "monitors") {
      const compact = candidates.filter(
        (item) =>
          item.tags.includes("compact") &&
          item.priceUsd <= Math.min(slice * SLICE_OVERSHOOT, remaining)
      )
      if (compact.length > 0) candidates = compact
    }

    const cap = Math.min(slice * SLICE_OVERSHOOT, remaining)
    const affordable = candidates.filter((item) => item.priceUsd <= cap)

    let pick: GearItem | undefined = affordable[affordable.length - 1]
    if (!pick) {
      // Nothing fits the slice - fall back to the cheapest option if the
      // overall remaining budget still covers it, otherwise skip the role.
      const cheapest = candidates[0]
      if (cheapest && cheapest.priceUsd <= remaining) {
        pick = cheapest
      } else {
        skipped.push({
          role,
          reason: `Budget left ($${Math.round(remaining)}) doesn't cover ${ROLE_LABELS[role].toLowerCase()} - add these later.`,
        })
        continue
      }
    }

    picks.push({ role, item: pick, ...alternativesFor(catalog, pick) })
    remaining -= pick.priceUsd
  }

  // Upgrade pass: spend leftover budget stepping picks up one tier at a
  // time, core (highest-weight) roles first, until nothing else fits.
  let improved = true
  while (improved) {
    improved = false
    for (const pick of picks) {
      let candidates = catalog.filter((item) => item.role === pick.role)
      if (smallRoom && pick.role === "monitors") {
        const compact = candidates.filter((item) => item.tags.includes("compact"))
        if (compact.length > 0) candidates = compact
      }
      const next = candidates
        .filter(
          (item) =>
            item.priceUsd > pick.item.priceUsd &&
            item.priceUsd - pick.item.priceUsd <= remaining
        )
        .sort((a, b) => a.priceUsd - b.priceUsd)[0]
      if (next) {
        remaining -= next.priceUsd - pick.item.priceUsd
        pick.item = next
        Object.assign(pick, alternativesFor(catalog, next))
        improved = true
      }
    }
  }

  return {
    picks,
    skipped,
    totalUsd: budgetUsd - remaining,
    remainingUsd: remaining,
  }
}

function alternativesFor(catalog: GearItem[], pick: GearItem) {
  const roleItems = catalog
    .filter((item) => item.role === pick.role && item.id !== pick.id)
    .sort((a, b) => a.priceUsd - b.priceUsd)
  return {
    cheaperAlternative:
      roleItems.filter((i) => i.priceUsd < pick.priceUsd).pop() ?? null,
    pricierAlternative: roleItems.find((i) => i.priceUsd > pick.priceUsd) ?? null,
  }
}
