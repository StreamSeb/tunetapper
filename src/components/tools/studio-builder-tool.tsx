"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ExternalLink, Info, PiggyBank } from "lucide-react"
import { analytics } from "@/lib/analytics"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  buildSetup,
  ROLE_LABELS,
  type BuildInput,
  type GearItem,
  type Role,
  type UseCase,
} from "@/lib/studio-builder"
import {
  MERCHANTS,
  MERCHANT_LABELS,
  merchantSearchUrl,
  type Merchant,
} from "@/lib/affiliate"
import gearData from "@/data/gear.json"
import { cn } from "@/lib/utils"

const catalog = gearData.items as GearItem[]

const USE_CASES: { value: UseCase; label: string; hint: string }[] = [
  { value: "dj", label: "DJing", hint: "Controller-first setup" },
  { value: "producer", label: "Producing", hint: "Monitoring & capture first" },
  { value: "hybrid", label: "Both", hint: "One setup for both" },
]

const GENRES = [
  { value: "house-techno", label: "House / Techno", vocalsDefault: false },
  { value: "hip-hop-trap", label: "Hip-Hop / Trap", vocalsDefault: true },
  { value: "pop-edm", label: "Pop / EDM", vocalsDefault: true },
  { value: "dnb-bass", label: "DnB / Bass", vocalsDefault: false },
  { value: "rock-indie", label: "Rock / Indie", vocalsDefault: true },
] as const

const OWNABLE_ROLES: Role[] = [
  "headphones",
  "monitors",
  "interface",
  "controller",
  "midi-keyboard",
  "mic",
]

function MerchantLinks({ item }: { item: GearItem }) {
  return (
    <div className="flex flex-wrap gap-2">
      {MERCHANTS.map((merchant: Merchant) => (
        <Button
          key={merchant}
          variant="outline"
          size="sm"
          asChild
          onClick={() => analytics.affiliateLinkClicked(merchant, item.id)}
        >
          <a
            href={merchantSearchUrl(merchant, item.search)}
            target="_blank"
            rel="noopener noreferrer sponsored"
          >
            {MERCHANT_LABELS[merchant]}
            <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      ))}
    </div>
  )
}

export function StudioBuilderTool() {
  const [budget, setBudget] = useState(800)
  const [useCase, setUseCase] = useState<UseCase>("producer")
  const [genre, setGenre] = useState<(typeof GENRES)[number]["value"]>("house-techno")
  const [recordsVocals, setRecordsVocals] = useState(false)
  const [smallRoom, setSmallRoom] = useState(false)
  const [ownedRoles, setOwnedRoles] = useState<Role[]>([])
  const hasTracked = useRef(false)

  const input: BuildInput = useMemo(
    () => ({ budgetUsd: budget, useCase, recordsVocals, smallRoom, ownedRoles }),
    [budget, useCase, recordsVocals, smallRoom, ownedRoles]
  )
  const result = useMemo(() => buildSetup(input, catalog), [input])

  // Track generated builds, debounced so slider drags count once
  useEffect(() => {
    hasTracked.current = false
    const timeout = setTimeout(() => {
      if (!hasTracked.current) {
        analytics.studioBuildGenerated(input.budgetUsd, input.useCase)
        hasTracked.current = true
      }
    }, 1500)
    return () => clearTimeout(timeout)
  }, [input])

  const selectGenre = (value: (typeof GENRES)[number]["value"]) => {
    setGenre(value)
    const preset = GENRES.find((g) => g.value === value)
    if (preset) setRecordsVocals(preset.vocalsDefault)
  }

  const toggleOwned = (role: Role) => {
    setOwnedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold lg:text-4xl">Studio Setup Builder</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Enter your budget and how you&apos;ll use it, and get a complete,
          sensible studio setup - hand-picked gear, allocated so the money goes
          where your kind of music needs it.
        </p>
      </div>

      {/* Inputs */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Setup</CardTitle>
          <CardDescription>
            Every change updates the build instantly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Budget */}
          <div>
            <div className="flex items-baseline justify-between">
              <Label htmlFor="budget">Budget</Label>
              <span className="text-2xl font-bold">${budget}</span>
            </div>
            <input
              id="budget"
              type="range"
              min={150}
              max={3000}
              step={50}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="mt-2 w-full accent-[var(--primary)]"
            />
            <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
              <span>$150</span>
              <span>$3,000</span>
            </div>
          </div>

          {/* Use case */}
          <div>
            <Label className="mb-2 block">What will you mainly do?</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {USE_CASES.map((uc) => (
                <button
                  key={uc.value}
                  type="button"
                  onClick={() => setUseCase(uc.value)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    useCase === uc.value
                      ? "border-[var(--primary)] bg-[var(--primary)]/10"
                      : "border-[var(--border)] hover:border-[var(--primary)]/50"
                  )}
                >
                  <span className="block font-semibold">{uc.label}</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">
                    {uc.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Genre */}
          <div>
            <Label className="mb-2 block">What kind of music?</Label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => selectGenre(g.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    genre === g.value
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 font-medium"
                      : "border-[var(--border)] hover:border-[var(--primary)]/50"
                  )}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Constraints */}
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setRecordsVocals((v) => !v)}
              className={cn(
                "rounded-lg border p-3 text-left text-sm transition-colors",
                recordsVocals
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] hover:border-[var(--primary)]/50"
              )}
            >
              <span className="font-semibold">
                {recordsVocals ? "✓ " : ""}I&apos;ll record vocals/instruments
              </span>
              <span className="block text-xs text-[var(--muted-foreground)]">
                Adds a microphone to the build
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSmallRoom((v) => !v)}
              className={cn(
                "rounded-lg border p-3 text-left text-sm transition-colors",
                smallRoom
                  ? "border-[var(--primary)] bg-[var(--primary)]/10"
                  : "border-[var(--border)] hover:border-[var(--primary)]/50"
              )}
            >
              <span className="font-semibold">
                {smallRoom ? "✓ " : ""}Small / shared room
              </span>
              <span className="block text-xs text-[var(--muted-foreground)]">
                Prefers compact monitors, shifts budget to headphones
              </span>
            </button>
          </div>

          {/* Owned gear */}
          <div>
            <Label className="mb-2 block">
              Already own something? (excluded from the build)
            </Label>
            <div className="flex flex-wrap gap-2">
              {OWNABLE_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleOwned(role)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    ownedRoles.includes(role)
                      ? "border-[var(--primary)] bg-[var(--primary)]/10 font-medium line-through"
                      : "border-[var(--border)] hover:border-[var(--primary)]/50"
                  )}
                >
                  {ROLE_LABELS[role]}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-bold">Your Build</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Total ~${Math.round(result.totalUsd)}
          {result.remainingUsd >= 25 && (
            <> · ${Math.round(result.remainingUsd)} left over</>
          )}
        </p>
      </div>

      {/* Affiliate disclosure */}
      <p className="mb-6 flex items-start gap-2 rounded-lg bg-[var(--muted)] p-3 text-xs text-[var(--muted-foreground)]">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Prices are approximate street prices - check the store for the live
          price. Some outbound links may be affiliate links, meaning TuneTapper
          can earn a small commission on purchases at no extra cost to you.
          Picks are hand-curated and never sponsored.
        </span>
      </p>

      <div className="space-y-4">
        {result.picks.map(({ role, item, cheaperAlternative, pricierAlternative }) => (
          <Card key={role}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardDescription>{ROLE_LABELS[role]}</CardDescription>
                  <CardTitle className="text-lg">{item.name}</CardTitle>
                </div>
                <Badge variant="secondary" className="shrink-0 text-base">
                  ~${item.priceUsd}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">{item.why}</p>
              <MerchantLinks item={item} />
              {(cheaperAlternative || pricierAlternative) && (
                <p className="text-xs text-[var(--muted-foreground)]">
                  {cheaperAlternative && (
                    <>
                      Save: {cheaperAlternative.name} (~$
                      {cheaperAlternative.priceUsd})
                    </>
                  )}
                  {cheaperAlternative && pricierAlternative && " · "}
                  {pricierAlternative && (
                    <>
                      Upgrade: {pricierAlternative.name} (~$
                      {pricierAlternative.priceUsd})
                    </>
                  )}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {result.skipped.map(({ role, reason }) => (
          <Card key={role} className="border-dashed">
            <CardHeader className="pb-2">
              <CardDescription>{ROLE_LABELS[role]}</CardDescription>
              <CardTitle className="text-base font-medium text-[var(--muted-foreground)]">
                <PiggyBank className="mr-2 inline h-4 w-4" />
                {reason}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Related Tools */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Got your gear? Put it to work</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/tools/key-analyzer">Analyze a track&apos;s key & BPM</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools/camelot">Learn harmonic mixing</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools/rhythm-game">Test your rhythm</Link>
          </Button>
        </CardContent>
      </Card>

      {/* SEO Content */}
      <section className="mt-12 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How the builder allocates your budget</h2>
        <p>
          The builder splits your budget across gear roles based on what you
          plan to do. A DJ setup puts roughly half the money into the
          controller - it&apos;s the instrument - while a production setup
          prioritizes monitoring, because you can&apos;t fix what you
          can&apos;t hear. Every recommendation comes from a small, hand-picked
          catalog of gear with a strong track record at its price; nothing here
          is auto-generated or sponsored.
        </p>
        <h3>Rules of thumb baked in</h3>
        <ul>
          <li>
            <strong>Never exceed the budget:</strong> if something doesn&apos;t
            fit, the builder says so instead of quietly going over.
          </li>
          <li>
            <strong>Small rooms favor headphones:</strong> in a shared
            apartment, great headphones beat monitors you can never turn up.
          </li>
          <li>
            <strong>Vocals need a mic before an upgrade anywhere else:</strong>{" "}
            a $99 dynamic in an untreated room outperforms a $400 condenser
            that hears the neighbours.
          </li>
          <li>
            <strong>Buy once, cry once on monitoring:</strong> headphones and
            monitors outlive every controller and interface you&apos;ll own.
          </li>
        </ul>
      </section>
    </div>
  )
}
