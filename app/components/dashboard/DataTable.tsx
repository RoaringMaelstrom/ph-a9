import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

/*
 * Dashboard list that is a table from `md` up and a stack of cards below it.
 *
 * On mobile every row becomes a card and every cell becomes a "label: value"
 * line (the label comes from the cell's `label`, rendered with CSS), so all
 * the data of an item is visible at once. Columns that the table hides to
 * save space must therefore only be hidden from `md` up, e.g.
 * `md:max-lg:hidden` instead of `hidden lg:table-cell`.
 *
 * Same markup for the real pages and their skeletons (`TableCardSkeleton`).
 */

export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:rounded-2xl md:border md:bg-card md:shadow-sm">
      <Table className="max-md:block">{children}</Table>
    </div>
  )
}

/** Column headers: only shown in table mode (cards label each field). */
export function DataTableHeader({ children }: { children: React.ReactNode }) {
  return (
    <TableHeader className="max-md:hidden">
      <TableRow>{children}</TableRow>
    </TableHeader>
  )
}

export const DataHead = TableHead

export function DataTableBody({ children }: { children: React.ReactNode }) {
  return (
    <TableBody className="max-md:flex max-md:flex-col max-md:gap-3 max-md:[&_tr:last-child]:border">
      {children}
    </TableBody>
  )
}

export function DataRow({
  className,
  ...props
}: React.ComponentProps<typeof TableRow>) {
  return (
    <TableRow
      className={cn(
        "max-md:block max-md:rounded-2xl max-md:border max-md:bg-card max-md:px-4 max-md:py-3 max-md:shadow-xs max-md:hover:bg-card",
        className
      )}
      {...props}
    />
  )
}

/**
 * - `field` (default): "label ... value" line on mobile.
 * - `primary`: the item's heading on mobile (avatar/thumb + name), no label.
 * - `actions`: the row buttons, separated at the bottom of the card on mobile.
 */
export type DataCellKind = "field" | "primary" | "actions"

const KIND_CLASSES: Record<DataCellKind, string> = {
  field:
    "max-md:flex max-md:items-start max-md:justify-between max-md:gap-4 max-md:px-0 max-md:py-1.5 max-md:whitespace-normal max-md:before:shrink-0 max-md:before:font-sans max-md:before:text-sm max-md:before:font-normal max-md:before:normal-case max-md:before:text-muted-foreground max-md:before:content-[attr(data-label)]",
  primary:
    "max-md:mb-1.5 max-md:block max-md:border-b max-md:px-0 max-md:pt-1 max-md:pb-3",
  actions:
    "max-md:mt-1.5 max-md:block max-md:border-t max-md:px-0 max-md:pt-3 max-md:pb-1",
}

export function DataCell({
  label,
  kind = "field",
  className,
  children,
  ...props
}: React.ComponentProps<typeof TableCell> & {
  /** Column name, shown before the value on mobile */
  label: string
  kind?: DataCellKind
}) {
  return (
    <TableCell
      data-label={label}
      className={cn(KIND_CLASSES[kind], className)}
      {...props}
    >
      {kind === "field" ? (
        <div className="max-md:min-w-0 max-md:text-right">{children}</div>
      ) : (
        children
      )}
    </TableCell>
  )
}
