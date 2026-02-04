"use client"

import { useEffect, useState } from "react"
import Script from "next/script"
import { getConsentStatus, type ConsentStatus } from "@/components/cookie-consent/cookie-consent"

// Replace with your actual GA4 Measurement ID when you have it
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""

export function Analytics() {
  const [consent, setConsent] = useState<ConsentStatus>("pending")

  useEffect(() => {
    // Get initial consent status
    setConsent(getConsentStatus())

    // Listen for consent changes
    const handleConsentChange = (e: CustomEvent<ConsentStatus>) => {
      setConsent(e.detail)
    }

    window.addEventListener("consentChanged", handleConsentChange as EventListener)
    return () => {
      window.removeEventListener("consentChanged", handleConsentChange as EventListener)
    }
  }, [])

  // Only load GA4 if user accepted cookies and we have a measurement ID
  if (consent !== "accepted" || !GA_MEASUREMENT_ID) {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}
