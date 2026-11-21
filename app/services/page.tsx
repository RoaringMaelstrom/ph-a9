import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { CloudOffIcon, SearchXIcon, SparklesIcon } from "lucide-react"

import { getBrowseServices } from "@/lib/api"
import { pageMetadata } from "@/lib/seo"
import { categoryHref } from "@/lib/site"
import {
  filtersToSearchParams,
  hasActiveFilters,
  paginate,
  parseServiceFilters,
} from "@/lib/service-filters"
import type { ServiceFilters } from "@/app/components/types/service"
import { Button } from "@/components/ui/button"
import SectionMessage from "@/app/components/shared/SectionMessage"
import ServiceCard from "@/app/components/shared/ServiceCard"
import ServiceGridSkeleton from "@/app/components/skeletons/ServiceCardSkeleton"

import PerPageSelect from "./PerPageSelect"
import ServicesHeader from "./ServicesHeader"
import ServicesPagination from "./ServicesPagination"
import ServicesToolbar from "./ServicesToolbar"
import { RESULTS_SECTION_ID } from "./useServicesNavigation"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

/**
 * One canonical URL per category (`/services` or `/services?category=…`):
 * page, sort and page-size variants all point to it, so search engines don't
 * see them as duplicates. Search results are thin, so they aren't indexed.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams
}): Promise<Metadata> {
  const { category, search } = parseServiceFilters(await searchParams)

  if (category) {
    return pageMetadata({
      title: `${category} Services`,
      description: `Browse ${category.toLowerCase()} services at SalonBook. Compare prices and durations, then request an appointment online and pay securely once it's confirmed.`,
      path: categoryHref(category),
      index: !search,
    })
  }

  return pageMetadata({
    title: "Browse Salon Services",
    description:
      "Explore SalonBook's salon services: haircuts, coloring, treatments, facials, makeup, nails and spa. Search, filter and sort to find your perfect appointment.",
    path: "/services",
    index: !search,
  })
}

export default async function BrowseServicesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const filters = parseServiceFilters(await searchParams)

  return (
    <main className="flex-1">
      <ServicesHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <ServicesToolbar filters={filters} />

        {/* Scroll target for pagination; offset clears the sticky navbar */}
        <section
          id={RESULTS_SECTION_ID}
          aria-label="Services"
          className="mt-8 scroll-mt-24"
        >
          {/* New key per filter/page combination → skeleton shows while re-fetching */}
          <Suspense
            key={filtersToSearchParams(filters).toString()}
            fallback={<ServiceGridSkeleton count={filters.perPage} />}
          >
            <ServiceResults filters={filters} />
          </Suspense>
        </section>
      </div>
    </main>
  )
}

async function ServiceResults({ filters }: { filters: ServiceFilters }) {
  const result = await getBrowseServices(filters)

  if (result.error !== null) {
    return (
      <SectionMessage
        icon={<CloudOffIcon className="size-6" />}
        title="We couldn't load services"
        description={`${result.error} Please refresh the page or try again in a moment.`}
      />
    )
  }

  const filtered = hasActiveFilters(filters)
  // Keep the chosen sort and page size when clearing search/category.
  const clearQuery = filtersToSearchParams({
    ...filters,
    search: "",
    category: "",
    page: 1,
  }).toString()
  const clearHref = clearQuery ? `/services?${clearQuery}` : "/services"

  if (result.data.length === 0) {
    return filtered ? (
      <SectionMessage
        icon={<SearchXIcon className="size-6" />}
        title="No services match your search"
        description="Try a different name or category, or clear the filters to see the full menu."
        action={
          <Button render={<Link href={clearHref} />} nativeButton={false}>
            Clear filters
          </Button>
        }
      />
    ) : (
      <SectionMessage
        icon={<SparklesIcon className="size-6" />}
        title="New services coming soon"
        description="Our salon menu is being updated. Please check back shortly."
      />
    )
  }

  const { items, page, totalPages, total, from, to } = paginate(
    result.data,
    filters.page,
    filters.perPage
  )

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing{" "}
          <span className="font-medium text-foreground">
            {from}–{to}
          </span>{" "}
          of <span className="font-medium text-foreground">{total}</span>{" "}
          {total === 1 ? "service" : "services"}
          {filters.search && (
            <>
              {" "}
              for{" "}
              <span className="font-medium text-foreground">
                &ldquo;{filters.search}&rdquo;
              </span>
            </>
          )}
          {filters.category && (
            <>
              {" "}
              in{" "}
              <span className="font-medium text-foreground">
                {filters.category}
              </span>
            </>
          )}
        </p>
        <div className="flex items-center gap-4">
          {filtered && (
            <Link
              href={clearHref}
              className="text-sm font-medium whitespace-nowrap text-primary underline-offset-4 hover:underline"
            >
              Clear filters
            </Link>
          )}
          <PerPageSelect filters={filters} />
        </div>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((service, i) => (
          <li key={service._id}>
            <ServiceCard service={service} preloadImage={i < 3} />
          </li>
        ))}
      </ul>

      <ServicesPagination
        filters={filters}
        page={page}
        totalPages={totalPages}
      />
      {totalPages > 1 && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Page {page} of {totalPages}
        </p>
      )}
    </>
  )
}
