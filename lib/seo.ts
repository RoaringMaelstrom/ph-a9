import type { Metadata } from "next"

import { SALON_INFO, SERVICE_CATEGORIES } from "@/lib/site"

/**
 * SEO helpers shared by the root layout, pages, robots.ts and sitemap.ts.
 *
 * Next merges `metadata` from nested segments *shallowly*: a page that sets
 * `openGraph` or `twitter` replaces the layout's object completely. So pages
 * build theirs with `pageMetadata()`, which always fills in the site name,
 * locale and the default share image.
 */

/** Absolute site origin, from NEXT_PUBLIC_APP_URL (falls back to localhost). */
export function siteUrl() {
  try {
    return new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  } catch {
    return new URL("http://localhost:3000")
  }
}

/** Absolute URL for a site path, e.g. `absoluteUrl("/services")`. */
export function absoluteUrl(path = "/") {
  return new URL(path, siteUrl()).toString()
}

export const SITE_TITLE = "SalonBook | Book Salon Appointments Online"

export const SITE_DESCRIPTION =
  "Book haircuts, hair coloring, facials, makeup, manicures and spa treatments online with SalonBook. Browse services and prices, request a time slot and pay securely."

export const SITE_KEYWORDS = [
  "salon booking",
  "online salon appointment",
  "beauty salon",
  "book haircut online",
  "hair coloring",
  "facial",
  "manicure and pedicure",
  "spa and massage",
  "makeup artist",
  "SalonBook",
]

/** Default share image (the home page banner photo, cropped to 1200×630). */
export const DEFAULT_OG_IMAGE = {
  url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&h=630&fit=crop&auto=format&q=80",
  width: 1200,
  height: 630,
  alt: "Stylist blow-drying a client's hair in a bright salon",
}

type PageMetadataInput = {
  /** Page title; the root layout's template adds " | SalonBook". */
  title: string
  description: string
  /** Canonical path, e.g. "/services". */
  path: string
  /** Share image; defaults to DEFAULT_OG_IMAGE. */
  image?: { url: string; width?: number; height?: number; alt: string }
  /** Set false for pages that shouldn't appear in search results. */
  index?: boolean
}

/** Title, description, canonical URL, Open Graph and Twitter card for a page. */
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  index = true,
}: PageMetadataInput): Metadata {
  const shareTitle = `${title} | ${SALON_INFO.name}`
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SALON_INFO.name,
      locale: "en_US",
      url: path,
      title: shareTitle,
      description,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: [image.url],
    },
    ...(!index && { robots: { index: false, follow: true } }),
  }
}

/** Robots value for private, signed-in-only pages. */
export const NO_INDEX: Metadata["robots"] = { index: false, follow: false }

/** schema.org BeautySalon describing the salon (home and About Us). */
export function salonJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": `${absoluteUrl("/")}#salon`,
    name: SALON_INFO.name,
    description: SALON_INFO.tagline,
    url: absoluteUrl("/"),
    image: DEFAULT_OG_IMAGE.url,
    telephone: SALON_INFO.phone,
    email: SALON_INFO.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: SALON_INFO.address[0],
      addressLocality: SALON_INFO.address[1],
    },
    openingHoursSpecification: [
      {
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "20:00",
      },
      { days: ["Saturday"], opens: "09:00", closes: "18:00" },
      { days: ["Sunday"], opens: "10:00", closes: "16:00" },
    ].map(({ days, opens, closes }) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: days,
      opens,
      closes,
    })),
    sameAs: Object.values(SALON_INFO.social),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Salon services",
      itemListElement: SERVICE_CATEGORIES.map((category) => ({
        "@type": "OfferCatalog",
        name: category,
        url: absoluteUrl(`/services?category=${encodeURIComponent(category)}`),
      })),
    },
  }
}

/** schema.org BreadcrumbList from `[name, path]` pairs. */
export function breadcrumbJsonLd(items: [name: string, path: string][]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], i) => ({
      "@type": "ListItem",
      position: i + 1,
      name,
      item: absoluteUrl(path),
    })),
  }
}
