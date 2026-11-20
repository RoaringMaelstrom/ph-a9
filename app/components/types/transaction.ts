import type { CustomerSummary, ServiceSummary } from "./appointment"

/** Only ever written by the verified Stripe webhook on the server. */
export type TransactionStatus = "paid" | "failed"

export interface Transaction {
  _id: string
  appointmentId: string
  customerId: string
  amount: number
  /** ISO 4217, e.g. "usd" */
  currency: string
  stripeSessionId: string
  status: TransactionStatus
  createdAt: string
}

/** Transaction with related data populated by the API for display. */
export interface TransactionDetails extends Transaction {
  service: ServiceSummary | null
  customer: CustomerSummary | null
  /** "YYYY-MM-DD" of the related appointment */
  appointmentDate: string | null
}
