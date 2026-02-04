import Link from "next/link"
import { Music } from "lucide-react"

const footerLinks = {
  tools: [
    { name: "BPM Delay Calculator", href: "/tools/bpm-delay" },
    { name: "Bars to Time", href: "/tools/bars-to-time" },
    { name: "Tap Tempo", href: "/tools/tap-tempo" },
    { name: "Camelot Wheel", href: "/tools/camelot" },
    { name: "BPM Transition", href: "/tools/bpm-transition" },
  ],
  references: [
    { name: "BPM Reference", href: "/bpm" },
    { name: "Bars Reference", href: "/bars" },
    { name: "Camelot Keys", href: "/camelot" },
  ],
  resources: [
    { name: "Delay Times Guide", href: "/guides/delay-times-explained" },
    { name: "Camelot Guide", href: "/guides/camelot-wheel-guide" },
    { name: "BPM by Genre", href: "/guides/bpm-genres" },
  ],
  legal: [
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy & Cookies", href: "/privacy" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--muted)]/30">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Music className="h-6 w-6 text-[var(--primary)]" />
              <span className="text-xl font-bold">TuneTapper</span>
            </Link>
            <p className="mt-3 text-sm text-[var(--muted-foreground)]">
              Free music production tools for DJs and producers. Calculate delay
              times, find compatible keys, and more.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-sm font-semibold">Tools</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.tools.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* References */}
          <div>
            <h3 className="text-sm font-semibold">References</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.references.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold">Guides</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold">Company</h3>
            <ul className="mt-3 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-[var(--border)] pt-8">
          <p className="text-center text-sm text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} TuneTapper. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
