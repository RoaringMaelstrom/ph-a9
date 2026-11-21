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
            kind: "primary",
            className: "pl-4",
            cell: <IdentityCellSkeleton minWidth="min-w-48" />,
          },
          { header: "Phone", cell: <TextSkeleton width="w-28" /> },
          { header: "Status", cell: <BadgeSkeleton width="w-16" /> },
          {
            header: "Joined",
            className: "md:max-lg:hidden",
            cell: <TextSkeleton width="w-24" />,
          },
          {
            header: "Actions",
            kind: "actions",
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
