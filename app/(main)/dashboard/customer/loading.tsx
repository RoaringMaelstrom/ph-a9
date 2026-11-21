import { Skeleton } from "@/components/ui/skeleton"
import { StatCardSkeleton } from "@/app/components/dashboard/StatCard"
import {
  BadgeSkeleton,
  LoadingRegion,
  PageHeaderSkeleton,
} from "@/app/components/skeletons/DashboardSkeletons"

const STAT_LABELS = ["Total Requests", "Pending", "Confirmed", "Cancelled"]

/** Customer overview: greeting, 4 stat cards, "Upcoming appointments" (up to 4). */
export default function CustomerOverviewLoading() {
  return (
    <LoadingRegion label="Loading overview">
      <PageHeaderSkeleton
        description="Here's a summary of your salon appointments."
        action="w-36"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_LABELS.map((label) => (
          <StatCardSkeleton key={label} label={label} />
        ))}
      </div>

      <section className="mt-8 rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <h2 className="font-semibold">Upcoming appointments</h2>
          <Skeleton className="h-4 w-16" />
        </div>
        <ul className="divide-y">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="size-11 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-48 max-w-full" />
                <Skeleton className="h-4 w-40 max-w-full" />
              </div>
              <Skeleton className="hidden h-4 w-10 sm:block" />
              <BadgeSkeleton />
            </li>
          ))}
        </ul>
      </section>
    </LoadingRegion>
  )
}
