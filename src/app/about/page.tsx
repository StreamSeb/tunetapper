import Link from "next/link"
import type { Metadata } from "next"
import { Music, Zap, Heart, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "About TuneTapper",
  description:
    "Learn about TuneTapper - free music production tools for DJs and producers. Our mission is to provide useful, fast, and accessible tools for the music community.",
}

const features = [
  {
    icon: Zap,
    title: "Fast & Free",
    description:
      "All tools load instantly and are completely free to use. No sign-up, no paywalls.",
  },
  {
    icon: Code,
    title: "Open & Accessible",
    description:
      "Built with accessibility in mind. Works on all devices, all browsers, all screen sizes.",
  },
  {
    icon: Heart,
    title: "Made for Musicians",
    description:
      "Every tool is designed by music makers, for music makers. We understand what you need.",
  },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] p-3 text-[var(--primary-foreground)] mb-4">
          <Music className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold lg:text-4xl">About TuneTapper</h1>
        <p className="mt-3 text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
          Free tools for DJs, producers, and musicians. Calculate delay times,
          find compatible keys, convert bars to time, and more.
        </p>
      </div>

      {/* Mission */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Mission</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-neutral dark:prose-invert">
          <p>
            TuneTapper was created to provide musicians with the quick
            calculations and references they need, right when they need them.
          </p>
          <p>
            Whether you&apos;re setting up delay times in your DAW, planning a DJ
            set, or figuring out how long a section of bars will last, our tools
            are designed to give you answers instantly.
          </p>
          <p>
            We believe essential music tools should be free, fast, and work
            everywhere. No downloads, no accounts, no complications.
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <div className="rounded-lg bg-[var(--primary)] p-2 w-fit text-[var(--primary-foreground)]">
                <feature.icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-lg mt-3">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Tools Overview */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Our Tools</CardTitle>
          <CardDescription>
            Everything you need for music production and DJing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li>
              <Link
                href="/tools/bpm-delay"
                className="font-medium hover:underline"
              >
                BPM Delay Calculator
              </Link>
              <span className="text-[var(--muted-foreground)]">
                {" "}
                - Calculate delay times for any tempo
              </span>
            </li>
            <li>
              <Link
                href="/tools/bars-to-time"
                className="font-medium hover:underline"
              >
                Bars to Time
              </Link>
              <span className="text-[var(--muted-foreground)]">
                {" "}
                - Convert bars to actual duration
              </span>
            </li>
            <li>
              <Link
                href="/tools/tap-tempo"
                className="font-medium hover:underline"
              >
                Tap Tempo
              </Link>
              <span className="text-[var(--muted-foreground)]">
                {" "}
                - Find the BPM of any song by tapping
              </span>
            </li>
            <li>
              <Link
                href="/tools/camelot"
                className="font-medium hover:underline"
              >
                Camelot Wheel
              </Link>
              <span className="text-[var(--muted-foreground)]">
                {" "}
                - Find compatible keys for harmonic mixing
              </span>
            </li>
            <li>
              <Link
                href="/tools/bpm-transition"
                className="font-medium hover:underline"
              >
                BPM Transition Helper
              </Link>
              <span className="text-[var(--muted-foreground)]">
                {" "}
                - Plan smooth tempo transitions
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-xl font-bold mb-4">Ready to Get Started?</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/tools/bpm-delay">Try the BPM Calculator</Link>
          </Button>
          <Button variant="outline" asChild size="lg">
            <Link href="/contact">Get in Touch</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
