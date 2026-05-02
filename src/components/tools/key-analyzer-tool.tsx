"use client"

import { useState, useCallback, useRef } from "react"
import Link from "next/link"
import { Upload, Music, RotateCcw, AlertCircle, CheckCircle2 } from "lucide-react"
import { analyzeKey, type KeyResult } from "@/lib/key-detection"
import { getCamelotKey, getCompatibleKeys } from "@/lib/camelot"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Status = "idle" | "decoding" | "analyzing" | "done" | "error"

const ACCEPTED_TYPES = [
  "audio/mpeg",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/flac",
  "audio/x-flac",
  "audio/aac",
  "audio/ogg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/mp3",
]

const COMPATIBLE_COLORS = {
  same: "bg-key-green-bg text-key-green border-key-green-border",
  compatible: "bg-key-blue-bg text-key-blue border-key-blue-border",
  relative: "bg-key-purple-bg text-key-purple border-key-purple-border",
  energy: "bg-key-orange-bg text-key-orange border-key-orange-border",
}

function CompatibleKeyBadge({
  camelotCode,
  label,
  type,
}: {
  camelotCode: string
  label: string
  type: keyof typeof COMPATIBLE_COLORS
}) {
  const keyData = getCamelotKey(camelotCode)
  if (!keyData) return null
  return (
    <Link href={`/camelot/${camelotCode.toLowerCase()}`}>
      <div
        className={cn(
          "rounded-md border px-4 py-3 transition-all hover:scale-105 cursor-pointer",
          COMPATIBLE_COLORS[type]
        )}
      >
        <p className="text-xs opacity-75 mb-0.5">{label}</p>
        <p className="text-lg font-bold leading-none">{keyData.camelot}</p>
        <p className="text-sm opacity-80 mt-0.5">{keyData.musical}</p>
      </div>
    </Link>
  )
}

function ConfidenceBar({ value }: { value: number }) {
  const color =
    value >= 80 ? "bg-green-500" : value >= 60 ? "bg-yellow-500" : "bg-orange-500"
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-[var(--muted-foreground)]">Detection confidence</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-[var(--muted)]">
        <div
          className={cn("h-2 rounded-full transition-all duration-700", color)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export function KeyAnalyzerTool({
  faqs,
}: {
  faqs?: { question: string; answer: string }[]
}) {
  const [status, setStatus] = useState<Status>("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [result, setResult] = useState<KeyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(mp3|wav|flac|aac|ogg|m4a|mp4)$/i)) {
      setError("Unsupported format. Try MP3, WAV, FLAC, AAC, or OGG.")
      setStatus("error")
      return
    }

    setResult(null)
    setError(null)
    setStatus("decoding")

    try {
      const keyResult = await analyzeKey(file, (msg) => {
        setStatusMessage(msg)
        setStatus(msg.startsWith("Analyzing") ? "analyzing" : "decoding")
      })
      setResult(keyResult)
      setStatus("done")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.")
      setStatus("error")
    }
  }, [])

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
      // reset so re-selecting same file triggers onChange
      e.target.value = ""
    },
    [processFile]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const reset = () => {
    setStatus("idle")
    setResult(null)
    setError(null)
    setStatusMessage("")
  }

  const currentKey = result ? getCamelotKey(result.camelot) : null
  const compatible = currentKey ? getCompatibleKeys(currentKey) : null

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold lg:text-4xl">
          Free Online Key Finder
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Upload any track and instantly detect its musical key and Camelot
          notation — 100% in your browser, no upload to any server.
        </p>
      </div>

      {/* Drop zone / upload */}
      {status === "idle" || status === "error" ? (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed px-8 py-16 cursor-pointer transition-colors",
                dragging
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]/40"
              )}
            >
              <div className="rounded-full bg-[var(--muted)] p-4">
                <Upload className="h-8 w-8 text-[var(--muted-foreground)]" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium">
                  {dragging ? "Drop your track here" : "Drop a track or click to browse"}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  MP3 · WAV · FLAC · AAC · OGG · M4A
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>

            {status === "error" && error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Processing */}
      {(status === "decoding" || status === "analyzing") && (
        <Card className="mb-8">
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <Music className="h-12 w-12 text-[var(--primary)] animate-pulse" />
              </div>
              <div>
                <p className="text-lg font-medium">{statusMessage || "Processing…"}</p>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {status === "decoding"
                    ? "Decoding audio format"
                    : "Computing chromagram & matching key profiles"}
                </p>
              </div>
              <div className="w-full max-w-xs h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
                <div className="h-full bg-[var(--primary)] rounded-full animate-shimmer w-1/2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result */}
      {status === "done" && result && (
        <>
          {/* Key result */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <CardTitle>Key Detected</CardTitle>
              </div>
              <CardDescription>
                Based on chromagram analysis of your track
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main result display */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] h-20 w-20 text-3xl font-bold">
                    {result.camelot}
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{result.musicalName}</p>
                    <p className="text-[var(--muted-foreground)] capitalize">
                      {result.scale} key
                    </p>
                  </div>
                </div>
              </div>

              <ConfidenceBar value={result.confidence} />

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/tools/camelot">
                    Open Camelot Wheel Tool
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/camelot/${result.camelot.toLowerCase()}`}>
                    View {result.camelot} Reference Page
                  </Link>
                </Button>
                <Button variant="ghost" onClick={reset}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Analyze another track
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Compatible keys */}
          {compatible && currentKey && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Compatible Keys for {result.camelot}</CardTitle>
                <CardDescription>
                  These keys mix harmonically with {result.musicalName} — click any
                  to see its full reference
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  <CompatibleKeyBadge
                    camelotCode={compatible.same.camelot}
                    label="Same key"
                    type="same"
                  />
                  <CompatibleKeyBadge
                    camelotCode={compatible.minusOne.camelot}
                    label="−1 (down)"
                    type="compatible"
                  />
                  <CompatibleKeyBadge
                    camelotCode={compatible.plusOne.camelot}
                    label="+1 (up)"
                    type="compatible"
                  />
                  <CompatibleKeyBadge
                    camelotCode={compatible.relative.camelot}
                    label={`Relative ${currentKey.mode === "minor" ? "major" : "minor"}`}
                    type="relative"
                  />
                  {compatible.energyBoost && (
                    <CompatibleKeyBadge
                      camelotCode={compatible.energyBoost.camelot}
                      label="+2 energy boost"
                      type="energy"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* How it works */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 text-sm text-[var(--muted-foreground)]">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold">1</span>
              <span>Your audio is decoded entirely in your browser — nothing is sent to any server.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold">2</span>
              <span>A chromagram is computed: the energy distribution across all 12 pitch classes (C through B) over time.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold">3</span>
              <span>The chromagram is matched against major and minor key profiles (Krumhansl-Schmuckler algorithm) to find the best fit.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold">4</span>
              <span>The detected key is mapped to its Camelot wheel notation so you can find compatible tracks instantly.</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Related tools */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Related Tools</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href="/tools/camelot">Camelot Wheel Calculator</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools/bpm-transition">BPM Transition Helper</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/guides/camelot-wheel-guide">Camelot Wheel Guide</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/guides/key-detection-software">Key Detection Guide</Link>
          </Button>
        </CardContent>
      </Card>

      {/* SEO prose + FAQ */}
      <section className="mt-4 prose prose-neutral dark:prose-invert max-w-none">
        <h2>Find the Key of Any Song — Free, Private, Instant</h2>
        <p>
          TuneTapper&apos;s key finder analyzes your audio file directly in your
          browser using the Web Audio API and the{" "}
          <strong>Krumhansl-Schmuckler key-finding algorithm</strong> — the same
          approach used by professional audio analysis tools. No account required,
          no file uploads, completely free.
        </p>
        <h3>What Is Musical Key Detection?</h3>
        <p>
          Musical key detection (also called <em>key estimation</em> or{" "}
          <em>key finding</em>) identifies the tonal center of a piece of music.
          Knowing the key of a track is essential for DJs doing harmonic mixing —
          tracks in compatible keys blend together without clashing harmonies.
        </p>
        <h3>What Is the Camelot Wheel?</h3>
        <p>
          The Camelot Wheel assigns a number (1–12) and letter (A for minor, B
          for major) to every musical key. Tracks that share the same Camelot
          code, or codes that are one step apart, are harmonically compatible and
          will mix without dissonance. Use the{" "}
          <Link href="/tools/camelot">Camelot Wheel Calculator</Link> to explore
          compatible keys for any detected result.
        </p>
        <h3>How Accurate Is This Tool?</h3>
        <p>
          The Krumhansl-Schmuckler algorithm achieves 70–90% accuracy on
          commercial music. It performs best on tracks with clear tonal centers —
          which covers the vast majority of EDM, house, techno, pop, and hip-hop.
          Atonal, heavily chromatic, or extremely percussive tracks may produce
          lower confidence scores.
        </p>

        {faqs && faqs.length > 0 && (
          <>
            <h2>Frequently Asked Questions</h2>
            <dl>
              {faqs.map((faq) => (
                <div key={faq.question} className="mb-6">
                  <dt className="font-semibold text-base not-prose mb-1">
                    {faq.question}
                  </dt>
                  <dd className="text-[var(--muted-foreground)] not-prose">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}
      </section>
    </div>
  )
}
