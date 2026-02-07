import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CAMELOT_KEYS,
  getCamelotKey,
  getCompatibleKeys,
  getMixingTip,
} from "@/lib/camelot"
import { generateCamelotPageMetadata } from "@/lib/seo"
import { cn } from "@/lib/utils"
import camelotData from "@/data/camelot-keys.json"

interface Props {
  params: Promise<{ key: string }>
}

export async function generateStaticParams() {
  return camelotData.keys.map((key) => ({
    key: key.toLowerCase(),
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params
  const keyData = getCamelotKey(key)
  if (!keyData) {
    return { title: "Key Not Found" }
  }
  return generateCamelotPageMetadata(key)
}

export default async function CamelotKeyPage({ params }: Props) {
  const { key } = await params
  const keyData = getCamelotKey(key)

  if (!keyData) {
    notFound()
  }

  const compatible = getCompatibleKeys(keyData)

  const compatibleList: {
    key: typeof compatible.same
    label: string
    type: "same" | "compatible" | "relative" | "energy"
  }[] = [
    { key: compatible.same, label: "Same Key", type: "same" },
    { key: compatible.minusOne, label: "-1 (Down)", type: "compatible" },
    { key: compatible.plusOne, label: "+1 (Up)", type: "compatible" },
    {
      key: compatible.relative,
      label: `Relative ${keyData.mode === "minor" ? "Major" : "Minor"}`,
      type: "relative",
    },
  ]

  if (compatible.energyBoost) {
    compatibleList.push({
      key: compatible.energyBoost,
      label: "+2 Energy Boost",
      type: "energy",
    })
  }

  const colorClasses = {
    same: "bg-key-green-bg text-key-green border-key-green-border",
    compatible: "bg-key-blue-bg text-key-blue border-key-blue-border",
    relative: "bg-key-purple-bg text-key-purple border-key-purple-border",
    energy: "bg-key-orange-bg text-key-orange border-key-orange-border",
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
      <Breadcrumbs items={[{ name: "Camelot Keys", path: "/camelot" }, { name: `${keyData.camelot} (${keyData.musical})`, path: `/camelot/${key}` }]} />
      {/* Header */}
      <div className="mb-8">
        <Badge variant="secondary" className="mb-2">
          {keyData.mode === "minor" ? "Minor Key" : "Major Key"}
        </Badge>
        <h1 className="text-4xl font-bold lg:text-5xl">
          {keyData.camelot}{" "}
          <span className="text-[var(--muted-foreground)]">
            ({keyData.musical})
          </span>
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Compatible keys and mixing guide for {keyData.camelot} on the Camelot
          Wheel.
        </p>
      </div>

      {/* Compatible Keys */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Compatible Keys for Mixing</CardTitle>
          <CardDescription>
            These keys will blend harmonically with {keyData.camelot}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {compatibleList.map(({ key: ck, label, type }) => (
              <Link
                key={ck.camelot}
                href={`/camelot/${ck.camelot.toLowerCase()}`}
                className={cn(
                  "rounded-lg border p-4 transition-all hover:scale-[1.02]",
                  colorClasses[type],
                  ck.camelot === keyData.camelot && "ring-2 ring-[var(--primary)]"
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-75">{label}</p>
                    <p className="text-2xl font-bold">{ck.camelot}</p>
                    <p className="text-sm opacity-75">{ck.musical}</p>
                  </div>
                  {ck.camelot === keyData.camelot && (
                    <Badge variant="outline" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mixing Tips */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Mixing Tips</CardTitle>
          <CardDescription>
            How to transition from {keyData.camelot}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {compatibleList.map(({ key: ck, label }) => (
            <div key={ck.camelot} className="border-b pb-4 last:border-0">
              <p className="font-medium">
                {keyData.camelot} → {ck.camelot}
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {getMixingTip(keyData, ck)}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Browse All Keys */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Browse All Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
            {CAMELOT_KEYS.slice(0, 12).map((k) => (
              <Button
                key={k.camelot}
                variant={k.camelot === keyData.camelot ? "default" : "outline"}
                size="sm"
                className="text-xs"
                asChild
              >
                <Link href={`/camelot/${k.camelot.toLowerCase()}`}>
                  {k.camelot}
                </Link>
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 mt-2">
            {CAMELOT_KEYS.slice(12).map((k) => (
              <Button
                key={k.camelot}
                variant={k.camelot === keyData.camelot ? "default" : "outline"}
                size="sm"
                className="text-xs"
                asChild
              >
                <Link href={`/camelot/${k.camelot.toLowerCase()}`}>
                  {k.camelot}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Related Tools</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/tools/camelot">Interactive Camelot Tool</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools/bpm-transition">BPM Transition Helper</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/guides/camelot-wheel-guide">Camelot Guide</Link>
          </Button>
        </CardContent>
      </Card>

      {/* SEO Content */}
      <section className="mt-12 prose prose-neutral dark:prose-invert max-w-none">
        <h2>About {keyData.camelot} ({keyData.musical})</h2>
        <p>
          {keyData.camelot} is a {keyData.mode} key on the Camelot Wheel,
          corresponding to {keyData.musical} in traditional music notation.
        </p>
        <p>
          When mixing with tracks in {keyData.camelot}, you can smoothly
          transition to:
        </p>
        <ul>
          <li>
            <strong>{compatible.minusOne.camelot}</strong> - Move down one for a
            subtle energy decrease
          </li>
          <li>
            <strong>{compatible.plusOne.camelot}</strong> - Move up one for a
            slight energy increase
          </li>
          <li>
            <strong>{compatible.relative.camelot}</strong> - Switch between
            {keyData.mode === "minor" ? " minor and major" : " major and minor"}{" "}
            for a mood change
          </li>
        </ul>
      </section>
    </div>
  )
}
