// Deterministic budget allocator for the studio setup builder.
//
// Recommendations come from the hand-curated catalog in src/data/gear.json -
// never from a model at runtime - so results are instant, reproducible, and
// can't invent products (see docs/studio-builder-plan.md).
//
// Prices are EUR. Studio monitors and monitor cables are normally sold per
// piece, so each item carries a `qty`: the build cost is unitPriceEur * qty.

import type { MerchantListings } from "./affiliate"

export type Role =
  | "headphones"
  | "monitors"
  | "interface"
  | "controller"
  | "midi-keyboard"
  | "mic"
  | "mic-stand"
  | "cables"
  | "monitor-isolation"
  | "acoustic-treatment"

export type UseCase = "dj" | "producer" | "hybrid"

export type Tier = "entry" | "mid" | "high" | "flagship"

export interface GearItem {
  id: string
  role: Role
  name: string
  tier: Tier
  /** Price of one unit. Multiply by qty for the build cost. */
  unitPriceEur: number
  /** Units the role needs; defaults to 1. Monitors sold singly use 2. */
  qty?: number
  /** Set when one listing is already a multi-unit box, e.g. "pair". */
  unitLabel?: string
  /** Builds this item is eligible for; defaults to all of them. */
  useCases?: UseCase[]
  /** "estimate" means the price has not been confirmed on a merchant page yet. */
  priceSource?: "verified" | "estimate"
  why: string
  tags: string[]
  merchants: MerchantListings
}

export interface BuildInput {
  budgetEur: number
  useCase: UseCase
  recordsVocals: boolean
  smallRoom: boolean
  /** Roles the user already owns - excluded and their budget share redistributed */
  ownedRoles: Role[]
}

export interface BuildPick {
  role: Role
  item: GearItem
  /** unitPriceEur * qty */
  totalEur: number
  qty: number
  cheaperAlternative: GearItem | null
  pricierAlternative: GearItem | null
}

export interface BuildResult {
  picks: BuildPick[]
  skipped: { role: Role; reason: string }[]
  totalEur: number
  remainingEur: number
}

export const ROLE_LABELS: Record<Role, string> = {
  headphones: "Headphones",
  monitors: "Studio Monitors",
  interface: "Audio Interface",
  controller: "DJ Controller",
  "midi-keyboard": "MIDI Keyboard",
  mic: "Microphone",
  "mic-stand": "Mic Stand",
  cables: "Cables",
  "monitor-isolation": "Monitor Isolation",
  "acoustic-treatment": "Acoustic Treatment",
}

export const TIER_LABELS: Record<Tier, string> = {
  entry: "Entry",
  mid: "Mid",
  high: "High-end",
  flagship: "Flagship",
}

// Roles that only make sense once something else is in the build. A stand is
// pointless without a mic; cables are pointless with nothing to plug in.
const ROLE_REQUIRES: Partial<Record<Role, Role[]>> = {
  "mic-stand": ["mic"],
  "monitor-isolation": ["monitors"],
  cables: ["monitors", "mic"],
}

// Budget share per role by use case. A DJ's money goes to the controller;
// a producer's to monitoring and capture. Weights are normalized after
// constraint filtering, so they only need to be right relative to each other.
const ROLE_WEIGHTS: Record<UseCase, Partial<Record<Role, number>>> = {
  dj: {
    controller: 0.4,
    monitors: 0.28,
    headphones: 0.22,
    "acoustic-treatment": 0.04,
    "monitor-isolation": 0.04,
    cables: 0.02,
  },
  producer: {
    monitors: 0.28,
    headphones: 0.16,
    mic: 0.16,
    interface: 0.14,
    "midi-keyboard": 0.12,
    "acoustic-treatment": 0.07,
    "monitor-isolation": 0.04,
    "mic-stand": 0.04,
    cables: 0.02,
  },
  hybrid: {
    controller: 0.26,
    monitors: 0.22,
    headphones: 0.12,
    interface: 0.11,
    mic: 0.09,
    "midi-keyboard": 0.09,
    "acoustic-treatment": 0.05,
    "monitor-isolation": 0.03,
    "mic-stand": 0.02,
    cables: 0.01,
  },
}

// Letting a pick run slightly past its slice produces better setups than
// strict slicing (the leftover from other roles absorbs it), but the running
// remaining-budget cap below guarantees the total never exceeds the budget.
const SLICE_OVERSHOOT = 1.25

export function itemQty(item: GearItem): number {
  return item.qty ?? 1
}

export function itemTotal(item: GearItem): number {
  return round2(item.unitPriceEur * itemQty(item))
}

function eligible(item: GearItem, useCase: UseCase): boolean {
  return !item.useCases || item.useCases.includes(useCase)
}

/**
 * Candidates for a role, cheapest first. Use case is a hard filter - it is what
 * stops a DJ build being handed open-back mixing headphones that leak into the
 * booth. A small room additionally restricts monitors to compact designs.
 */
function candidatesFor(catalog: GearItem[], role: Role, input: BuildInput): GearItem[] {
  let items = catalog.filter((i) => i.role === role && eligible(i, input.useCase))

  if (role === "monitors" && input.smallRoom) {
    const compact = items.filter(
      (i) => i.tags.includes("compact") || i.tags.includes("small-room")
    )
    if (compact.length > 0) items = compact
  }

  return items.sort((a, b) => itemTotal(a) - itemTotal(b))
}

export function buildSetup(input: BuildInput, catalog: GearItem[]): BuildResult {
  const { budgetEur, useCase, recordsVocals, smallRoom, ownedRoles } = input

  const weights = new Map<Role, number>()
  for (const [role, weight] of Object.entries(ROLE_WEIGHTS[useCase]) as [Role, number][]) {
    if (ownedRoles.includes(role)) continue
    if (role === "mic" && !recordsVocals) continue
    if (role === "mic-stand" && !recordsVocals) continue
    weights.set(role, weight)
  }

  // A small room shifts monitoring money toward headphones - near-field volume
  // is the constraint - and makes treatment matter more, not less.
  if (smallRoom) {
    if (weights.has("monitors") && weights.has("headphones")) {
      weights.set("monitors", weights.get("monitors")! - 0.06)
      weights.set("headphones", weights.get("headphones")! + 0.06)
    }
    if (weights.has("acoustic-treatment")) {
      weights.set("acoustic-treatment", weights.get("acoustic-treatment")! + 0.03)
    }
  }

  // Core roles decide first so the heart of the setup gets the most room to
  // spend; dependent roles are evaluated afterwards, once we know whether their
  // prerequisite actually made it into the build.
  // Deterministic: weight first, then role name so equal weights never reorder.
  const byWeightDesc = (a: Role, b: Role) =>
    weights.get(b)! - weights.get(a)! || a.localeCompare(b)
  const allRoles = [...weights.keys()]
  const coreRoles = allRoles.filter((r) => !ROLE_REQUIRES[r]).sort(byWeightDesc)
  const dependentRoles = allRoles.filter((r) => ROLE_REQUIRES[r]).sort(byWeightDesc)

  const picks: BuildPick[] = []
  const skipped: BuildResult["skipped"] = []
  let remaining = budgetEur
  let remainingWeight = coreRoles.reduce((s, r) => s + weights.get(r)!, 0)

  const has = (role: Role) => picks.some((p) => p.role === role) || ownedRoles.includes(role)

  // Hold back enough for the cheap things that make the rest usable. A mic with
  // no cable and no stand is not a setup, and these roles are evaluated last, so
  // without a reserve the core roles would always eat their money.
  const reserve = dependentRoles.reduce((sum, role) => {
    const needs = ROLE_REQUIRES[role]!
    const willApply = needs.some((n) => weights.has(n) || ownedRoles.includes(n))
    if (!willApply) return sum
    const cheapest = candidatesFor(catalog, role, input)[0]
    return cheapest ? sum + itemTotal(cheapest) : sum
  }, 0)
  // Never let the reserve crowd out the core of the setup on a small budget.
  const coreBudget = Math.max(budgetEur - reserve, budgetEur * 0.6)

  let coreRemaining = coreBudget

  const take = (role: Role, item: GearItem) => {
    const total = itemTotal(item)
    picks.push({
      role,
      item,
      totalEur: total,
      qty: itemQty(item),
      ...alternativesFor(catalog, role, item, input),
    })
    remaining = round2(remaining - total)
    coreRemaining = round2(coreRemaining - total)
  }

  for (const role of coreRoles) {
    const weight = weights.get(role)!
    const slice = remainingWeight > 0 ? coreRemaining * (weight / remainingWeight) : 0
    remainingWeight -= weight

    const candidates = candidatesFor(catalog, role, input)
    const cap = Math.min(slice * SLICE_OVERSHOOT, coreRemaining)
    const affordable = candidates.filter((item) => itemTotal(item) <= cap)

    // Nothing fits this slice: skip for now. The fill pass below revisits every
    // skipped role in priority order once the whole budget has been apportioned.
    const pick = affordable[affordable.length - 1]
    if (!pick) {
      skipped.push({ role, reason: skipReason(role, remaining, candidates) })
      continue
    }
    take(role, pick)
  }

  // Dependent roles: only offered when their prerequisite made it into the build.
  const applicableDependents = dependentRoles.filter((role) =>
    ROLE_REQUIRES[role]!.some(has)
  )

  for (let i = 0; i < applicableDependents.length; i++) {
    const role = applicableDependents[i]
    const candidates = candidatesFor(catalog, role, input)

    // Hold back the cheapest option for each dependent role still to come, so an
    // upgrade here can never starve a cable or a stand later.
    const holdBack = applicableDependents.slice(i + 1).reduce((sum, later) => {
      const cheapest = candidatesFor(catalog, later, input)[0]
      return cheapest ? sum + itemTotal(cheapest) : sum
    }, 0)
    const spendable = Math.max(round2(remaining - holdBack), 0)
    const cap = Math.min(budgetEur * weights.get(role)! * SLICE_OVERSHOOT, spendable)

    const affordable = candidates.filter((item) => itemTotal(item) <= cap)
    const pick = affordable[affordable.length - 1]

    if (pick) {
      take(role, pick)
    } else {
      const cheapest = candidates[0]
      if (cheapest && itemTotal(cheapest) <= remaining) take(role, cheapest)
      else skipped.push({ role, reason: skipReason(role, remaining, candidates) })
    }
  }

  // Completeness beats luxury: before upgrading anything, try to fill roles we
  // had to skip - most important first. A missing mic cable is worse than
  // slightly cheaper monitors.
  for (const role of [...skipped.map((s) => s.role)].sort(byWeightDesc)) {
    const needs = ROLE_REQUIRES[role]
    if (needs && !needs.some(has)) continue
    const cheapest = candidatesFor(catalog, role, input)[0]
    if (cheapest && itemTotal(cheapest) <= remaining) {
      take(role, cheapest)
      skipped.splice(
        skipped.findIndex((s) => s.role === role),
        1
      )
    }
  }

  // Upgrade pass: spend leftover budget stepping picks up one price step at a
  // time, core (highest-weight) roles first, until nothing else fits.
  let improved = true
  while (improved) {
    improved = false
    for (const pick of picks) {
      const candidates = candidatesFor(catalog, pick.role, input)
      const next = candidates.find(
        (item) =>
          itemTotal(item) > pick.totalEur && itemTotal(item) - pick.totalEur <= remaining
      )
      if (next) {
        remaining = round2(remaining - (itemTotal(next) - pick.totalEur))
        pick.item = next
        pick.totalEur = itemTotal(next)
        pick.qty = itemQty(next)
        Object.assign(pick, alternativesFor(catalog, pick.role, next, input))
        improved = true
      }
    }
  }

  // Keep the displayed order stable and readable rather than purchase order.
  const order = Object.keys(ROLE_LABELS) as Role[]
  picks.sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role))
  skipped.sort((a, b) => order.indexOf(a.role) - order.indexOf(b.role))

  return {
    picks,
    skipped,
    totalEur: round2(budgetEur - remaining),
    remainingEur: round2(remaining),
  }
}

function skipReason(role: Role, remaining: number, candidates: GearItem[]): string {
  const label = ROLE_LABELS[role].toLowerCase()
  if (candidates.length === 0) {
    return `No ${label} in the catalog fits this kind of setup.`
  }
  const cheapest = itemTotal(candidates[0])
  return `Cheapest ${label} we would recommend is EUR ${Math.round(cheapest)}, and only EUR ${Math.round(remaining)} is left - add this later.`
}

function alternativesFor(
  catalog: GearItem[],
  role: Role,
  pick: GearItem,
  input: BuildInput
) {
  const roleItems = candidatesFor(catalog, role, input).filter((i) => i.id !== pick.id)
  const pickTotal = itemTotal(pick)
  return {
    cheaperAlternative: roleItems.filter((i) => itemTotal(i) < pickTotal).pop() ?? null,
    pricierAlternative: roleItems.find((i) => itemTotal(i) > pickTotal) ?? null,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
