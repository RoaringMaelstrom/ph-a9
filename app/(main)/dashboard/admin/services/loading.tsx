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
import ServicesToolbarSkeleton from "@/app/components/skeletons/ServicesToolbarSkeleton"

/**
 * Manage Services: search/sort/category toolbar, status tabs, services table
 * (10 per page by default), pagination with "Show [n] per page".
 */
export default function ManageServicesLoading() {
  return (
    <LoadingRegion label="Loading services">
      <PageHeaderSkeleton
        title="Manage Services"
        description="Add, edit, activate or remove services on the salon menu."
        action="w-32"
      />
      <div className="mb-5">
        <ServicesToolbarSkeleton />
      </div>
      <StatusTabsSkeleton labels={["All", "Active", "Inactive"]} />
      <TableCardSkeleton
        rows={10}
        columns={[
          {
            header: "Service",
            className: "pl-4",
            cell: <IdentityCellSkeleton media="thumb" minWidth="min-w-52" />,
          },
          { header: "Price", cell: <TextSkeleton width="w-10" /> },
          {
            header: "Duration",
            className: "hidden md:table-cell",
            cell: <TextSkeleton width="w-14" />,
          },
          { header: "Status", cell: <BadgeSkeleton width="w-14" /> },
          {
            header: "Created",
            className: "hidden lg:table-cell",
            cell: <TextSkeleton width="w-24" />,
          },
          {
            header: "Actions",
            className: "pr-4",
            headClassName: "pr-4 text-right",
            cell: (
              <RowActionsSkeleton items={["w-24", "icon", "icon"]} gap="gap-1" />
            ),
          },
        ]}
      />
      <PaginationSkeleton perPage />
    </LoadingRegion>
  )
}
