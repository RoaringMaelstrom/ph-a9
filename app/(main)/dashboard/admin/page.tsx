import Link from "next/link"
import {
  ArrowRightIcon,
  CalendarIcon,
  CircleCheckIcon,
  ClockIcon,
  CreditCardIcon,
  InboxIcon,
  PlusIcon,
  SparklesIcon,
  UsersIcon,
} from "lucide-react"

import { requireRole } from "@/lib/session"
import { serverApi } from "@/lib/server-api"
import { timeSlotLabel } from "@/lib/booking"
import { formatAppointmentDate, formatDate } from "@/lib/format"
import type { AppointmentDetails } from "@/app/components/types/appointment"
import type { AdminStats } from "@/app/components/types/dashboard"
import { Button } from "@/components/ui/button"
import DataError from "@/app/components/dashboard/DataError"
import PageHeader from "@/app/components/dashboard/PageHeader"
import StatCard from "@/app/components/dashboard/StatCard"
import UserAvatar from "@/app/components/dashboard/UserAvatar"

export default async function AdminOverviewPage() {
  const user = await requireRole("admin", "/dashboard/admin")

  const [statsResult, pendingResult] = await Promise.all([
    serverApi<AdminStats>("/admin/stats"),
    serverApi<AppointmentDetails[]>(
      "/admin/appointments?status=pending&limit=5"
    ),
  ])

  return (
    <>
      <PageHeader
        title={`Hello, ${user.name.split(" ")[0]}`}
        description="Here's what's happening at the salon."
        actions={
          <Button
            render={<Link href="/dashboard/admin/services/new" />}
            nativeButton={false}
          >
            <PlusIcon />
            Add service
          </Button>
        }
      />

      {statsResult.error !== null ? (
        <DataError message={statsResult.error} />
      ) : (
        <section
          aria-label="Salon statistics"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <StatCard
            label="Registered Customers"
            value={statsResult.data.totalCustomers}
            icon={UsersIcon}
            tone="info"
          />
          <StatCard
            label="Active Services"
            value={statsResult.data.activeServices}
            icon={SparklesIcon}
            tone="gold"
          />
          <StatCard
            label="Total Appointment Requests"
            value={statsResult.data.totalAppointments}
            icon={CalendarIcon}
          />
          <StatCard
            label="Pending Appointments"
            value={statsResult.data.pendingAppointments}
            icon={ClockIcon}
            tone="warning"
          />
          <StatCard
            label="Confirmed Appointments"
            value={statsResult.data.confirmedAppointments}
            icon={CircleCheckIcon}
            tone="success"
          />
          <StatCard
            label="Successful Payments"
            value={statsResult.data.successfulPayments}
            icon={CreditCardIcon}
            tone="success"
          />
        </section>
      )}

      <section className="mt-8 rounded-2xl border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b px-5 py-4">
          <h2 className="font-semibold">Pending requests</h2>
          <Link
            href="/dashboard/admin/appointments?status=pending"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Review all
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>

        {pendingResult.error !== null ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            {pendingResult.error}
          </p>
        ) : pendingResult.data.filter((a) => a.status === "pending").length ===
          0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-success/15 text-success">
              <InboxIcon className="size-5" />
            </span>
            <p className="mt-3 font-medium">You&apos;re all caught up</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No appointment requests are waiting for review.
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {pendingResult.data
              .filter((a) => a.status === "pending")
              .slice(0, 5)
              .map((a) => (
                <li key={a._id} className="flex items-center gap-4 px-5 py-4">
                  <UserAvatar
                    name={a.customer?.name}
                    image={a.customer?.image}
                    className="size-9"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">
                      {a.customer?.name ?? "Deleted account"}
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        · {a.service?.serviceName ?? "Deleted service"}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatAppointmentDate(a.appointmentDate)} ·{" "}
                      {timeSlotLabel(a.timeSlot)}
                    </p>
                  </div>
                  <p className="hidden text-xs text-muted-foreground sm:block">
                    Requested {formatDate(a.createdAt)}
                  </p>
                </li>
              ))}
          </ul>
        )}
      </section>
    </>
  )
}
