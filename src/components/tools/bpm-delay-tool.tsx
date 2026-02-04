"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import { Copy, Check, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getAllDelayTimes, formatMs, getGenreForBpm } from "@/lib/calculations"

export function BpmDelayTool() {
  const [bpm, setBpm] = useState(128)
  const [copiedValue, setCopiedValue] = useState<string | null>(null)

  const delayTimes = getAllDelayTimes(bpm)
  const genres = getGenreForBpm(bpm)

  const copyToClipboard = useCallback(async (value: number, id: string) => {
    try {
      await navigator.clipboard.writeText(value.toFixed(2))
      setCopiedValue(id)
      setTimeout(() => setCopiedValue(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold lg:text-4xl">
          BPM Delay Time Calculator
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Calculate precise delay times in milliseconds for any BPM. Perfect for
          syncing delay effects to your track&apos;s tempo.
        </p>
      </div>

      {/* Input Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Enter BPM</CardTitle>
          <CardDescription>
            Type your tempo or use the arrows to adjust
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-xs">
              <Label htmlFor="bpm" className="sr-only">
                BPM
              </Label>
              <Input
                id="bpm"
                type="number"
                min={20}
                max={300}
                value={bpm}
                onChange={(e) =>
                  setBpm(Math.min(300, Math.max(20, Number(e.target.value) || 20)))
                }
                className="text-2xl font-bold h-14 text-center"
              />
            </div>
            <span className="text-lg text-[var(--muted-foreground)]">BPM</span>
          </div>
          {genres.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-[var(--muted-foreground)]">
                Common genres:
              </span>
              {genres.map((genre) => (
                <Badge key={genre} variant="secondary">
                  {genre}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Delay Times for {bpm} BPM</CardTitle>
          <CardDescription>
            Click any value to copy it to your clipboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Note Value</TableHead>
                <TableHead className="text-right">Normal</TableHead>
                <TableHead className="text-right">Dotted</TableHead>
                <TableHead className="text-right">Triplet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {delayTimes.map((row) => (
                <TableRow key={row.name}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-mono"
                          onClick={() =>
                            copyToClipboard(row.normal, `${row.name}-normal`)
                          }
                        >
                          {formatMs(row.normal)}
                          {copiedValue === `${row.name}-normal` ? (
                            <Check className="ml-1 h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="ml-1 h-3 w-3 opacity-50" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Click to copy</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-mono"
                          onClick={() =>
                            copyToClipboard(row.dotted, `${row.name}-dotted`)
                          }
                        >
                          {formatMs(row.dotted)}
                          {copiedValue === `${row.name}-dotted` ? (
                            <Check className="ml-1 h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="ml-1 h-3 w-3 opacity-50" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Click to copy</TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-right">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="font-mono"
                          onClick={() =>
                            copyToClipboard(row.triplet, `${row.name}-triplet`)
                          }
                        >
                          {formatMs(row.triplet)}
                          {copiedValue === `${row.name}-triplet` ? (
                            <Check className="ml-1 h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="ml-1 h-3 w-3 opacity-50" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Click to copy</TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Related Links */}
      <Card>
        <CardHeader>
          <CardTitle>Related Tools & References</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" asChild>
            <Link href={`/bpm/${bpm}`}>
              View {bpm} BPM Reference Page
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools/tap-tempo">Find BPM with Tap Tempo</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools/bars-to-time">Calculate Bars Duration</Link>
          </Button>
        </CardContent>
      </Card>

      {/* SEO Content */}
      <section className="mt-12 prose prose-neutral dark:prose-invert max-w-none">
        <h2>How to Use Delay Times</h2>
        <p>
          Delay times synchronized to your track&apos;s BPM create rhythmic echoes
          that enhance your music. Here&apos;s how to use them:
        </p>
        <ul>
          <li>
            <strong>Normal values</strong> create echoes that land exactly on
            beat divisions
          </li>
          <li>
            <strong>Dotted values</strong> (1.5x normal) create a
            &quot;ping-pong&quot; or shuffle feel
          </li>
          <li>
            <strong>Triplet values</strong> (2/3 normal) create a swinging,
            waltz-like rhythm
          </li>
        </ul>
        <p>
          Use 1/4 note delays for obvious rhythmic echoes, 1/8 or 1/16 for
          subtle thickening, and 1/32 for reverb-like effects.
        </p>
      </section>
    </div>
  )
}
