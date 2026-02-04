"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"

const navigation = [
  {
    name: "BPM Tools",
    href: "/bpm",
    children: [
      { name: "BPM Delay Calculator", href: "/tools/bpm-delay" },
      { name: "Tap Tempo", href: "/tools/tap-tempo" },
      { name: "BPM Reference", href: "/bpm" },
    ],
  },
  {
    name: "DJ Tools",
    href: "/tools/camelot",
    children: [
      { name: "Camelot Wheel", href: "/tools/camelot" },
      { name: "BPM Transition", href: "/tools/bpm-transition" },
      { name: "Key Reference", href: "/camelot" },
    ],
  },
  {
    name: "Time Tools",
    href: "/tools/bars-to-time",
    children: [
      { name: "Bars to Time", href: "/tools/bars-to-time" },
      { name: "Duration Reference", href: "/bars" },
    ],
  },
  {
    name: "Guides",
    href: "/guides",
    children: [
      { name: "Delay Times Explained", href: "/guides/delay-times-explained" },
      { name: "Camelot Wheel Guide", href: "/guides/camelot-wheel-guide" },
      { name: "BPM Genre Reference", href: "/guides/bpm-genres" },
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
                {item.children && (
                  <div className="pl-4 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block text-sm py-1",
                          pathname === child.href
                            ? "text-[var(--primary)]"
                            : "text-[var(--muted-foreground)]"
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
