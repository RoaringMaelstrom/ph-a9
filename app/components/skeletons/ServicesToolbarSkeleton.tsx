import { Skeleton } from "@/components/ui/skeleton"

/** Approximate widths of the "All Services" + 7 category pills. */
const PILL_WIDTHS = [96, 140, 112, 120, 140, 80, 160, 124]

/**
 * Mirrors `ServicesToolbar` (search, sort, category pills). Used by Browse
 * Services and the admin Manage Services loading states.
 */
export default function ServicesToolbarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 sm:w-64" />
      </div>
      <div className="-mx-4 flex gap-2 overflow-hidden px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {PILL_WIDTHS.map((w, i) => (
          <Skeleton
            key={i}
            className="h-8 shrink-0 rounded-full"
            style={{ width: w }}
          />
        ))}
      </div>
    </div>
  )
}
