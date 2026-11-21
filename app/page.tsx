import type { Metadata } from "next"

import Banner from "@/app/components/landing/Banner"
import DynamicSection1 from "@/app/components/landing/DynamicSection1"
import DynamicSection2 from "@/app/components/landing/DynamicSection2"
import DynamicSection3 from "@/app/components/landing/DynamicSection3"
import JsonLd from "@/app/components/shared/JsonLd"
import {
  SITE_DESCRIPTION,
  SITE_TITLE,
  absoluteUrl,
  pageMetadata,
  salonJsonLd,
} from "@/lib/seo"
import { SALON_INFO } from "@/lib/site"

const base = pageMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
})

export const metadata: Metadata = {
  ...base,
  // The home page uses the full site title, without the " | SalonBook" suffix.
  title: { absolute: SITE_TITLE },
  openGraph: { ...base.openGraph, title: SITE_TITLE },
  twitter: { ...base.twitter, title: SITE_TITLE },
}

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SALON_INFO.name,
  url: absoluteUrl("/"),
  description: SITE_DESCRIPTION,
  publisher: { "@id": `${absoluteUrl("/")}#salon` },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${absoluteUrl("/services")}?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
}

export default function HomePage() {
  return (
    <main>
      <JsonLd data={[salonJsonLd(), websiteJsonLd]} />
      <Banner />
      <DynamicSection1 />
      <DynamicSection2 />
      <DynamicSection3 />
    </main>
  )
}
