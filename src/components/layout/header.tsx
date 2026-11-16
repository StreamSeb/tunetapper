"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  ArrowLeftRight,
  BookOpen,
  Calculator,
  Clock,
  Disc3,
  Gamepad2,
  Gauge,
  Hourglass,
  KeyboardMusic,
  KeyRound,
  LayoutGrid,
  Menu,
  Mic,
  Music,
  Pointer,
  Speaker,
  X,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { SupportLink } from "@/components/support-link"

type NavLink = { name: string; href: string; icon: LucideIcon }

// The most used tools, picked from GA4 and Search Console data.
// Shown first in the mobile menu; revisit when the analytics reports shift.
const popularTools: NavLink[] = [
  { name: "BPM Detector", href: "/tools/bpm-detector", icon: Mic },
  { name: "Key Finder", href: "/tools/key-analyzer", icon: KeyRound },
  { name: "Camelot Wheel", href: "/tools/camelot", icon: Disc3 },
  { name: "Rhythm Test", href: "/tools/rhythm-game", icon: Gamepad2 },
]

const navigation: { name: string; href: string; children: NavLink[] }[] = [
  {
    name: "All Tools",
    href: "/tools",
    children: [
      { name: "All Tools", href: "/tools", icon: LayoutGrid },
      { name: "Key Finder", href: "/tools/key-analyzer", icon: KeyRound },
      { name: "Camelot Wheel", href: "/tools/camelot", icon: Disc3 },
      { name: "BPM Delay Calculator", href: "/tools/bpm-delay", icon: Calculator },
      { name: "Rhythm Test", href: "/tools/rhythm-game", icon: Gamepad2 },
      { name: "Studio Setup Builder", href: "/tools/studio-builder", icon: Speaker },
    ],
  },
  {
    name: "BPM Tools",
    href: "/bpm",
    children: [
      { name: "BPM Delay Calculator", href: "/tools/bpm-delay", icon: Calculator },
      { name: "Tap Tempo", href: "/tools/tap-tempo", icon: Pointer },
      { name: "BPM Detector (Mic)", href: "/tools/bpm-detector", icon: Mic },
      { name: "Rhythm Test", href: "/tools/rhythm-game", icon: Gamepad2 },
      { name: "BPM Reference", href: "/bpm", icon: Gauge },
    ],
  },
  {
    name: "DJ Tools",
    href: "/tools/camelot",
    children: [
      { name: "Camelot Wheel", href: "/tools/camelot", icon: Disc3 },
      { name: "Key Finder", href: "/tools/key-analyzer", icon: KeyRound },
      { name: "BPM Transition", href: "/tools/bpm-transition", icon: ArrowLeftRight },
      { name: "Studio Setup Builder", href: "/tools/studio-builder", icon: Speaker },
      { name: "Key Reference", href: "/camelot", icon: KeyboardMusic },
    ],
  },
  {
    name: "Time Tools",
    href: "/tools/bars-to-time",
    children: [
      { name: "Bars to Time", href: "/tools/bars-to-time", icon: Clock },
      { name: "Duration Reference", href: "/bars", icon: Hourglass },
    ],
  },
  {
    name: "Guides",
    href: "/guides",
    children: [
      { name: "Delay Times Explained", href: "/guides/delay-times-explained", icon: BookOpen },
      { name: "Camelot Wheel Guide", href: "/guides/camelot-wheel-guide", icon: BookOpen },
      { name: "BPM Genre Reference", href: "/guides/bpm-genres", icon: BookOpen },
    ],
  },
]

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--background)]/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Music className="h-6 w-6 text-[var(--primary)]" />
          <span className="text-xl font-bold">TuneTapper</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <div key={item.name} className="relative group">
              <Link
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[var(--primary)]",
                  pathname.startsWith(item.href)
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)]"
                )}
              >
                {item.name}
              </Link>
              {item.children && (
                <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="rounded-lg border border-[var(--border)] bg-[var(--popover)] p-2 shadow-lg min-w-[200px]">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm transition-colors hover:bg-[var(--accent)]",
                          pathname === child.href
                            ? "bg-[var(--accent)] text-[var(--accent-foreground)]"
                            : "text-[var(--popover-foreground)]"
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <SupportLink
            placement="header"
            className="rounded-md px-2 py-1.5 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
          >
            <span className="sr-only sm:not-sr-only">Buy me a coffee</span>
          </SupportLink>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--border)]">
          <div className="px-4 py-3 space-y-3">
            <div className="pb-3 border-b border-[var(--border)]">
              <p className="py-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Popular tools
              </p>
              <div className="grid grid-cols-2 gap-2">
                {popularTools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors hover:bg-[var(--accent)]",
                      pathname === tool.href
                        ? "border-[var(--primary)] text-[var(--primary)]"
                        : "border-[var(--border)] text-[var(--foreground)]"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <tool.icon
                      className="h-4 w-4 shrink-0 text-[var(--primary)]"
                      aria-hidden="true"
                    />
                    {tool.name}
                  </Link>
                ))}
              </div>
            </div>
            {navigation.map((item) => (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "block text-base font-medium py-2",
                    pathname.startsWith(item.href)
                      ? "text-[var(--primary)]"
                      : "text-[var(--muted-foreground)]"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
                <div className="pl-4 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-2.5 text-sm py-1.5",
                        pathname === child.href
                          ? "text-[var(--primary)]"
                          : "text-[var(--muted-foreground)]"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <child.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
