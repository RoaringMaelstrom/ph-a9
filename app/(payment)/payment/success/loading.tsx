import PaymentCardSkeleton from "../PaymentCardSkeleton"

/**
 * Payment success while the session status loads. The result (paid,
 * processing, failed...) isn't known yet, so the icon and title are
 * placeholders; the details labels are those of a completed payment.
 */
export default function PaymentSuccessLoading() {
  return (
    <PaymentCardSkeleton
      label="Checking your payment"
      rows={[
        ["Service", "w-40"],
        ["Appointment", "w-52"],
        ["Payment status", "badge"],
        ["Amount", "w-16"],
        ["Reference", "w-32"],
        ["Date", "w-24"],
      ]}
      actions={["sm:w-48", "sm:w-44"]}
    />
  )
}
