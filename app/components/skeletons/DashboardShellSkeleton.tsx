import { Skeleton } from "@/components/ui/skeleton"
import DashboardSkeleton from "@/app/components/dashboard/DashboardSkeleton"

const NAV_ITEMS = 5

/**
 * Mirrors the dashboard shell (`DashboardSidebar` + main area) while the
 * layout reads the session from the DB. The role isn't known yet, so the
 * sidebar shows a neutral number of nav items. The content area reuses
 * `DashboardSkeleton`, which carries the `role="status"` announcement.
 */
export default function DashboardShellSkeleton() {
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      {/* Mobile / tablet bar */}
      <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3 sm:px-6 lg:hidden">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-muted/30 lg:block">
        <div className="sticky top-16 space-y-6 p-5">
          <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <ul className="space-y-1">
            {Array.from({ length: NAV_ITEMS }, (_, i) => (
              <li key={i} className="flex items-center gap-3 px-3 py-2">
                <Skeleton className="size-4 shrink-0" />
                <Skeleton className="h-4 w-28" />
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <div className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        <DashboardSkeleton />
      </div>
    </div>
  )
}
