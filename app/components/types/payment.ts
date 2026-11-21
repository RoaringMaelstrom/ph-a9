import type { AppointmentWithService } from "./appointment"
import type { Transaction } from "./transaction"

/**
 * `GET /payments/checkout-session/:sessionId` (customer, own sessions only).
 * Read-only: whether the appointment is paid comes from our database, which
 * only the verified Stripe webhook updates.
 */
export interface CheckoutSessionStatus {
  sessionId: string
  /** Stripe Checkout state: still open, completed, or expired */
  checkoutStatus: "open" | "complete" | "expired" | null
  /** What Stripe reports; shown as "processing" until the webhook arrives */
  stripePaymentStatus: "paid" | "unpaid" | "no_payment_required"
  /** Major units, e.g. 45.5 */
  amount: number
  currency: string
  appointment: AppointmentWithService | null
  /** Created by the webhook; `null` until it has been processed */
  transaction: Transaction | null
}
