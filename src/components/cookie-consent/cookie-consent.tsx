"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export type ConsentStatus = "pending" | "accepted" | "declined"

const CONSENT_KEY = "tunetapper_cookie_consent"

export function getConsentStatus(): ConsentStatus {
  if (typeof window === "undefined") return "pending"
  const stored = localStorage.getItem(CONSENT_KEY)
  if (stored === "accepted" || stored === "declined") return stored
  return "pending"
}

export function setConsentStatus(status: "accepted" | "declined") {
  if (typeof window === "undefined") return
  localStorage.setItem(CONSENT_KEY, status)
  // Dispatch event so Analytics component can react
  window.dispatchEvent(new CustomEvent("consentChanged", { detail: status }))
}

export function CookieConsent() {
  const [status, setStatus] = useState<ConsentStatus>("pending")
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const currentStatus = getConsentStatus()
    setStatus(currentStatus)
    // Only show banner if user hasn't made a choice
    if (currentStatus === "pending") {
      // Small delay for better UX
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    setConsentStatus("accepted")
    setStatus("accepted")
    setVisible(false)
  }

  const handleDecline = () => {
    setConsentStatus("declined")
    setStatus("declined")
    setVisible(false)
  }

  if (!visible || status !== "pending") return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 pr-8">
              <p className="text-sm text-[var(--card-foreground)]">
                We use cookies to personalize ads and analyze traffic. You can
                choose to accept personalized ads or use the site with
                non-personalized ads only.{" "}
                <Link
                  href="/privacy"
                  className="underline hover:text-[var(--primary)]"
                >
                  Read our Privacy & Cookie Policy
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDecline}>
                Decline
              </Button>
              <Button size="sm" onClick={handleAccept}>
                Accept
              </Button>
            </div>
            <button
              onClick={handleDecline}
              className="absolute right-6 top-4 sm:hidden text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
