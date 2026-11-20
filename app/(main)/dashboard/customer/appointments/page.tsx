import Link from "next/link"
import { CalendarXIcon, ReceiptIcon, SparklesIcon } from "lucide-react"

import { requireRole } from "@/lib/session"
import { serverApi } from "@/lib/server-api"
import { timeSlotLabel } from "@/lib/booking"
import {
  formatAppointmentDate,
  formatDate,
  formatMoney,
  formatPrice,
  shortRef,
} from "@/lib/format"
import type {
  AppointmentStatus,
  AppointmentWithService,
} from "@/app/components/types/appointment"
import type { TransactionDetails } from "@/app/components/types/transaction"
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
import DetailsList from "@/app/components/dashboard/DetailsList"
import PageHeader from "@/app/components/dashboard/PageHeader"
import ServiceThumb from "@/app/components/dashboard/ServiceThumb"
import StatusTabs from "@/app/components/dashboard/StatusTabs"
import {
  AppointmentStatusBadge,
  PaymentStatusBadge,
  TransactionStatusBadge,
} from "@/app/components/dashboard/StatusBadge"
import SectionMessage from "@/app/components/shared/SectionMessage"

import AppointmentActions from "./AppointmentActions"

const STATUSES: AppointmentStatus[] = ["pending", "confirmed", "cancelled"]

export default async function MyAppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  await requireRole("customer", "/dashboard/customer/appointments")
  const { status: rawStatus } = await searchParams
  const status = STATUSES.includes(rawStatus as AppointmentStatus)
    ? (rawStatus as AppointmentStatus)
    : ""

  // Both endpoints only return the signed-in customer's own records.
  const [appointmentsResult, transactionsResult] = await Promise.all([
    serverApi<AppointmentWithService[]>("/appointments/me"),
    serverApi<TransactionDetails[]>("/transactions/me"),
  ])

  return (
    <>
      <PageHeader
        title="My Appointments"
        description="Track your requests, cancel pending ones, and pay for confirmed visits."
        actions={
          <Button render={<Link href="/services" />} nativeButton={false}>
            <SparklesIcon />
            Book a service
          </Button>
        }
      />

      {appointmentsResult.error !== null ? (
        <DataError message={appointmentsResult.error} />
      ) : (
        <AppointmentsSection
          appointments={appointmentsResult.data}
          status={status}
        />
      )}

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold">Payment history</h2>
        {transactionsResult.error !== null ? (
          <DataError message={transactionsResult.error} />
        ) : transactionsResult.data.length === 0 ? (
          <SectionMessage
            icon={<ReceiptIcon className="size-6" />}
            title="No payments yet"
            description="Payments for your confirmed appointments will appear here."
          />
        ) : (
          <div className="rounded-2xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Service</TableHead>
                  <TableHead>Appointment</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Reference
                  </TableHead>
                  <TableHead className="pr-4">Paid on</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactionsResult.data.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="pl-4 font-medium">
                      {t.service?.serviceName ?? "—"}
                    </TableCell>
                    <TableCell>
                      {formatAppointmentDate(t.appointmentDate)}
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {formatMoney(t.amount, t.currency)}
                    </TableCell>
                    <TableCell>
                      <TransactionStatusBadge status={t.status} />
                    </TableCell>
                    <TableCell
                      className="hidden font-mono text-xs text-muted-foreground md:table-cell"
                      title={t.stripeSessionId}
                    >
                      {shortRef(t.stripeSessionId)}
                    </TableCell>
                    <TableCell className="pr-4">
                      {formatDate(t.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </>
  )
}

function AppointmentsSection({
  appointments,
  status,
}: {
  appointments: AppointmentWithService[]
  status: AppointmentStatus | ""
}) {
  const count = (s: AppointmentStatus) =>
    appointments.filter((a) => a.status === s).length
  const visible = (
    status ? appointments.filter((a) => a.status === status) : appointments
  )
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <section aria-label="Appointments">
      <StatusTabs
        basePath="/dashboard/customer/appointments"
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
          title={status ? `No ${status} appointments` : "No appointments yet"}
          description={
            status
              ? "Try another filter to see the rest of your appointments."
              : "When you request an appointment, it will show up here."
          }
          action={
            !status && (
              <Button render={<Link href="/services" />} nativeButton={false}>
                Browse services
              </Button>
            )
          }
        />
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Service</TableHead>
                <TableHead>Date &amp; time</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="hidden lg:table-cell">
                  Requested
                </TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((a) => {
                const name =
                  a.service?.serviceName ?? "Service no longer available"
                const when = `${formatAppointmentDate(a.appointmentDate)} at ${timeSlotLabel(a.timeSlot)}`
                return (
                  <TableRow key={a._id}>
                    <TableCell className="pl-4">
                      <div className="flex min-w-48 items-center gap-3">
                        <ServiceThumb src={a.service?.image} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {a.service?.category ?? "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <p>{formatAppointmentDate(a.appointmentDate)}</p>
                      <p className="text-xs text-muted-foreground">
                        {timeSlotLabel(a.timeSlot)}
                      </p>
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {formatPrice(a.servicePrice)}
                    </TableCell>
                    <TableCell>
                      <AppointmentStatusBadge status={a.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={a.paymentStatus} />
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">
                      {formatDate(a.createdAt)}
                    </TableCell>
                    <TableCell className="pr-4">
                      <AppointmentActions
                        id={a._id}
                        serviceName={name}
                        whenLabel={when}
                        status={a.status}
                        paymentStatus={a.paymentStatus}
                        details={
                          <DetailsList
                            rows={[
                              { label: "Service", value: name },
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
                                  <PaymentStatusBadge
                                    status={a.paymentStatus}
                                  />
                                ),
                              },
                              {
                                label: "Requested on",
                                value: formatDate(a.createdAt),
                              },
                              {
                                label: "Your message",
                                value: a.message || "—",
                              },
                            ]}
                          />
                        }
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}
