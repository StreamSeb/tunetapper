// Google Analytics 4 Event Tracking

type EventParams = Record<string, string | number | boolean>

export function trackEvent(eventName: string, params?: EventParams) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params)
  }
}

// Tool-specific events
export const analytics = {
  // BPM Delay Calculator
  bpmDelayCalculated: (bpm: number) => {
    trackEvent("bpm_delay_calculated", { bpm })
  },

  // Bars to Time Calculator
  barsToTimeCalculated: (bars: number, bpm: number) => {
    trackEvent("bars_to_time_calculated", { bars, bpm })
  },

  // Tap Tempo
  tapTempoUsed: (bpm: number, tapCount: number) => {
    trackEvent("tap_tempo_used", { bpm, tap_count: tapCount })
  },

  tapTempoReset: () => {
    trackEvent("tap_tempo_reset")
  },

  // Camelot Tool
  camelotKeySelected: (key: string) => {
    trackEvent("camelot_key_selected", { key })
  },

  // BPM Transition
  bpmTransitionCalculated: (fromBpm: number, toBpm: number) => {
    trackEvent("bpm_transition_calculated", { from_bpm: fromBpm, to_bpm: toBpm })
  },

  // Copy actions
  valueCopied: (type: string, value: string) => {
    trackEvent("value_copied", { type, value })
  },

  // Guide engagement
  guideViewed: (slug: string) => {
    trackEvent("guide_viewed", { guide_slug: slug })
  },

  // Tool page views (more specific than page_view)
  toolUsed: (toolName: string) => {
    trackEvent("tool_used", { tool_name: toolName })
  },
}

// TypeScript declaration for gtag
declare global {
  interface Window {
    gtag: (
      command: "event" | "config" | "js",
      targetOrEvent: string | Date,
      params?: EventParams
    ) => void
  }
}
