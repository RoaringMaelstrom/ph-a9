import type { MetadataRoute } from "next"

import { absoluteUrl } from "@/lib/seo"

/** Private, signed-in-only and API routes are kept out of search engines. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/payment/", "/account-blocked"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  }
}
