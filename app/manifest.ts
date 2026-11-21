import type { MetadataRoute } from "next"

import { SITE_DESCRIPTION } from "@/lib/seo"
import { SALON_INFO } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SALON_INFO.name} | Salon Appointments`,
    short_name: SALON_INFO.name,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    categories: ["beauty", "lifestyle", "shopping"],
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  }
}
