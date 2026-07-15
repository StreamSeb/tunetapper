// Merchant link builder for the studio setup builder.
//
// Ships as plain search URLs. Once affiliate accounts exist (see
// docs/studio-builder-plan.md, Phase 3), setting the env vars below upgrades
// the links in place: Amazon gets the Associates tag, Gear4music/Thomann get
// wrapped in Awin deeplinks. No code changes needed at signup time.
//
//   NEXT_PUBLIC_AMAZON_ASSOC_TAG      Amazon Associates tracking ID
//   NEXT_PUBLIC_AWIN_AFFID            Awin publisher ID
//   NEXT_PUBLIC_AWIN_MID_GEAR4MUSIC   Awin merchant ID for Gear4music
//   NEXT_PUBLIC_AWIN_MID_THOMANN      Awin merchant ID for Thomann

export type Merchant = "amazon" | "gear4music" | "thomann"

export const MERCHANT_LABELS: Record<Merchant, string> = {
  amazon: "Amazon",
  gear4music: "Gear4music",
  thomann: "Thomann",
}

export const MERCHANTS: Merchant[] = ["amazon", "gear4music", "thomann"]

function awinDeeplink(merchantId: string | undefined, targetUrl: string): string {
  const affid = process.env.NEXT_PUBLIC_AWIN_AFFID
  if (!affid || !merchantId) return targetUrl
  return `https://www.awin1.com/cread.php?awinmid=${merchantId}&awinaffid=${affid}&ued=${encodeURIComponent(targetUrl)}`
}

export function merchantSearchUrl(merchant: Merchant, searchTerm: string): string {
  const q = encodeURIComponent(searchTerm)
  switch (merchant) {
    case "amazon": {
      const tag = process.env.NEXT_PUBLIC_AMAZON_ASSOC_TAG
      return `https://www.amazon.com/s?k=${q}${tag ? `&tag=${tag}` : ""}`
    }
    case "gear4music":
      return awinDeeplink(
        process.env.NEXT_PUBLIC_AWIN_MID_GEAR4MUSIC,
        `https://www.gear4music.com/search?search=${q}`
      )
    case "thomann":
      return awinDeeplink(
        process.env.NEXT_PUBLIC_AWIN_MID_THOMANN,
        `https://www.thomann.de/intl/search_dir.html?sw=${q}`
      )
  }
}

/** True once any affiliate program is configured - controls disclosure wording. */
export function hasAffiliateLinks(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_AMAZON_ASSOC_TAG || process.env.NEXT_PUBLIC_AWIN_AFFID
  )
}
