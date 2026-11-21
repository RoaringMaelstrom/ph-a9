import { LockIcon } from "lucide-react"

import {
  BadgeSkeleton,
  IdentityCellSkeleton,
  LoadingRegion,
  PageHeaderSkeleton,
  PaginationSkeleton,
  TableCardSkeleton,
  TextSkeleton,
} from "@/app/components/skeletons/DashboardSkeletons"

/** Transactions: read-only note, 8-column table (12 per page), pagination. */
export default function TransactionsLoading() {
  return (
    <LoadingRegion label="Loading transactions">
      <PageHeaderSkeleton
        title="Transactions"
        description="Payments recorded from verified Stripe checkouts."
      />
      <p className="mb-5 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        <LockIcon className="size-3.5" />
        Payment records are created automatically by Stripe and can&apos;t be
        edited.
      </p>
      <TableCardSkeleton
        rows={12}
        columns={[
          {
            header: "Customer",
            kind: "primary",
            className: "pl-4",
            cell: <IdentityCellSkeleton mediaSize="size-8" />,
          },
          { header: "Service", cell: <TextSkeleton width="w-32" /> },
          { header: "Appointment", cell: <TextSkeleton width="w-28" /> },
          { header: "Amount", cell: <TextSkeleton width="w-14" /> },
          { header: "Currency", cell: <TextSkeleton width="w-8" /> },
          {
            header: "Stripe session",
            className: "md:max-lg:hidden",
            cell: <TextSkeleton width="w-28" />,
          },
          { header: "Status", cell: <BadgeSkeleton width="w-12" /> },
          {
            header: "Date",
            className: "pr-4",
            cell: <TextSkeleton width="w-24" />,
          },
        ]}
      />
      <PaginationSkeleton />
    </LoadingRegion>
  )
}
