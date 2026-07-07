import type { Metadata } from "next"
import Link from "next/link"
import { Breadcrumbs } from "@/components/layout/breadcrumbs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { generateMetadata as genMeta } from "@/lib/seo"

export const metadata: Metadata = genMeta({
  title: "Embed a Free BPM Counter Widget on Your Site",
  description:
    "Add a free tap tempo / BPM counter widget to your website or blog with one iframe snippet. No API key, no tracking, works in any CMS - attribution link required.",
  path: "/tools/embed",
  image: "/og/embed.png",
})

const SNIPPET = `<iframe
  src="https://tunetapper.com/embed/tap-tempo"
  width="100%" height="340"
  style="border:0;border-radius:12px"
  title="Tap Tempo - BPM counter by TuneTapper"
  loading="lazy"></iframe>
<p>
  Widget by
  <a href="https://tunetapper.com/tools/tap-tempo">TuneTapper Tap BPM Counter</a>
</p>`

export default function EmbedDocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 lg:py-12">
      <Breadcrumbs
        items={[
          { name: "Tools", path: "/tools" },
          { name: "Embed Widgets", path: "/tools/embed" },
        ]}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold lg:text-4xl">
          Embed a BPM Counter on Your Site
        </h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)]">
          Add the TuneTapper tap tempo widget to any website, blog post, or
          teaching page with one copy-paste snippet. Free, no API key, no
          cookies, no tracking scripts.
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Live preview</CardTitle>
          <CardDescription>
            This is the exact widget your visitors will see
          </CardDescription>
        </CardHeader>
        <CardContent>
          <iframe
            src="/embed/tap-tempo"
            width="100%"
            height="340"
            style={{ border: 0, borderRadius: 12 }}
            title="Tap Tempo - BPM counter by TuneTapper"
            loading="lazy"
          />
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>The snippet</CardTitle>
          <CardDescription>
            Paste this into your page&apos;s HTML (works in WordPress, Ghost,
            Squarespace code blocks, and plain HTML)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--muted)] p-4 text-sm">
            <code>{SNIPPET}</code>
          </pre>
        </CardContent>
      </Card>

      <section className="prose prose-neutral dark:prose-invert max-w-none">
        <h2>Terms</h2>
        <ul>
          <li>
            The widget is free for any website, commercial or personal.
          </li>
          <li>
            <strong>Keep the attribution link</strong> (the &quot;Widget by
            TuneTapper&quot; line below the iframe). It is the only thing we
            ask for in return.
          </li>
          <li>
            Don&apos;t present the widget as your own product or paywall it.
          </li>
        </ul>
        <h2>Details</h2>
        <ul>
          <li>
            No cookies, no analytics scripts, no consent banner inside the
            widget - it is safe to embed on GDPR-sensitive pages.
          </li>
          <li>
            The widget adapts to a width of 300 px and up; height 340 px is
            comfortable, 300 px minimum.
          </li>
          <li>
            Want a different tool as a widget (Camelot wheel, metronome,
            rhythm test)? <Link href="/contact">Tell us</Link> - embeds are
            added by request.
          </li>
        </ul>
      </section>
    </div>
  )
}
