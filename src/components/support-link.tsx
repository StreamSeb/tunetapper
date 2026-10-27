"use client"

import { Coffee } from "lucide-react"
import { track } from "@vercel/analytics"
import { analytics } from "@/lib/analytics"
import { cn } from "@/lib/utils"

export const SUPPORT_URL = "https://buymeacoffee.com/tunetapper"

/** Plain outbound link to the Buy Me a Coffee page. No widget script, so no consent needed. */
export function SupportLink({
  placement,
  className,
  children = "Buy me a coffee",
  icon = true,
}: {
  placement: string
  className?: string
  children?: React.ReactNode
  icon?: boolean
}) {
  return (
    <a
      href={SUPPORT_URL}
      target="_blank"
      rel="noopener"
      onClick={() => {
        track("support_clicked", { placement })
        analytics.supportClicked(placement)
      }}
      className={cn("inline-flex items-center gap-1.5", className)}
    >
      {icon && <Coffee className="h-4 w-4 shrink-0" aria-hidden="true" />}
      {children}
    </a>
  )
}

/** One quiet line under a tool's result. Sits after a card with mb-8, so it pulls up into that gap. */
export function ToolSupportNote({ tool, className }: { tool: string; className?: string }) {
  return (
    <p className={cn("-mt-4 mb-8 text-center text-sm text-[var(--muted-foreground)]", className)}>
      Free, with no sign-up and no ads. If it saved you time,{" "}
      <SupportLink
        placement={`tool_${tool}`}
        icon={false}
        className="inline text-[var(--foreground)] underline underline-offset-4 hover:text-[var(--primary)]"
      >
        buy me a coffee
      </SupportLink>
      .
    </p>
  )
}
