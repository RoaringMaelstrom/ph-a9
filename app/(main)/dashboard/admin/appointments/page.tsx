import { CalendarXIcon } from "lucide-react"

import { requireRole } from "@/lib/session"
import { serverApi } from "@/lib/server-api"
import { timeSlotLabel } from "@/lib/booking"
import { formatAppointmentDate, formatDate, formatPrice } from "@/lib/format"
import { paginate, parsePageParam } from "@/lib/pagination"
import type {
  AppointmentDetails,
  AppointmentStatus,
} from "@/app/components/types/appointment"
import DashboardPagination from "@/app/components/dashboard/DashboardPagination"
import {
  DataCell,
  DataHead,
  DataRow,
  DataTable,
  DataTableBody,
  DataTableHeader,
} from "@/app/components/dashboard/DataTable"
import DataError from "@/app/components/dashboard/DataError"
import DetailsList from "@/app/components/dashboard/DetailsList"
import PageHeader from "@/app/components/dashboard/PageHeader"
import StatusTabs from "@/app/components/dashboard/StatusTabs"
import {
  AppointmentStatusBadge,
  PaymentStatusBadge,
} from "@/app/components/dashboard/StatusBadge"
import UserAvatar from "@/app/components/dashboard/UserAvatar"
import SectionMessage from "@/app/components/shared/SectionMessage"

import AdminAppointmentActions from "./AdminAppointmentActions"

const STATUSES: AppointmentStatus[] = ["pending", "confirmed", "cancelled"]
const PER_PAGE = 12
const SECTION_ID = "appointments-list"

export default async function ManageAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string | string[] }>
}) {
  await requireRole("admin", "/dashboard/admin/appointments")
  const { status: raw, page: rawPage } = await searchParams
  const status = STATUSES.includes(raw as AppointmentStatus)
    ? (raw as AppointmentStatus)
    : ""

  const result = await serverApi<AppointmentDetails[]>("/admin/appointments")

  return (
    <>
      <PageHeader
        title="Manage Appointments"
        description="Review requests, confirm pending appointments, or cancel them."
      />
      {result.error !== null ? (
        <DataError message={result.error} />
      ) : (
        <AppointmentsTable
          appointments={result.data}
          status={status}
          page={parsePageParam(rawPage)}
        />
      )}
    </>
  )
}

function AppointmentsTable({
  appointments,
  status,
  page,
}: {
  appointments: AppointmentDetails[]
  status: AppointmentStatus | ""
  page: number
}) {
  const count = (s: AppointmentStatus) =>
    appointments.filter((a) => a.status === s).length
  const visible = (
    status ? appointments.filter((a) => a.status === status) : appointments
  )
    .slice()
    // Pending first (needs action), then newest requests first.
    .sort(
      (a, b) =>
        Number(b.status === "pending") - Number(a.status === "pending") ||
        b.createdAt.localeCompare(a.createdAt)
    )
  const pageData = paginate(visible, page, PER_PAGE)

  return (
    <section id={SECTION_ID} aria-label="Appointments" className="scroll-mt-24">
      <StatusTabs
        basePath="/dashboard/admin/appointments"
        current={status}
        items={[
          { value: "", label: "All", count: appointments.length },
          { value: "pending", label: "Pending", count: count("pending") },
          { value: "confirmed", label: "Confirmed", count: count("confirmed") },
          { value: "cancelled", label: "Cancelled", count: count("cancelled") },
        ]}
      />

      {visible.length === 0 ? (
        <SectionMessage
          icon={<CalendarXIcon className="size-6" />}
          title={
            status ? `No ${status} appointments` : "No appointment requests yet"
          }
          description="New requests from customers will appear here."
        />
      ) : (
        <DataTable>
          <DataTableHeader>
            <DataHead className="pl-4">Customer</DataHead>
            <DataHead>Service</DataHead>
            <DataHead>Date &amp; time</DataHead>
            <DataHead>Price</DataHead>
            <DataHead>Status</DataHead>
            <DataHead>Payment</DataHead>
            <DataHead className="md:max-xl:hidden">Requested</DataHead>
            <DataHead className="pr-4 text-right">Actions</DataHead>
          </DataTableHeader>
          <DataTableBody>
            {pageData.items.map((a) => {
              const customer = a.customer?.name ?? "Deleted account"
              const service = a.service?.serviceName ?? "Deleted service"
              const when = `${formatAppointmentDate(a.appointmentDate)} at ${timeSlotLabel(a.timeSlot)}`
              return (
                <DataRow key={a._id}>
                  <DataCell label="Customer" kind="primary" className="pl-4">
                    <div className="flex min-w-44 items-center gap-3">
                      <UserAvatar
                        name={a.customer?.name}
                        image={a.customer?.image}
                        className="size-9"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{customer}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {a.customer?.email ?? "—"}
                        </p>
                      </div>
                    </div>
                  </DataCell>
                  <DataCell label="Service">
                    <p className="max-w-48 truncate font-medium">{service}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.service?.category ?? "—"}
                    </p>
                  </DataCell>
                  <DataCell label="Date & time" className="whitespace-nowrap">
                    <p>{formatAppointmentDate(a.appointmentDate)}</p>
                    <p className="text-xs text-muted-foreground">
                      {timeSlotLabel(a.timeSlot)}
                    </p>
                  </DataCell>
                  <DataCell
                    label="Price"
                    className="font-semibold tabular-nums"
                  >
                    {formatPrice(a.servicePrice)}
                  </DataCell>
                  <DataCell label="Status">
                    <AppointmentStatusBadge status={a.status} />
                  </DataCell>
                  <DataCell label="Payment">
                    <PaymentStatusBadge status={a.paymentStatus} />
                  </DataCell>
                  <DataCell
                    label="Requested"
                    className="whitespace-nowrap text-muted-foreground md:max-xl:hidden"
                  >
                    {formatDate(a.createdAt)}
                  </DataCell>
                  <DataCell label="Actions" kind="actions" className="pr-4">
                    <AdminAppointmentActions
                      id={a._id}
                      status={a.status}
                      summary={`${service} for ${customer} on ${when}`}
                      details={
                        <DetailsList
                          rows={[
                            { label: "Customer", value: customer },
                            {
                              label: "Email",
                              value: a.customer?.email ?? "—",
                            },
                            {
                              label: "Phone",
                              value: a.customer?.phone || "—",
                            },
                            { label: "Service", value: service },
                            {
                              label: "Category",
                              value: a.service?.category ?? "—",
                            },
                            {
                              label: "Date",
                              value: formatAppointmentDate(a.appointmentDate),
                            },
                            {
                              label: "Time",
                              value: timeSlotLabel(a.timeSlot),
                            },
                            {
                              label: "Price",
                              value: formatPrice(a.servicePrice),
                            },
                            {
                              label: "Status",
                              value: (
                                <AppointmentStatusBadge status={a.status} />
                              ),
                            },
                            {
                              label: "Payment",
                              value: (
                                <PaymentStatusBadge status={a.paymentStatus} />
                              ),
                            },
                            {
                              label: "Requested on",
                              value: formatDate(a.createdAt),
                            },
                            {
                              label: "Message",
                              value: a.message ? (
                                <span className="whitespace-pre-line">
                                  {a.message}
                                </span>
                              ) : (
                                "—"
                              ),
                            },
                          ]}
                        />
                      }
                    />
                  </DataCell>
                </DataRow>
              )
            })}
          </DataTableBody>
        </DataTable>
      )}
      <DashboardPagination
        {...pageData}
        sectionId={SECTION_ID}
        noun="appointments"
        className="mt-4"
      />
    </section>
  )
}
