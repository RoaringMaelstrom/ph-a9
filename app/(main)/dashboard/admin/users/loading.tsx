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
} from "@/app/components/skeletons/DashboardSkeletons"

/** Manage Users: status tabs, customers table (12 per page), pagination. */
export default function ManageUsersLoading() {
  return (
    <LoadingRegion label="Loading customers">
      <PageHeaderSkeleton
        title="Manage Users"
        description="View registered customers and block or unblock their accounts."
      />
      <StatusTabsSkeleton labels={["All customers", "Active", "Blocked"]} />
      <TableCardSkeleton
        rows={12}
        columns={[
          {
            header: "Customer",
            className: "pl-4",
            cell: <IdentityCellSkeleton minWidth="min-w-48" />,
          },
          {
            header: "Phone",
            className: "hidden md:table-cell",
            cell: <TextSkeleton width="w-28" />,
          },
          { header: "Status", cell: <BadgeSkeleton width="w-16" /> },
          {
            header: "Joined",
            className: "hidden lg:table-cell",
            cell: <TextSkeleton width="w-24" />,
          },
          {
            header: "Actions",
            className: "pr-4",
            headClassName: "pr-4 text-right",
            cell: <RowActionsSkeleton items={["icon", "w-18"]} />,
          },
        ]}
      />
      <PaginationSkeleton />
    </LoadingRegion>
  )
}
