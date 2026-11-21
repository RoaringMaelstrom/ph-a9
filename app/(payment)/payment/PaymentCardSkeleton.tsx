import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DetailsListSkeleton,
  LoadingRegion,
} from "@/app/components/skeletons/DashboardSkeletons"

/**
 * Same layout as `PaymentCard`: icon, title, description, details list and
 * action buttons. Pass the parts that are known before loading (e.g. the
 * cancel page's icon and title); anything omitted is a placeholder.
 */
export default function PaymentCardSkeleton({
  label,
  icon,
  iconClassName,
  title,
  descriptionLines = 2,
  rows,
  actions = ["sm:w-48", "sm:w-40"],
}: {
  /** Screen-reader status text */
  label: string
  icon?: React.ReactNode
  /** Tone classes for a real icon, e.g. "bg-warning/10 text-warning" */
  iconClassName?: string
  title?: string
  descriptionLines?: number
  rows: [label: string, value: string][]
  /** Desktop widths of the action buttons */
  actions?: string[]
}) {
  return (
    <LoadingRegion label={label}>
      <section className="rounded-2xl border bg-card px-6 py-10 shadow-sm sm:px-10">
        <div className="flex flex-col items-center text-center">
          {icon ? (
            <span
              className={cn(
                "flex size-14 items-center justify-center rounded-full",
                iconClassName
              )}
            >
              {icon}
            </span>
          ) : (
            <Skeleton className="size-14 rounded-full" />
          )}
          {title ? (
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">
              {title}
            </h1>
          ) : (
            <Skeleton className="mt-4 h-8 w-56" />
          )}
          <div className="mt-2 flex w-full max-w-md flex-col items-center gap-1.5">
            {Array.from({ length: descriptionLines }, (_, i) => (
              <Skeleton
                key={i}
                className={cn(
                  "h-4",
                  i === descriptionLines - 1 ? "w-3/5" : "w-full"
                )}
              />
            ))}
          </div>
        </div>

        <div className="mt-8">
          <DetailsListSkeleton rows={rows} />
        </div>

        <div className="mt-8 flex flex-col-reverse justify-center gap-2 sm:flex-row">
          {actions.map((width, i) => (
            <Skeleton key={i} className={cn("h-9 w-full", width)} />
          ))}
        </div>
      </section>
    </LoadingRegion>
  )
}
