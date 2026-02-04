"use client"

import { useEffect, useState } from "react"
import { getConsentStatus, type ConsentStatus } from "@/components/cookie-consent/cookie-consent"

// Replace with your actual AdSense Publisher ID when approved
const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || ""

interface AdSlotProps {
  slot: string
  format?: "auto" | "rectangle" | "horizontal" | "vertical"
  className?: string
}

export function AdSlot({ slot, format = "auto", className = "" }: AdSlotProps) {
  const [consent, setConsent] = useState<ConsentStatus>("pending")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setConsent(getConsentStatus())

    const handleConsentChange = (e: CustomEvent<ConsentStatus>) => {
      setConsent(e.detail)
    }

    window.addEventListener("consentChanged", handleConsentChange as EventListener)
    return () => {
      window.removeEventListener("consentChanged", handleConsentChange as EventListener)
    }
  }, [])

  // Don't render anything on server or if no publisher ID
  if (!mounted || !ADSENSE_PUBLISHER_ID) {
    return (
      <div
        className={`bg-[var(--muted)] rounded-lg flex items-center justify-center text-[var(--muted-foreground)] text-sm ${className}`}
        style={{ minHeight: "90px" }}
      >
        {/* Placeholder for ad - will show actual ads when AdSense is configured */}
        <span className="opacity-50">Ad Space</span>
      </div>
    )
  }

  // Determine ad personalization based on consent
  const personalized = consent === "accepted"

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
        data-ad-personalization={personalized ? "true" : "false"}
      />
    </div>
  )
}
