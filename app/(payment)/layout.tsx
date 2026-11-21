import type { Metadata } from "next"
import { NO_INDEX } from "@/lib/seo"

export const metadata: Metadata = {
  robots: NO_INDEX,
}

/** Centered card layout for the pages Stripe Checkout returns to. */
export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex flex-1 items-center px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-xl">{children}</div>
    </main>
  )
}
