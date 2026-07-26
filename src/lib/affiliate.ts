// Merchant link builder for the studio setup builder.
//
// Every item in src/data/gear.json lists the merchants that actually stock it.
// Not all merchants carry everything - Thomann does not sell Pioneer DJ
// hardware, for example - so links are only rendered for merchants present on
// the item. Where a verified product path is known we deep-link straight to the
// product page; otherwise we fall back to the merchant's search results, which
// still tracks and still pays commission.
//
// Ships as plain merchant URLs. Setting the env vars below upgrades the links in
// place - no code changes needed at signup time:
//
//   NEXT_PUBLIC_AWIN_AFFID            Awin publisher ID
//   NEXT_PUBLIC_AWIN_MID_GEAR4MUSIC   Awin merchant ID for Gear4music
//   NEXT_PUBLIC_AWIN_MID_THOMANN      Awin merchant ID for Thomann
//   NEXT_PUBLIC_AMAZON_ASSOC_TAG      Amazon Associates tracking ID
//   NEXT_PUBLIC_AMAZON_HOST           Amazon marketplace host (default amazon.de)
//
// Note: NEXT_PUBLIC_* values are inlined at build time, so changing an ID
// requires a redeploy, not just an env update.

export type Merchant = "thomann" | "gear4music" | "amazon"

/** One merchant's listing for an item. `slug`/`path` deep-link; `search` is the fallback. */
export interface MerchantListing {
  /** Thomann product slug, e.g. "sennheiser_hd_25.htm" */
  slug?: string
  /** Gear4music product path, e.g. "PA-DJ-and-Lighting/Sennheiser-HD-25-Headphones/1GCI" */
  path?: string
  /** Search term used when no direct product URL is known */
  search?: string
  /** This merchant's own price for one unit, in EUR, when known */
  priceEur?: number
  /** ISO date the price was last confirmed against the merchant's page */
  verified?: string
}

export type MerchantListings = Partial<Record<Merchant, MerchantListing>>

export const MERCHANT_LABELS: Record<Merchant, string> = {
  thomann: "Thomann",
  gear4music: "Gear4music",
  amazon: "Amazon",
}

/** Render order - launch partners first, Amazon last. */
export const MERCHANTS: Merchant[] = ["thomann", "gear4music", "amazon"]

function awinDeeplink(merchantId: string | undefined, targetUrl: string): string {
  const affid = process.env.NEXT_PUBLIC_AWIN_AFFID
  if (!affid || !merchantId) return targetUrl
  return `https://www.awin1.com/cread.php?awinmid=${merchantId}&awinaffid=${affid}&ued=${encodeURIComponent(targetUrl)}`
}

/**
 * Thomann geo-redirects /intl/ to the visitor's local storefront, so a single
 * URL lands everyone on their own currency and stock.
 */
function thomannUrl(listing: MerchantListing): string {
  const target = listing.slug
    ? `https://www.thomann.de/intl/${listing.slug}`
    : `https://www.thomann.de/intl/search_dir.html?sw=${encodeURIComponent(listing.search ?? "")}`
  return awinDeeplink(process.env.NEXT_PUBLIC_AWIN_MID_THOMANN, target)
}

function gear4musicUrl(listing: MerchantListing): string {
  const target = listing.path
    ? `https://www.gear4music.com/${listing.path}`
    : `https://www.gear4music.com/search?search=${encodeURIComponent(listing.search ?? "")}`
  return awinDeeplink(process.env.NEXT_PUBLIC_AWIN_MID_GEAR4MUSIC, target)
}

function amazonUrl(listing: MerchantListing): string {
  // Associates tags are per-marketplace, so the host and the tag travel together.
  const host = process.env.NEXT_PUBLIC_AMAZON_HOST ?? "amazon.de"
  const tag = process.env.NEXT_PUBLIC_AMAZON_ASSOC_TAG
  const q = encodeURIComponent(listing.search ?? "")
  return `https://www.${host}/s?k=${q}${tag ? `&tag=${tag}` : ""}`
}

export function merchantUrl(merchant: Merchant, listing: MerchantListing): string {
  switch (merchant) {
    case "thomann":
      return thomannUrl(listing)
    case "gear4music":
      return gear4musicUrl(listing)
    case "amazon":
      return amazonUrl(listing)
  }
}

export interface MerchantOffer {
  merchant: Merchant
  label: string
  url: string
  /** Total price for the quantity the build needs, when this merchant's price is known */
  totalEur: number | null
  /** True when this is the cheapest of the offers that have a known price */
  cheapest: boolean
  /** True when we link to the exact product page rather than a search */
  direct: boolean
}

/**
 * Builds the offer list for one item: one entry per merchant that stocks it,
 * priced for `qty` units, cheapest known price flagged.
 */
export function offersFor(listings: MerchantListings, qty: number): MerchantOffer[] {
  const offers = MERCHANTS.filter((m) => listings[m]).map((merchant) => {
    const listing = listings[merchant]!
    return {
      merchant,
      label: MERCHANT_LABELS[merchant],
      url: merchantUrl(merchant, listing),
      totalEur: listing.priceEur != null ? round2(listing.priceEur * qty) : null,
      cheapest: false,
      direct: Boolean(listing.slug || listing.path),
    }
  })

  const priced = offers.filter((o) => o.totalEur != null)
  if (priced.length > 1) {
    const min = Math.min(...priced.map((o) => o.totalEur!))
    // Only call something "cheapest" when there is a real difference to report.
    if (priced.some((o) => o.totalEur! > min)) {
      for (const o of priced) if (o.totalEur === min) o.cheapest = true
    }
  }
  return offers
}

/** Largest percentage gap between known merchant prices, or null if nothing to compare. */
export function priceSpread(offers: MerchantOffer[]): { minEur: number; maxEur: number } | null {
  const prices = offers.map((o) => o.totalEur).filter((p): p is number => p != null)
  if (prices.length < 2) return null
  const minEur = Math.min(...prices)
  const maxEur = Math.max(...prices)
  return maxEur > minEur ? { minEur, maxEur } : null
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/** True once any affiliate program is configured - controls disclosure wording. */
export function hasAffiliateLinks(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_AWIN_AFFID || process.env.NEXT_PUBLIC_AMAZON_ASSOC_TAG
  )
}
