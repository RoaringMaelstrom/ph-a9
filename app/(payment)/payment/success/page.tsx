import type { Metadata } from "next"
import Link from "next/link"
import { ReceiptIcon } from "lucide-react"

import { requireRole } from "@/lib/session"
import { serverApi } from "@/lib/server-api"
import type { CheckoutSessionStatus } from "@/app/components/types/payment"
import { Button } from "@/components/ui/button"
import DataError from "@/app/components/dashboard/DataError"

import PaymentCard from "../PaymentCard"
import PaymentStatusView from "./PaymentStatusView"

export const metadata: Metadata = {
  title: "Payment",
}

const SESSION_ID_PATTERN = /^cs_(test|live)_[A-Za-z0-9]{10,250}$/

/**
 * Stripe Checkout returns here with `?session_id=`. This page never marks
 * anything as paid: it shows the status our server recorded from the verified
 * Stripe webhook, and keeps checking while that webhook is on its way.
 */
export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string | string[] }>
}) {
  const { session_id } = await searchParams
  const sessionId = typeof session_id === "string" ? session_id : ""

  // Guests → sign-in, blocked → /account-blocked, admins → their dashboard.
  await requireRole(
    "customer",
    sessionId
      ? `/payment/success?session_id=${encodeURIComponent(sessionId)}`
      : "/payment/success"
  )

  if (!SESSION_ID_PATTERN.test(sessionId)) {
    return (
      <PaymentCard
        icon={<ReceiptIcon className="size-7" />}
        title="No payment to show"
        description="This link doesn't point to a payment. You can check your payment status on the My Appointments page."
        actions={<AppointmentsButton />}
      />
    )
  }

  // Only the customer who started this Checkout Session can read it.
  const result = await serverApi<CheckoutSessionStatus>(
    `/payments/checkout-session/${sessionId}`
  )

  if (result.error !== null) {
    return (
      <div className="space-y-6">
        <DataError message={result.error} />
        <div className="flex justify-center">
          <AppointmentsButton />
        </div>
      </div>
    )
  }

  return <PaymentStatusView sessionId={sessionId} initial={result.data} />
}

function AppointmentsButton() {
  return (
    <Button
      render={<Link href="/dashboard/customer/appointments" />}
      nativeButton={false}
    >
      Go to My Appointments
    </Button>
  )
}
