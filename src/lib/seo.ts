import type { Metadata } from "next"

export const SITE_NAME = "TuneTapper"
export const SITE_URL = "https://tunetapper.com"

export function generateMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string
  description: string
  path: string
  noIndex?: boolean
}): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`
  const url = `${SITE_URL}${path}`

  return {
    title: fullTitle,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

export function generateBpmPageMetadata(bpm: number): Metadata {
  return generateMetadata({
    title: `${bpm} BPM Delay Times & Bars Calculator`,
    description: `Calculate delay times, bar durations, and discover genres for ${bpm} BPM. Get precise ms values for 1/4, 1/8, 1/16 notes with dotted and triplet variants.`,
    path: `/bpm/${bpm}`,
  })
}

export function generateBarsPageMetadata(bars: number, bpm: number): Metadata {
  const seconds = (bars * 4 * 60) / bpm
  const mins = Math.floor(seconds / 60)
  const secs = Math.round(seconds % 60)
  const durationStr = mins > 0 ? `${mins}m ${secs}s` : `${secs} seconds`
  return generateMetadata({
    title: `${bars} Bars at ${bpm} BPM = ${durationStr}`,
    description: `${bars} bars at ${bpm} BPM lasts exactly ${durationStr} (${seconds.toFixed(2)}s). See the full reference table for all bar lengths at ${bpm} BPM.`,
    path: `/bars/${bars}-at-${bpm}-bpm`,
  })
}

export function generateCamelotPageMetadata(key: string): Metadata {
  return generateMetadata({
    title: `${key.toUpperCase()} Camelot Key - Compatible Keys for Mixing`,
    description: `Find compatible keys for ${key.toUpperCase()} on the Camelot Wheel. Discover perfect harmonic mixing combinations for DJs.`,
    path: `/camelot/${key.toLowerCase()}`,
  })
}

export function generateFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

export function generateToolSchema({
  name,
  description,
  url,
}: {
  name: string
  description: string
  url: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: `${SITE_URL}${url}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  }
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description:
      "Free music production tools for DJs and producers. Calculate BPM delay times, find compatible keys, convert bars to time, and more.",
    sameAs: [],
  }
}

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Free music production tools for DJs and producers.",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}

export function generateBreadcrumbSchema(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}
