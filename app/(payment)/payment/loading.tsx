import { Spinner } from "@/components/ui/spinner"

/** Shown while the payment pages check the session with the server. */
export default function PaymentLoading() {
  return (
    <div className="flex flex-col items-center rounded-2xl border bg-card px-6 py-14 text-center">
      <Spinner className="size-8 text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">
        Checking your payment...
      </p>
    </div>
  )
}
