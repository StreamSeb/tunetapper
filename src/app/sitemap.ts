import type { MetadataRoute } from "next"
import bpmData from "@/data/bpm-list.json"
import barsData from "@/data/bars-list.json"
import camelotData from "@/data/camelot-keys.json"
import guidesData from "@/data/guides.json"

const BASE_URL = "https://tunetapper.com"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ]

  // Tool pages
  const toolPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/tools/bpm-delay`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/bars-to-time`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/tap-tempo`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/camelot`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/tools/bpm-transition`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools/key-analyzer`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ]

  // Hub pages
  const hubPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/bpm`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/bars`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/camelot`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/guides`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]

  // BPM pages
  const bpmPages: MetadataRoute.Sitemap = bpmData.phase1.map((bpm) => ({
    url: `${BASE_URL}/bpm/${bpm}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  // Bars pages
  const barsPages: MetadataRoute.Sitemap = barsData.phase1.map(
    ({ bars, bpm }) => ({
      url: `${BASE_URL}/bars/${bars}-at-${bpm}-bpm`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })
  )

  // Camelot pages
  const camelotPages: MetadataRoute.Sitemap = camelotData.keys.map((key) => ({
    url: `${BASE_URL}/camelot/${key.toLowerCase()}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  // Guide pages
  const guidePages: MetadataRoute.Sitemap = guidesData.guides.map((guide) => ({
    url: `${BASE_URL}/guides/${guide.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [
    ...staticPages,
    ...toolPages,
    ...hubPages,
    ...bpmPages,
    ...barsPages,
    ...camelotPages,
    ...guidePages,
  ]
}
