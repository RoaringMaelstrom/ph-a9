import Link from "next/link"
import { PlusIcon, SparklesIcon } from "lucide-react"

import { requireRole } from "@/lib/session"
import { serverApi } from "@/lib/server-api"
import { formatDate, formatDuration, formatPrice } from "@/lib/format"
import type { Service, ServiceStatus } from "@/app/components/types/service"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import DataError from "@/app/components/dashboard/DataError"
import PageHeader from "@/app/components/dashboard/PageHeader"
import ServiceThumb from "@/app/components/dashboard/ServiceThumb"
import StatusTabs from "@/app/components/dashboard/StatusTabs"
import { ServiceStatusBadge } from "@/app/components/dashboard/StatusBadge"
import SectionMessage from "@/app/components/shared/SectionMessage"

import ServiceRowActions from "./ServiceRowActions"

export default async function ManageServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  await requireRole("admin", "/dashboard/admin/services")
  const { status: raw } = await searchParams
  const status: ServiceStatus | "" =
    raw === "active" || raw === "inactive" ? raw : ""

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
        <>
          <StatusTabs
            basePath="/dashboard/admin/services"
            current={status}
            items={[
              { value: "", label: "All", count: result.data.length },
              {
                value: "active",
                label: "Active",
                count: result.data.filter((s) => s.status === "active").length,
              },
              {
                value: "inactive",
                label: "Inactive",
                count: result.data.filter((s) => s.status === "inactive")
                  .length,
              },
            ]}
          />
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
                {result.data
                  .filter((s) => !status || s.status === status)
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .map((s) => (
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
        </>
      )}
    </>
  )
}
