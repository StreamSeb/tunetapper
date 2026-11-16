// Google Analytics 4 Event Tracking

import { track } from "@vercel/analytics"

type EventParams = Record<string, string | number | boolean>

export function trackEvent(eventName: string, params?: EventParams) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, params)
  }
}

/**
 * Send an event to GA4 (consent-gated) and Vercel Web Analytics (cookieless,
 * counts every visitor). Use for events we want a true count of.
 */
export function trackEverywhere(eventName: string, params?: EventParams) {
  track(eventName, params)
  trackEvent(eventName, params)
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

  // Key Analyzer
  keyAnalyzerStarted: (fileType: string) => {
    trackEvent("key_analyzer_started", { file_type: fileType })
  },

  keyAnalyzerCompleted: (camelotKey: string, confidence: number) => {
    trackEvent("key_analyzer_completed", { camelot_key: camelotKey, confidence })
  },

  keyAnalyzerFailed: (reason: string) => {
    trackEvent("key_analyzer_failed", { reason })
  },

  // BPM Detector - file mode
  bpmFileAnalyzed: (bpm: number, fileType: string) => {
    trackEverywhere("bpm_file_analyzed", { bpm, file_type: fileType })
  },

  bpmFileFailed: (reason: string) => {
    trackEverywhere("bpm_file_failed", { reason })
  },

  // Set Planner (GA4 + Vercel)
  setPlannerFilesAdded: (count: number, source: string) => {
    trackEverywhere("set_planner_files_added", { count, source })
  },

  setPlannerAnalysisDone: (tracks: number, failed: number, seconds: number) => {
    trackEverywhere("set_planner_analysis_done", { tracks, failed, seconds })
  },

  setPlannerTrackFailed: (reason: string) => {
    trackEvent("set_planner_track_failed", { reason })
  },

  setPlannerReordered: (mode: string) => {
    trackEverywhere("set_planner_reordered", { mode })
  },

  setPlannerExported: (format: string, tracks: number) => {
    trackEverywhere("set_planner_exported", { format, tracks })
  },

  // BPM Transition
  bpmTransitionCalculated: (fromBpm: number, toBpm: number) => {
    trackEvent("bpm_transition_calculated", { from_bpm: fromBpm, to_bpm: toBpm })
  },

  // Rhythm Game
  rhythmGameCompleted: (score: number, difficulty: string) => {
    trackEvent("rhythm_game_completed", { score, difficulty })
  },

  rhythmGameShared: (method: string, score: number) => {
    trackEvent("rhythm_game_shared", { method, score })
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

  // Studio Builder
  studioBuildGenerated: (budget: number, useCase: string) => {
    trackEvent("studio_build_generated", { budget, use_case: useCase })
  },

  affiliateLinkClicked: (merchant: string, itemId: string) => {
    trackEvent("affiliate_link_clicked", { merchant, item_id: itemId })
  },

  // Buy Me a Coffee link
  supportClicked: (placement: string) => {
    trackEvent("support_clicked", { placement })
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
