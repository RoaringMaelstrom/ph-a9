"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EyeIcon, XIcon } from "lucide-react"

import { ApiError, cancelMyAppointment } from "@/lib/api-client"
import type {
  AppointmentStatus,
  PaymentStatus,
} from "@/app/components/types/appointment"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import ConfirmDialog from "@/app/components/dashboard/ConfirmDialog"
import DetailsDialog from "@/app/components/dashboard/DetailsDialog"
import PayNowButton from "@/app/components/shared/PayNowButton"

/**
 * Row actions for "My Appointments". Buttons only appear when the action is
 * allowed (cancel: pending; pay: confirmed + unpaid), and the server checks
 * the same rules again.
 */
export default function AppointmentActions({
  id,
  serviceName,
  whenLabel,
  status,
  paymentStatus,
  details,
}: {
  id: string
  serviceName: string
  whenLabel: string
  status: AppointmentStatus
  paymentStatus: PaymentStatus
  /** Server-rendered details shown in the dialog */
  details: React.ReactNode
}) {
  const router = useRouter()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  const canCancel = status === "pending"
  const canPay = status === "confirmed" && paymentStatus === "unpaid"

  async function handleCancel() {
    try {
      await cancelMyAppointment(id)
      toast.add({ title: "Appointment cancelled", type: "success" })
      router.refresh()
    } catch (err) {
      toast.add({
        title: "Couldn't cancel appointment",
        description: err instanceof Error ? err.message : "Please try again.",
        type: "error",
      })
      if (err instanceof ApiError && err.status === 409) router.refresh()
      throw err
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`View details for ${serviceName}`}
        onClick={() => setDetailsOpen(true)}
      >
        <EyeIcon />
      </Button>

      {canPay && <PayNowButton appointmentId={id} />}

      {canCancel && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setCancelOpen(true)}
        >
          <XIcon />
          Cancel
        </Button>
      )}

      <DetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        title={serviceName}
        description={whenLabel}
      >
        {details}
      </DetailsDialog>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel this appointment request?"
        description={
          <>
            Your request for <strong>{serviceName}</strong> on {whenLabel} will
            be cancelled. This can&apos;t be undone.
          </>
        }
        confirmLabel="Cancel appointment"
        destructive
        onConfirm={handleCancel}
      />
    </div>
  )
}
