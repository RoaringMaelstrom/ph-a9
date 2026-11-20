import { Skeleton } from "@/components/ui/skeleton"

import { BookingFormSkeleton } from "./BookingForm"

/** Mirrors the service details layout: breadcrumb, image + details, booking card. */
export default function ServiceDetailsLoading() {
  return (
    <main className="flex-1" role="status" aria-label="Loading service">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-3" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-3" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
          {/* Details */}
          <div>
            <Skeleton className="aspect-4/3 w-full rounded-2xl sm:aspect-video lg:aspect-4/3" />
            <div className="mt-6">
              <Skeleton className="h-6 w-32 rounded-full" />
              <Skeleton className="mt-4 h-9 w-3/4" />
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`rounded-xl border bg-card px-4 py-3 ${i === 2 ? "col-span-2 sm:col-span-1" : ""}`}
                  >
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="mt-2 h-5 w-16" />
                  </div>
                ))}
              </div>
              <Skeleton className="mt-8 h-6 w-44" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>

          {/* Booking card */}
          <div className="lg:self-start">
            <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <Skeleton className="size-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <BookingFormSkeleton />
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only">Loading service...</span>
    </main>
  )
}
