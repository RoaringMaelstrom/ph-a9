import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/*
 * Building blocks for dashboard `loading.tsx` files. Each one mirrors the
 * markup (spacing, borders, responsive columns) of the real component, so the
 * page doesn't jump when the data arrives. Static text (titles, column
 * headers, tab labels) is rendered for real; only data is a placeholder.
 */

/** Wraps a page placeholder with an accessible "loading" status. */
export function LoadingRegion({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div role="status" aria-label={label}>
      {children}
      <span className="sr-only">{label}...</span>
    </div>
  )
}

/** Same layout as `PageHeader`; pass `title` to show it, or omit to skeleton it. */
export function PageHeaderSkeleton({
  title,
  description,
  action,
}: {
  title?: string
  description?: string
  /** Width class of the action button(s), e.g. "w-32" */
  action?: string
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {title ? (
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
        ) : (
          <Skeleton className="h-8 w-48 sm:h-9" />
        )}
        {description ? (
          <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : (
          <Skeleton className="mt-2.5 h-4 w-72 max-w-full sm:h-5" />
        )}
      </div>
      {action && <Skeleton className={cn("h-9 shrink-0", action)} />}
    </div>
  )
}

/** Same layout as `StatusTabs`: real labels, placeholder counts. */
export function StatusTabsSkeleton({
  labels,
  counts = true,
}: {
  labels: string[]
  counts?: boolean
}) {
  return (
    <div className="-mx-4 mb-5 flex gap-2 overflow-hidden px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {labels.map((label, i) => (
        <span
          key={label}
          className={cn(
            "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap",
            i === 0
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-card text-muted-foreground"
          )}
        >
          {label}
          {counts && (
            <Skeleton
              className={cn(
                "h-4 w-5 rounded-full",
                i === 0 && "bg-primary-foreground/25"
              )}
            />
          )}
        </span>
      ))}
    </div>
  )
}

// --- Table cells --------------------------------------------------------------

/** Avatar (or square thumb) + two text lines, like the customer/service cells. */
export function IdentityCellSkeleton({
  media = "avatar",
  mediaSize = "size-9",
  minWidth = "min-w-44",
}: {
  media?: "avatar" | "thumb"
  mediaSize?: string
  minWidth?: string
}) {
  return (
    <div className={cn("flex items-center gap-3", minWidth)}>
      <Skeleton
        className={cn(
          "shrink-0",
          media === "avatar" ? cn("rounded-full", mediaSize) : "size-11 rounded-lg"
        )}
      />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-36 max-w-full" />
      </div>
    </div>
  )
}

/** Two stacked text lines (e.g. service + category, date + time). */
export function TwoLineSkeleton({
  top = "w-28",
  bottom = "w-20",
}: {
  top?: string
  bottom?: string
}) {
  return (
    <div className="space-y-1.5">
      <Skeleton className={cn("h-4", top)} />
      <Skeleton className={cn("h-3", bottom)} />
    </div>
  )
}

export function TextSkeleton({ width = "w-16" }: { width?: string }) {
  return <Skeleton className={cn("h-4", width)} />
}

/** Status / payment badge. */
export function BadgeSkeleton({ width = "w-18" }: { width?: string }) {
  return <Skeleton className={cn("h-5 rounded-full", width)} />
}

/**
 * Right-aligned row actions. Items: "icon" (icon-sm button) or a width class
 * for a small labelled button, e.g. ["icon", "w-20"].
 */
export function RowActionsSkeleton({
  items,
  gap = "gap-1.5",
}: {
  items: string[]
  gap?: string
}) {
  return (
    <div className={cn("flex items-center justify-end", gap)}>
      {items.map((item, i) =>
        item === "icon" ? (
          <Skeleton key={i} className="size-8 rounded-lg" />
        ) : (
          <Skeleton key={i} className={cn("h-8 rounded-lg", item)} />
        )
      )}
    </div>
  )
}

export interface SkeletonColumn {
  /** Real column header text */
  header: string
  /** Same responsive/padding classes as the real column, e.g. "hidden md:table-cell" */
  className?: string
  /** Header alignment/padding if different from the cell */
  headClassName?: string
  cell: React.ReactNode
}

/** Same card + `Table` markup as the dashboard lists, with placeholder rows. */
export function TableCardSkeleton({
  columns,
  rows,
}: {
  columns: SkeletonColumn[]
  rows: number
}) {
  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={col.header}
                className={col.headClassName ?? col.className}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }, (_, r) => (
            <TableRow key={r} className="hover:bg-transparent">
              {columns.map((col) => (
                <TableCell key={col.header} className={col.className}>
                  {col.cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/** Same layout as `DashboardPagination`: count (+ per-page select) and page buttons. */
export function PaginationSkeleton({
  perPage = false,
  className = "mt-4",
}: {
  perPage?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-3 sm:flex-row",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <Skeleton className="h-4 w-44" />
        {perPage && <Skeleton className="h-8 w-36" />}
      </div>
      <div className="flex items-center gap-1">
        <Skeleton className="h-8 w-8 sm:w-24" />
        <Skeleton className="size-8" />
        <Skeleton className="size-8" />
        <Skeleton className="h-8 w-8 sm:w-16" />
      </div>
    </div>
  )
}

// --- Forms --------------------------------------------------------------------

/** Label + input placeholder (h-9 control, like `Input` / `InputGroup`). */
export function FieldSkeleton({
  label = "w-24",
  control = "h-9",
  children,
}: {
  label?: string
  control?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className={cn("h-4", label)} />
      {children ?? <Skeleton className={cn("w-full", control)} />}
    </div>
  )
}

/**
 * Card footer with the form's action buttons: full width on mobile,
 * right-aligned on desktop. `buttons` are desktop widths, e.g. "sm:w-20".
 */
export function FormActionsSkeleton({
  buttons = ["sm:w-20", "sm:w-32"],
}: {
  buttons?: string[]
}) {
  return (
    <div className="mt-6 flex flex-col-reverse gap-2 border-t pt-5 sm:flex-row sm:justify-end">
      {buttons.map((width, i) => (
        <Skeleton key={i} className={cn("h-9 w-full", width)} />
      ))}
    </div>
  )
}
