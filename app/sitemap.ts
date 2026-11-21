import type { MetadataRoute } from "next"

import { absoluteUrl } from "@/lib/seo"
import { SERVICE_CATEGORIES, categoryHref } from "@/lib/site"

/**
 * Public, indexable pages only. Service details (/services/:id) need a
 * session (proxy.ts redirects crawlers to sign-in), so they aren't listed;
 * the services are reachable through the category pages instead.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "daily", priority: 1 },
    {
      url: absoluteUrl("/services"),
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...SERVICE_CATEGORIES.map((category) => ({
      url: absoluteUrl(categoryHref(category)),
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    {
      url: absoluteUrl("/about-us"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/sign-up"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/sign-in"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]
}
