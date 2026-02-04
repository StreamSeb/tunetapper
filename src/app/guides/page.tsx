import type { Metadata } from "next"
import Link from "next/link"
import { BookOpen, Music, Disc, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import guidesData from "@/data/guides.json"

export const metadata: Metadata = {
  title: "Music Production & DJ Guides | TuneTapper",
  description: "Learn music production techniques, DJ mixing tips, and audio engineering concepts. In-depth guides on BPM, delay times, harmonic mixing, and more.",
  alternates: {
    canonical: "https://tunetapper.com/guides",
  },
  openGraph: {
    title: "Music Production & DJ Guides | TuneTapper",
    description: "Learn music production techniques, DJ mixing tips, and audio engineering concepts.",
    url: "https://tunetapper.com/guides",
    type: "website",
  },
}

const categoryIcons: Record<string, React.ReactNode> = {
  Production: <Music className="h-5 w-5" />,
  DJing: <Disc className="h-5 w-5" />,
  Reference: <BarChart3 className="h-5 w-5" />,
}

const categoryColors: Record<string, string> = {
  Production: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  DJing: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  Reference: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
}

export default function GuidesPage() {
  const { guides } = guidesData

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary)]/10 mb-6">
          <BookOpen className="h-8 w-8 text-[var(--primary)]" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Music Production & DJ Guides
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
          In-depth tutorials and reference guides to help you master music production, 
          DJing, and audio engineering concepts.
        </p>
      </div>

      {/* Guides Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {guides.map((guide) => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`}>
            <Card className="h-full transition-all hover:shadow-lg hover:border-[var(--primary)]/50 cursor-pointer group">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="secondary" 
                        className={categoryColors[guide.category] || ""}
                      >
                        <span className="mr-1.5">
                          {categoryIcons[guide.category]}
                        </span>
                        {guide.category}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl group-hover:text-[var(--primary)] transition-colors">
                      {guide.title}
                    </CardTitle>
                  </div>
                </div>
                <CardDescription className="text-base mt-2">
                  {guide.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm font-medium text-[var(--primary)] group-hover:underline">
                  Read guide →
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold mb-4">Looking for Tools?</h2>
        <p className="text-[var(--muted-foreground)] mb-6">
          Put your knowledge into practice with our free music tools.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            href="/tools/bpm-delay" 
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 transition-colors"
          >
            BPM Delay Calculator
          </Link>
          <Link 
            href="/tools/camelot" 
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 transition-colors"
          >
            Camelot Wheel
          </Link>
          <Link 
            href="/tools/tap-tempo" 
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 transition-colors"
          >
            Tap Tempo
          </Link>
        </div>
      </div>
    </div>
  )
}
