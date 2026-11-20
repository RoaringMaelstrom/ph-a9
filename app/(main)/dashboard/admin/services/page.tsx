import Link from "next/link"
import { PlusIcon, SearchXIcon, SparklesIcon } from "lucide-react"

import { requireRole } from "@/lib/session"
import { serverApi } from "@/lib/server-api"
import { formatDate, formatDuration, formatPrice } from "@/lib/format"
import { paginate, parsePageParam, parsePerPageParam } from "@/lib/pagination"
import {
  applyServiceFilters,
  DEFAULT_PER_PAGE as BROWSE_DEFAULT_PER_PAGE,
  filtersToSearchParams,
  hasActiveFilters,
  parseServiceFilters,
} from "@/lib/service-filters"
import type {
  Service,
  ServiceFilters,
  ServiceStatus,
} from "@/app/components/types/service"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import DashboardPagination from "@/app/components/dashboard/DashboardPagination"
import DataError from "@/app/components/dashboard/DataError"
import PageHeader from "@/app/components/dashboard/PageHeader"
import ServiceThumb from "@/app/components/dashboard/ServiceThumb"
import StatusTabs from "@/app/components/dashboard/StatusTabs"
import { ServiceStatusBadge } from "@/app/components/dashboard/StatusBadge"
import SectionMessage from "@/app/components/shared/SectionMessage"

import ServicesToolbar from "@/app/services/ServicesToolbar"

import ServiceRowActions from "./ServiceRowActions"

const BASE_PATH = "/dashboard/admin/services"
const SECTION_ID = "services-list"
const PER_PAGE_OPTIONS = [10, 20, 30, 40] as const
const DEFAULT_PER_PAGE = 10

export default async function ManageServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  await requireRole("admin", BASE_PATH)
  const params = await searchParams
  const raw = Array.isArray(params.status) ? params.status[0] : params.status
  const status: ServiceStatus | "" =
    raw === "active" || raw === "inactive" ? raw : ""
  // Same search / category / sort as Browse Services. Paging is separate:
  // the admin table has its own page sizes (10/20/30/40), so Browse's
  // page/perPage are pinned to their defaults and never written to the URL.
  const filters = {
    ...parseServiceFilters(params),
    page: 1,
    perPage: BROWSE_DEFAULT_PER_PAGE,
  }
  const page = parsePageParam(params.page)
  const perPage = parsePerPageParam(
    params.perPage,
    PER_PAGE_OPTIONS,
    DEFAULT_PER_PAGE
  )
  // Params kept when the toolbar or status tabs change the URL (page resets).
  const perPageParam = perPage === DEFAULT_PER_PAGE ? "" : String(perPage)
  const filterQuery = filtersToSearchParams(filters)
  if (perPageParam) filterQuery.set("perPage", perPageParam)

  // All services, including inactive ones (admin-only endpoint).
  const result = await serverApi<Service[]>("/admin/services")

  const addButton = (
    <Button
      render={<Link href="/dashboard/admin/services/new" />}
      nativeButton={false}
    >
      <PlusIcon />
      Add service
    </Button>
  )

  return (
    <>
      <PageHeader
        title="Manage Services"
        description="Add, edit, activate or remove services on the salon menu."
        actions={addButton}
      />

      {result.error !== null ? (
        <DataError message={result.error} />
      ) : result.data.length === 0 ? (
        <SectionMessage
          icon={<SparklesIcon className="size-6" />}
          title="No services yet"
          description="Create your first service to start taking bookings."
          action={addButton}
        />
      ) : (
        <ServicesTable
          services={result.data}
          filters={filters}
          filterQuery={filterQuery}
          status={status}
          page={page}
          perPage={perPage}
        />
      )}
    </>
  )
}

function ServicesTable({
  services,
  filters,
  filterQuery,
  status,
  page,
  perPage,
}: {
  services: Service[]
  filters: ServiceFilters
  /** search/category/sort/perPage, kept when switching tabs */
  filterQuery: URLSearchParams
  status: ServiceStatus | ""
  page: number
  perPage: number
}) {
  // Search + category + sort first, so the tab counts show matches per status.
  const matches = applyServiceFilters(services, filters)
  const visible = matches.filter((s) => !status || s.status === status)
  const pageData = paginate(visible, page, perPage)

  // Clear search + category, keep the status tab, sort and page size.
  const clearParams = new URLSearchParams(filterQuery)
  clearParams.delete("search")
  clearParams.delete("category")
  if (status) clearParams.set("status", status)
  const clearHref = clearParams.size ? `${BASE_PATH}?${clearParams}` : BASE_PATH

  return (
    <>
      <div className="mb-5">
        <ServicesToolbar
          filters={filters}
          preserveParams={{ status, perPage: filterQuery.get("perPage") ?? "" }}
        />
      </div>
      <section id={SECTION_ID} aria-label="Services" className="scroll-mt-24">
        <StatusTabs
          basePath={BASE_PATH}
          current={status}
          query={filterQuery}
          items={[
            { value: "", label: "All", count: matches.length },
            {
              value: "active",
              label: "Active",
              count: matches.filter((s) => s.status === "active").length,
            },
            {
              value: "inactive",
              label: "Inactive",
              count: matches.filter((s) => s.status === "inactive").length,
            },
          ]}
        />
        {visible.length === 0 ? (
          <SectionMessage
            icon={<SearchXIcon className="size-6" />}
            title="No services match"
            description={
              hasActiveFilters(filters)
                ? "Try a different name or category, or clear the filters."
                : `There are no ${status} services.`
            }
            action={
              hasActiveFilters(filters) ? (
                <Button
                  render={<Link href={clearHref} scroll={false} />}
                  nativeButton={false}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="rounded-2xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Service</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Duration
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Created
                  </TableHead>
                  <TableHead className="pr-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.items.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="pl-4">
                      <div className="flex min-w-52 items-center gap-3">
                        <ServiceThumb src={s.image} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {s.serviceName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {s.category}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {formatPrice(s.price)}
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap md:table-cell">
                      {formatDuration(s.duration)}
                    </TableCell>
                    <TableCell>
                      <ServiceStatusBadge status={s.status} />
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">
                      {formatDate(s.createdAt)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <ServiceRowActions
                        id={s._id}
                        name={s.serviceName}
                        status={s.status}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <DashboardPagination
          {...pageData}
          sectionId={SECTION_ID}
          noun="services"
          className="mt-4"
          perPage={{
            value: perPage,
            options: PER_PAGE_OPTIONS,
            defaultValue: DEFAULT_PER_PAGE,
          }}
        />
      </section>
    </>
  )
}
