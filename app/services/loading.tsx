import { DEFAULT_PER_PAGE } from "@/lib/service-filters"
import { Skeleton } from "@/components/ui/skeleton"
import ServiceGridSkeleton from "@/app/components/skeletons/ServiceCardSkeleton"
import ServicesToolbarSkeleton from "@/app/components/skeletons/ServicesToolbarSkeleton"

import ServicesHeader from "./ServicesHeader"

/** Shown on first navigation to /services while the page loads. */
export default function BrowseServicesLoading() {
  return (
    <main className="flex-1">
      <ServicesHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <ServicesToolbarSkeleton />

        <div className="mt-8">
          {/* Summary line + "Show [9] per page" */}
          <div className="mb-5 flex items-center justify-between">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-8 w-36" />
          </div>
          <ServiceGridSkeleton count={DEFAULT_PER_PAGE} />
        </div>
      </div>
    </main>
  )
}
