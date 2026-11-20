import { Skeleton } from "@/components/ui/skeleton"

import { StatCardSkeleton } from "./StatCard"

/** Table placeholder for dashboard list pages. */
export function TableSkeleton({
  rows = 6,
  cols = 5,
}: {
  rows?: number
  cols?: number
}) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex gap-4 border-b bg-muted/40 px-4 py-3">
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 border-b px-4 py-4 last:border-0"
        >
          <Skeleton className="size-10 shrink-0 rounded-lg" />
          {Array.from({ length: cols - 1 }, (_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Generic dashboard page placeholder: header, stat cards, table. */
export default function DashboardSkeleton({ stats = 4 }: { stats?: number }) {
  return (
    <div role="status" aria-label="Loading dashboard">
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      {stats > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: stats }, (_, i) => (
            <StatCardSkeleton key={i} />
          ))}
        </div>
      )}
      <TableSkeleton />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
