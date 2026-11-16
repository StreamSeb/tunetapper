"use client"

import dynamic from "next/dynamic"

// The planner restores the last set from localStorage on load, so it renders
// on the client only. The placeholder keeps the drop zone's height to avoid
// a layout shift.
export const SetPlannerLoader = dynamic(
  () => import("./set-planner-tool").then((m) => m.SetPlannerTool),
  {
    ssr: false,
    loading: () => (
      <div
        className="mb-6 h-[22rem] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--muted)]/30"
        aria-hidden="true"
      />
    ),
  }
)
