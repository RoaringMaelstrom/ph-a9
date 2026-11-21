import { Skeleton } from "@/components/ui/skeleton"
import { StatCardSkeleton } from "@/app/components/dashboard/StatCard"
import {
  LoadingRegion,
  PageHeaderSkeleton,
  PaginationSkeleton,
} from "@/app/components/skeletons/DashboardSkeletons"

const STAT_LABELS = [
  "Registered Customers",
  "Active Services",
  "Total Appointment Requests",
  "Pending Appointments",
  "Confirmed Appointments",
  "Successful Payments",
]

/** Admin overview: greeting, 6 stat cards, "Pending requests" list (5 per page). */
export default function AdminOverviewLoading() {
  return (
    <LoadingRegion label="Loading overview">
      <PageHeaderSkeleton
        description="Here's what's happening at the salon."
        action="w-32"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {STAT_LABELS.map((label) => (
          <StatCardSkeleton key={label} label={label} />
        ))}
      </div>

      <section className="mt-8 rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <h2 className="font-semibold">Pending requests</h2>
          <Skeleton className="h-4 w-20" />
        </div>
        <ul className="divide-y">
          {Array.from({ length: 5 }, (_, i) => (
            <li key={i} className="flex items-center gap-4 px-5 py-4">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-64 max-w-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Skeleton className="hidden h-3 w-28 sm:block" />
            </li>
          ))}
        </ul>
        <PaginationSkeleton className="border-t px-5 py-3" />
      </section>
    </LoadingRegion>
  )
}
