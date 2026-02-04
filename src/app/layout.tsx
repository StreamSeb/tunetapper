import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { CookieConsent } from "@/components/cookie-consent/cookie-consent"
import { Analytics } from "@/components/ads/analytics"
import { TooltipProvider } from "@/components/ui/tooltip"

export const metadata: Metadata = {
  title: {
    default: "TuneTapper - Free Music Production Tools",
    template: "%s | TuneTapper",
  },
  description:
    "Free music production tools for DJs and producers. Calculate BPM delay times, find compatible keys with the Camelot wheel, convert bars to time, and more.",
  keywords: [
    "BPM calculator",
    "delay time calculator",
    "tap tempo",
    "Camelot wheel",
    "DJ tools",
    "music production",
    "bars to time",
    "harmonic mixing",
  ],
  authors: [{ name: "TuneTapper" }],
  creator: "TuneTapper",
  metadataBase: new URL("https://tunetapper.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tunetapper.com",
    siteName: "TuneTapper",
    title: "TuneTapper - Free Music Production Tools",
    description:
      "Free music production tools for DJs and producers. Calculate BPM delay times, find compatible keys, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "TuneTapper - Free Music Production Tools",
    description:
      "Free music production tools for DJs and producers. Calculate BPM delay times, find compatible keys, and more.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen flex flex-col"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CookieConsent />
            <Analytics />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
