"use client"

import { useState } from "react"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  CAMELOT_KEYS,
  getCamelotKey,
  getCompatibleKeys,
  type CamelotKey,
} from "@/lib/camelot"

function KeyBadge({
  keyData,
  type,
  selected = false,
}: {
  keyData: CamelotKey
  type: "same" | "compatible" | "relative" | "energy"
  selected?: boolean
}) {
  const colorClasses = {
    same: "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30",
    compatible:
      "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
    relative:
      "bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30",
    energy:
      "bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30",
  }

  return (
    <Link href={`/camelot/${keyData.camelot.toLowerCase()}`}>
      <Badge
        variant="outline"
        className={cn(
          "text-base px-4 py-2 cursor-pointer transition-all hover:scale-105",
          colorClasses[type],
          selected && "ring-2 ring-[var(--primary)]"
        )}
      >
        <span className="font-bold mr-2">{keyData.camelot}</span>
        <span className="opacity-75">{keyData.musical}</span>
      </Badge>
    </Link>
  )
}

export function CamelotTool() {
  const [selectedKey, setSelectedKey] = useState("8A")

  const currentKey = getCamelotKey(selectedKey)
  const compatible = currentKey ? getCompatibleKeys(currentKey) : null

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold lg:text-4xl">
          Camelot Wheel - Key Compatibility
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Find compatible keys for harmonic mixing. The Camelot system makes it
          easy to mix tracks that sound great together.
        </p>
      </div>

      {/* Key Selector */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select Your Key</CardTitle>
          <CardDescription>
            Choose the Camelot key of your current track
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Select value={selectedKey} onValueChange={setSelectedKey}>
                <SelectTrigger className="text-lg h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CAMELOT_KEYS.map((key) => (
                    <SelectItem key={key.camelot} value={key.camelot}>
                      <span className="font-bold mr-2">{key.camelot}</span>
                      <span className="text-[var(--muted-foreground)]">
                        {key.musical} ({key.mode})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {currentKey && (
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <span className="text-4xl font-bold">{currentKey.camelot}</span>
                <div>
                  <p className="font-medium">{currentKey.musical}</p>
                  <p className="text-sm text-[var(--muted-foreground)] capitalize">
                    {currentKey.mode}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compatible Keys */}
      {currentKey && compatible && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Compatible Keys for {currentKey.camelot}</CardTitle>
            <CardDescription>
              These keys will mix harmonically with your selected key
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Same Key */}
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  Same Key (Perfect Match)
                </p>
                <KeyBadge keyData={compatible.same} type="same" selected />
              </div>

              {/* Adjacent Keys */}
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  Adjacent Keys (+1 / -1)
                </p>
                <div className="flex flex-wrap gap-2">
                  <KeyBadge keyData={compatible.minusOne} type="compatible" />
                  <KeyBadge keyData={compatible.plusOne} type="compatible" />
                </div>
              </div>

              {/* Relative Major/Minor */}
              <div>
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500" />
                  Relative {currentKey.mode === "minor" ? "Major" : "Minor"}
                </p>
                <KeyBadge keyData={compatible.relative} type="relative" />
              </div>

              {/* Energy Boost */}
              {compatible.energyBoost && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-orange-500" />
                    Energy Boost (+2) - More Dramatic
                  </p>
                  <KeyBadge keyData={compatible.energyBoost} type="energy" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Reference</CardTitle>
          <CardDescription>Jump to any Camelot key</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
            {CAMELOT_KEYS.slice(0, 12).map((key) => (
              <Button
                key={key.camelot}
                variant={key.camelot === selectedKey ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setSelectedKey(key.camelot)}
              >
                {key.camelot}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 mt-2">
            {CAMELOT_KEYS.slice(12).map((key) => (
              <Button
                key={key.camelot}
                variant={key.camelot === selectedKey ? "default" : "outline"}
                size="sm"
                className="text-xs"
                onClick={() => setSelectedKey(key.camelot)}
              >
                {key.camelot}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Related Links */}
      {currentKey && (
        <Card>
          <CardHeader>
            <CardTitle>Related Tools & References</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href={`/camelot/${selectedKey.toLowerCase()}`}>
                View {selectedKey} Reference Page
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/tools/bpm-transition">BPM Transition Helper</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/guides/camelot-wheel-guide">
                Learn About Camelot Mixing
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* SEO Content */}
      <section className="mt-12 prose prose-neutral dark:prose-invert max-w-none">
        <h2>Understanding the Camelot Wheel</h2>
        <p>
          The Camelot Wheel is a visual tool that helps DJs mix tracks
          harmonically. It arranges all 24 musical keys in a circle where
          adjacent keys are musically compatible.
        </p>
        <h3>How to Use Camelot Keys</h3>
        <ul>
          <li>
            <strong>Same Key:</strong> Perfect harmonic match - melodies blend
            seamlessly
          </li>
          <li>
            <strong>+1 or -1:</strong> Move up or down one number for smooth
            energy transitions
          </li>
          <li>
            <strong>A to B (or B to A):</strong> Switch between relative
            major/minor for mood changes
          </li>
          <li>
            <strong>+2 Energy Boost:</strong> A bigger jump that still works
            musically
          </li>
        </ul>
      </section>
    </div>
  )
}
