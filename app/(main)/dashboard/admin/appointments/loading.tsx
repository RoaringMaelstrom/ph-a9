import {
  BadgeSkeleton,
  IdentityCellSkeleton,
  LoadingRegion,
  PageHeaderSkeleton,
  PaginationSkeleton,
  RowActionsSkeleton,
  StatusTabsSkeleton,
  TableCardSkeleton,
  TextSkeleton,
  TwoLineSkeleton,
} from "@/app/components/skeletons/DashboardSkeletons"

/** Manage Appointments: status tabs, 8-column table (12 per page), pagination. */
export default function ManageAppointmentsLoading() {
  return (
    <LoadingRegion label="Loading appointments">
      <PageHeaderSkeleton
        title="Manage Appointments"
        description="Review requests, confirm pending appointments, or cancel them."
      />
      <StatusTabsSkeleton labels={["All", "Pending", "Confirmed", "Cancelled"]} />
      <TableCardSkeleton
        rows={12}
        columns={[
          { header: "Customer", className: "pl-4", cell: <IdentityCellSkeleton /> },
          { header: "Service", cell: <TwoLineSkeleton top="w-32" bottom="w-24" /> },
          { header: "Date & time", cell: <TwoLineSkeleton top="w-28" bottom="w-14" /> },
          {
            header: "Price",
            className: "hidden md:table-cell",
            cell: <TextSkeleton width="w-12" />,
          },
          { header: "Status", cell: <BadgeSkeleton /> },
          { header: "Payment", cell: <BadgeSkeleton width="w-14" /> },
          {
            header: "Requested",
            className: "hidden xl:table-cell",
            cell: <TextSkeleton width="w-24" />,
          },
          {
            header: "Actions",
            className: "pr-4",
            headClassName: "pr-4 text-right",
            cell: <RowActionsSkeleton items={["icon", "w-20", "w-18"]} />,
          },
        ]}
      />
      <PaginationSkeleton />
    </LoadingRegion>
  )
}
