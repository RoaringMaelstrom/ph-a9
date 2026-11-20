import Link from "next/link"
import { parseISO, startOfDay } from "date-fns"
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  CalendarIcon,
  CircleCheckIcon,
  ClockIcon,
  CreditCardIcon,
  SparklesIcon,
  XCircleIcon,
} from "lucide-react"

import { requireRole } from "@/lib/session"
import { serverApi } from "@/lib/server-api"
import { timeSlotLabel } from "@/lib/booking"
import { formatAppointmentDate, formatPrice } from "@/lib/format"
import type { AppointmentWithService } from "@/app/components/types/appointment"
import type { CustomerStats } from "@/app/components/types/dashboard"
import { Button } from "@/components/ui/button"
import DataError from "@/app/components/dashboard/DataError"
import PageHeader from "@/app/components/dashboard/PageHeader"
import ServiceThumb from "@/app/components/dashboard/ServiceThumb"
import StatCard from "@/app/components/dashboard/StatCard"
import { AppointmentStatusBadge } from "@/app/components/dashboard/StatusBadge"

export default async function CustomerOverviewPage() {
  const user = await requireRole("customer", "/dashboard/customer")
  const result = await serverApi<AppointmentWithService[]>("/appointments/me")

  const firstName = user.name.split(" ")[0]
  const header = (
    <PageHeader
      title={`Welcome back, ${firstName}`}
      description="Here's a summary of your salon appointments."
      actions={
        <Button render={<Link href="/services" />} nativeButton={false}>
          <SparklesIcon />
          Book a service
        </Button>
      }
    />
  )

  if (result.error !== null) {
    return (
      <>
        {header}
        <DataError message={result.error} />
      </>
    )
  }

  const appointments = result.data
  const stats: CustomerStats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  }
  const awaitingPayment = appointments.filter(
    (a) => a.status === "confirmed" && a.paymentStatus === "unpaid"
  ).length

  const today = startOfDay(new Date())
  const upcoming = appointments
    .filter(
      (a) => a.status !== "cancelled" && parseISO(a.appointmentDate) >= today
    )
    .sort(
      (a, b) =>
        a.appointmentDate.localeCompare(b.appointmentDate) ||
        a.timeSlot.localeCompare(b.timeSlot)
    )
    .slice(0, 4)

  return (
    <>
      {header}

      <section
        aria-label="Appointment statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          label="Total Requests"
          value={stats.total}
          icon={CalendarIcon}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          icon={ClockIcon}
          tone="warning"
        />
        <StatCard
          label="Confirmed"
          value={stats.confirmed}
          icon={CircleCheckIcon}
          tone="success"
        />
        <StatCard
          label="Cancelled"
          value={stats.cancelled}
          icon={XCircleIcon}
          tone="destructive"
        />
      </section>

      {awaitingPayment > 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <CreditCardIcon className="size-4" />
            </span>
            <div>
              <p className="font-semibold">
                {awaitingPayment} confirmed{" "}
                {awaitingPayment === 1 ? "appointment is" : "appointments are"}{" "}
                awaiting payment
              </p>
              <p className="text-sm text-muted-foreground">
                Pay securely with Stripe to complete your booking.
              </p>
            </div>
          </div>
          <Button
            render={
              <Link href="/dashboard/customer/appointments?status=confirmed" />
            }
            nativeButton={false}
            className="shrink-0"
          >
            Pay now
          </Button>
        </div>
      )}

      <section className="mt-8 rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <h2 className="font-semibold">Upcoming appointments</h2>
          <Link
            href="/dashboard/customer/appointments"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            View all
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>

        {upcoming.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarCheckIcon className="size-5" />
            </span>
            <p className="mt-3 font-medium">No upcoming appointments</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse our menu and request your next visit.
            </p>
            <Button
              className="mt-4"
              variant="outline"
              render={<Link href="/services" />}
              nativeButton={false}
            >
              Browse services
            </Button>
          </div>
        ) : (
          <ul className="divide-y">
            {upcoming.map((a) => (
              <li key={a._id} className="flex items-center gap-4 px-5 py-4">
                <ServiceThumb src={a.service?.image} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {a.service?.serviceName ?? "Service no longer available"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatAppointmentDate(a.appointmentDate)} ·{" "}
                    {timeSlotLabel(a.timeSlot)}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold">
                    {formatPrice(a.servicePrice)}
                  </p>
                </div>
                <AppointmentStatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
