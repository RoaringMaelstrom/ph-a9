import { CircleXIcon } from "lucide-react"

import PaymentCardSkeleton from "../PaymentCardSkeleton"

/**
 * Payment cancelled while the appointment loads. The icon and title never
 * change, so they're shown for real; the description and details depend on
 * the appointment.
 */
export default function PaymentCancelLoading() {
  return (
    <PaymentCardSkeleton
      label="Loading appointment"
      icon={<CircleXIcon className="size-7" />}
      iconClassName="bg-warning/10 text-warning"
      title="Payment cancelled"
      descriptionLines={3}
      rows={[
        ["Service", "w-40"],
        ["Appointment", "w-52"],
        ["Amount", "w-12"],
        ["Payment status", "badge"],
      ]}
      actions={["sm:w-48", "sm:w-28"]}
    />
  )
}
