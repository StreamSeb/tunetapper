"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Copy } from "lucide-react"
import { analytics } from "@/lib/analytics"
import { TAP_TEMPO_EMBED_SNIPPET } from "@/lib/embed"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

/** Points tap tempo visitors at the embeddable widget, with the snippet ready to copy. */
export function EmbedPromo() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(TAP_TEMPO_EMBED_SNIPPET)
      setCopied(true)
      analytics.valueCopied("embed_snippet", "tap-tempo")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Card id="embed">
      <CardHeader>
        <CardTitle>Put this tap tempo on your site</CardTitle>
        <CardDescription>
          Free for any website or blog. Paste one snippet: no API key, no cookies, no tracking.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="max-h-40 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4 text-xs">
          <code>{TAP_TEMPO_EMBED_SNIPPET}</code>
        </pre>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button onClick={handleCopy}>
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copied" : "Copy embed code"}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tools/embed">See the live preview and terms</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
