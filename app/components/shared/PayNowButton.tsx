"use client"

import { useState } from "react"
import { CreditCardIcon } from "lucide-react"

import { startCheckout } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"

/**
 * Starts Stripe Checkout for one appointment and leaves the site for it.
 * The server checks ownership, role, block status and confirmed + unpaid;
 * the amount comes from the stored appointment, not from the browser.
 */
export default function PayNowButton({
  appointmentId,
  label = "Pay Now",
  size = "sm",
}: {
  appointmentId: string
  label?: string
  size?: React.ComponentProps<typeof Button>["size"]
}) {
  const [paying, setPaying] = useState(false)

  async function handlePay() {
    setPaying(true)
    try {
      const { url } = await startCheckout(appointmentId)
      if (!url?.startsWith("https://checkout.stripe.com/")) {
        throw new Error("Stripe didn't return a checkout page.")
      }
      // Full navigation to Stripe Checkout; keep the spinner until we leave.
      window.location.assign(url)
    } catch (err) {
      setPaying(false)
      toast.add({
        title: "Couldn't start payment",
        description: err instanceof Error ? err.message : "Please try again.",
        type: "error",
      })
    }
  }

  return (
    <Button size={size} onClick={handlePay} disabled={paying}>
      {paying ? <Spinner /> : <CreditCardIcon />}
      {paying ? "Redirecting..." : label}
    </Button>
  )
}
