import { Skeleton } from "@/components/ui/skeleton"
import {
  BadgeSkeleton,
  IdentityCellSkeleton,
  LoadingRegion,
  PageHeaderSkeleton,
  RowActionsSkeleton,
  StatusTabsSkeleton,
  TableCardSkeleton,
  TextSkeleton,
  TwoLineSkeleton,
} from "@/app/components/skeletons/DashboardSkeletons"

/**
 * My Appointments: status tabs + appointments table (not paginated), then
 * the "Payment history" table.
 */
export default function MyAppointmentsLoading() {
  return (
    <LoadingRegion label="Loading appointments">
      <PageHeaderSkeleton
        title="My Appointments"
        description="Track your requests, cancel pending ones, and pay for confirmed visits."
        action="w-36"
      />

      <StatusTabsSkeleton
        labels={["All", "Pending", "Confirmed", "Cancelled"]}
      />
      <TableCardSkeleton
        rows={6}
        columns={[
          {
            header: "Service",
            kind: "primary",
            className: "pl-4",
            cell: <IdentityCellSkeleton media="thumb" minWidth="min-w-48" />,
          },
          {
            header: "Date & time",
            cell: <TwoLineSkeleton top="w-28" bottom="w-14" />,
          },
          { header: "Price", cell: <TextSkeleton width="w-10" /> },
          { header: "Status", cell: <BadgeSkeleton /> },
          { header: "Payment", cell: <BadgeSkeleton width="w-14" /> },
          {
            header: "Requested",
            className: "md:max-lg:hidden",
            cell: <TextSkeleton width="w-24" />,
          },
          {
            header: "Actions",
            kind: "actions",
            className: "pr-4",
            headClassName: "pr-4 text-right",
            cell: <RowActionsSkeleton items={["icon", "w-20"]} />,
          },
        ]}
      />

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold">Payment history</h2>
        <TableCardSkeleton
          rows={3}
          columns={[
            {
              header: "Service",
              kind: "primary",
              className: "pl-4",
              cell: <TextSkeleton width="w-32" />,
            },
            { header: "Appointment", cell: <TextSkeleton width="w-28" /> },
            { header: "Amount", cell: <TextSkeleton width="w-14" /> },
            { header: "Status", cell: <BadgeSkeleton width="w-12" /> },
            { header: "Reference", cell: <Skeleton className="h-3 w-28" /> },
            {
              header: "Paid on",
              className: "pr-4",
              cell: <TextSkeleton width="w-24" />,
            },
          ]}
        />
      </section>
    </LoadingRegion>
  )
}
