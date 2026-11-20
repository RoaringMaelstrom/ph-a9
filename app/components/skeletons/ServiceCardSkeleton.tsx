import { Skeleton } from "@/components/ui/skeleton"

/** Matches the layout of `ServiceCard`. */
export function ServiceCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <div className="flex flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-14" />
        </div>
        <Skeleton className="mt-2.5 h-4 w-20" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
        <Skeleton className="mt-6 h-9 w-full" />
      </div>
    </div>
  )
}

/** Grid of card skeletons, using the same grid as the real service lists. */
export default function ServiceGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading services"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading services...</span>
    </div>
  )
}
