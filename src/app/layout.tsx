import type { Metadata } from "next"
import "./globals.css"
import { Analytics as VercelAnalytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SiteChrome } from "@/components/layout/site-chrome"
import { CookieConsent } from "@/components/cookie-consent/cookie-consent"
import { Analytics } from "@/components/ads/analytics"
import { TooltipProvider } from "@/components/ui/tooltip"
import { generateWebSiteSchema } from "@/lib/seo"

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
  other: {
    // Ownership proof for the Awin publisher application - they check the page
    // source for "Awin" to confirm we control this domain. Keep until the
    // account is approved and both advertisers are live; harmless if left.
    "awin-verification": "Awin",
    // Same for FlexOffers, which we joined to reach Sweetwater for the studio
    // builder. FlexOffers only asks for it on the home page, but emitting it
    // from the layout covers that and costs nothing.
    "fo-verify": "6796302f-0f18-4bbd-8f0f-de06f45ee248",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tunetapper.com",
    siteName: "TuneTapper",
    title: "TuneTapper - Free Music Production Tools",
    description:
      "Free music production tools for DJs and producers. Calculate BPM delay times, find compatible keys, and more.",
    images: [
      {
        url: "/og/default.png",
        width: 1200,
        height: 630,
        alt: "TuneTapper - free tools for DJs and music producers",
      },
    ],
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebSiteSchema()) }}
        />
      </head>
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
            <SiteChrome>
              <Header />
            </SiteChrome>
            <main className="flex-1">{children}</main>
            <SiteChrome>
              <Footer />
              <CookieConsent />
            </SiteChrome>
            <Analytics />
            <VercelAnalytics />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
