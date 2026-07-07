"use client"

import { usePathname } from "next/navigation"

/**
 * Hides site chrome (header, footer, cookie banner) on /embed/* routes so
 * the widgets render bare inside third-party iframes.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith("/embed")) return null
  return <>{children}</>
}
