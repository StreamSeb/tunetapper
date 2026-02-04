"use client"

import Script from "next/script"

// Replace with your actual AdSense Publisher ID when approved
const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || ""

export function AdSenseScript() {
  // Don't load AdSense script if no publisher ID is configured
  if (!ADSENSE_PUBLISHER_ID) {
    return null
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
