import { DEFAULT_PER_PAGE } from "@/lib/service-filters"
import { Skeleton } from "@/components/ui/skeleton"
import ServiceGridSkeleton from "@/app/components/skeletons/ServiceCardSkeleton"

import ServicesHeader from "./ServicesHeader"

/** Shown on first navigation to /services while the page loads. */
export default function BrowseServicesLoading() {
  return (
    <main className="flex-1">
      <ServicesHeader />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Toolbar */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 sm:w-64" />
          </div>
          <div className="flex gap-2 overflow-hidden">
            {[96, 140, 112, 120, 140, 80, 160, 124].map((w, i) => (
              <Skeleton
                key={i}
                className="h-8 shrink-0 rounded-full"
                style={{ width: w }}
              />
            ))}
          </div>
        </div>

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
