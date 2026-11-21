"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import {
  CircleAlertIcon,
  CircleCheckIcon,
  ClockIcon,
  RefreshCwIcon,
} from "lucide-react"

import { getCheckoutSessionStatus } from "@/lib/api-client"
import { timeSlotLabel } from "@/lib/booking"
import {
  formatAppointmentDate,
  formatDate,
  formatMoney,
  shortRef,
} from "@/lib/format"
import type { CheckoutSessionStatus } from "@/app/components/types/payment"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import DetailsList from "@/app/components/dashboard/DetailsList"
import { PaymentStatusBadge } from "@/app/components/dashboard/StatusBadge"

import PaymentCard from "../PaymentCard"

/** How often / how long to wait for the Stripe webhook to be processed. */
const POLL_INTERVAL_MS = 2500
const MAX_POLLS = 12

type View = "paid" | "processing" | "failed" | "incomplete"

/**
 * "Paid" only when our database says so (appointment paid + transaction
 * saved, both written by the verified webhook). Stripe's own "paid" just
 * means the webhook is still on its way.
 */
function viewFor(status: CheckoutSessionStatus): View {
  if (status.transaction?.status === "failed") return "failed"
  if (
    status.transaction?.status === "paid" &&
    status.appointment?.paymentStatus === "paid"
  ) {
    return "paid"
  }
  if (status.stripePaymentStatus !== "unpaid") return "processing"
  // Delayed payment methods: checkout finished, money not settled yet.
  if (status.checkoutStatus === "complete") return "processing"
  return "incomplete"
}

export default function PaymentStatusView({
  sessionId,
  initial,
}: {
  sessionId: string
  initial: CheckoutSessionStatus
}) {
  const [status, setStatus] = useState(initial)
  const [polls, setPolls] = useState(0)
  const [checking, setChecking] = useState(false)
  const toasted = useRef(false)
  const view = viewFor(status)
  const waiting = view === "processing" && polls < MAX_POLLS

  // Keep checking while the webhook is being processed.
  useEffect(() => {
    if (!waiting) return
    const timer = setTimeout(async () => {
      try {
        setStatus(await getCheckoutSessionStatus(sessionId))
      } catch {
        // Temporary error: try again on the next tick.
      }
      setPolls((n) => n + 1)
    }, POLL_INTERVAL_MS)
    return () => clearTimeout(timer)
  }, [waiting, polls, sessionId])

  useEffect(() => {
    if (toasted.current) return
    if (view === "paid") {
      toasted.current = true
      toast.add({ title: "Payment successful", type: "success" })
    } else if (view === "failed") {
      toasted.current = true
      toast.add({ title: "Payment failed", type: "error" })
    }
  }, [view])

  async function checkAgain() {
    setChecking(true)
    try {
      setStatus(await getCheckoutSessionStatus(sessionId))
      setPolls(0)
    } catch (err) {
      toast.add({
        title: "Couldn't check the payment",
        description: err instanceof Error ? err.message : "Please try again.",
        type: "error",
      })
    } finally {
      setChecking(false)
    }
  }

  const appointment = status.appointment
  const amount = formatMoney(
    status.transaction?.amount ?? status.amount,
    status.transaction?.currency ?? status.currency
  )

  const details = (
    <DetailsList
      rows={[
        {
          label: "Service",
          value: appointment?.service?.serviceName ?? "Salon appointment",
        },
        ...(appointment
          ? [
              {
                label: "Appointment",
                value: `${formatAppointmentDate(appointment.appointmentDate)} at ${timeSlotLabel(appointment.timeSlot)}`,
              },
              {
                label: "Payment status",
                value: (
                  <PaymentStatusBadge status={appointment.paymentStatus} />
                ),
              },
            ]
          : []),
        { label: "Amount", value: amount },
        {
          label: "Reference",
          value: (
            <span className="font-mono text-xs" title={sessionId}>
              {shortRef(sessionId)}
            </span>
          ),
        },
        ...(status.transaction
          ? [{ label: "Date", value: formatDate(status.transaction.createdAt) }]
          : []),
      ]}
    />
  )

  const appointmentsButton = (
    <Button
      variant={view === "paid" ? "outline" : "default"}
      render={<Link href="/dashboard/customer/appointments" />}
      nativeButton={false}
    >
      Go to My Appointments
    </Button>
  )

  if (view === "paid") {
    return (
      <PaymentCard
        tone="success"
        icon={<CircleCheckIcon className="size-7" />}
        title="Payment successful"
        description="Thank you! Your appointment is confirmed and paid. We look forward to seeing you."
        actions={
          <>
            {appointmentsButton}
            <Button render={<Link href="/services" />} nativeButton={false}>
              Book another service
            </Button>
          </>
        }
      >
        {details}
      </PaymentCard>
    )
  }

  if (view === "failed") {
    return (
      <PaymentCard
        tone="destructive"
        icon={<CircleAlertIcon className="size-7" />}
        title="Payment failed"
        description="Your bank didn't complete the payment, so your appointment is still unpaid. You can try again from My Appointments."
        actions={appointmentsButton}
      >
        {details}
      </PaymentCard>
    )
  }

  if (view === "incomplete") {
    return (
      <PaymentCard
        tone="warning"
        icon={<CircleAlertIcon className="size-7" />}
        title="Payment not completed"
        description={
          status.checkoutStatus === "expired"
            ? "This checkout page expired before the payment was made. You haven't been charged."
            : "We haven't received this payment. You haven't been charged."
        }
        actions={appointmentsButton}
      >
        {details}
      </PaymentCard>
    )
  }

  // processing
  return (
    <PaymentCard
      tone="primary"
      icon={
        waiting ? (
          <Spinner className="size-7" />
        ) : (
          <ClockIcon className="size-7" />
        )
      }
      title={waiting ? "Confirming your payment..." : "Payment is processing"}
      description={
        waiting
          ? "Stripe has received your payment. We're waiting for the confirmation, which usually takes a few seconds."
          : "This is taking longer than usual. Your payment status will update automatically once Stripe confirms it, so you can check again or come back later."
      }
      actions={
        <>
          {appointmentsButton}
          {!waiting && (
            <Button variant="outline" onClick={checkAgain} disabled={checking}>
              {checking ? <Spinner /> : <RefreshCwIcon />}
              Check again
            </Button>
          )}
        </>
      }
    >
      {details}
    </PaymentCard>
  )
}
