import type { Metadata } from "next"
import Link from "next/link"
import { CircleXIcon } from "lucide-react"

import { requireRole } from "@/lib/session"
import { serverApi } from "@/lib/server-api"
import { isValidObjectId } from "@/lib/api"
import { timeSlotLabel } from "@/lib/booking"
import { formatAppointmentDate, formatPrice } from "@/lib/format"
import type { AppointmentWithService } from "@/app/components/types/appointment"
import { Button } from "@/components/ui/button"
import DetailsList from "@/app/components/dashboard/DetailsList"
import { PaymentStatusBadge } from "@/app/components/dashboard/StatusBadge"
import PayNowButton from "@/app/components/shared/PayNowButton"

import PaymentCard from "../PaymentCard"
import ToastOnMount from "../ToastOnMount"

export const metadata: Metadata = {
  title: "Payment cancelled | SalonBook",
}

/**
 * Stripe Checkout returns here when the customer backs out. Nothing was
 * charged and nothing changes on the appointment. If it's still payable, the
 * customer can start a new checkout right away.
 */
export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ appointment_id?: string | string[] }>
}) {
  const { appointment_id } = await searchParams
  const appointmentId =
    typeof appointment_id === "string" && isValidObjectId(appointment_id)
      ? appointment_id
      : ""

  // Guests → sign-in, blocked → /account-blocked, admins → their dashboard.
  await requireRole(
    "customer",
    appointmentId
      ? `/payment/cancel?appointment_id=${appointmentId}`
      : "/payment/cancel"
  )

  // Only the customer's own appointments are returned, so someone else's id
  // simply isn't found.
  let appointment: AppointmentWithService | null = null
  if (appointmentId) {
    const result = await serverApi<AppointmentWithService[]>("/appointments/me")
    appointment =
      result.data?.find((item) => item._id === appointmentId) ?? null
  }

  const canRetry =
    appointment?.status === "confirmed" && appointment.paymentStatus === "unpaid"

  return (
    <>
      <ToastOnMount
        title="Payment cancelled"
        description="You haven't been charged."
        type="warning"
      />
      <PaymentCard
        tone="warning"
        icon={<CircleXIcon className="size-7" />}
        title="Payment cancelled"
        description={
          canRetry
            ? "You left the checkout before paying, so you haven't been charged. Your appointment is still confirmed; you can pay now or later from My Appointments."
            : "You left the checkout before paying, so you haven't been charged."
        }
        actions={
          <>
            <Button
              variant={canRetry ? "outline" : "default"}
              render={<Link href="/dashboard/customer/appointments" />}
              nativeButton={false}
            >
              Go to My Appointments
            </Button>
            {canRetry && (
              <PayNowButton
                appointmentId={appointment!._id}
                label="Try again"
                size="default"
              />
            )}
          </>
        }
      >
        {appointment && (
          <DetailsList
            rows={[
              {
                label: "Service",
                value: appointment.service?.serviceName ?? "Deleted service",
              },
              {
                label: "Appointment",
                value: `${formatAppointmentDate(appointment.appointmentDate)} at ${timeSlotLabel(appointment.timeSlot)}`,
              },
              { label: "Amount", value: formatPrice(appointment.servicePrice) },
              {
                label: "Payment status",
                value: <PaymentStatusBadge status={appointment.paymentStatus} />,
              },
            ]}
          />
        )}
      </PaymentCard>
    </>
  )
}
