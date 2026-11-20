"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, EyeIcon, XIcon } from "lucide-react"

import { setAppointmentStatus } from "@/lib/api-client"
import type { AppointmentStatus } from "@/app/components/types/appointment"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import ConfirmDialog from "@/app/components/dashboard/ConfirmDialog"
import DetailsDialog from "@/app/components/dashboard/DetailsDialog"

/**
 * Confirm (pending only) / cancel (pending or confirmed) an appointment.
 * Payment status is never editable here; only the Stripe webhook changes it.
 */
export default function AdminAppointmentActions({
  id,
  status,
  summary,
  details,
}: {
  id: string
  status: AppointmentStatus
  /** e.g. "Balayage for Jane Doe on Tue, Nov 24 at 2:00 PM" */
  summary: string
  details: React.ReactNode
}) {
  const router = useRouter()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [action, setAction] = useState<"confirmed" | "cancelled" | null>(null)

  async function apply(next: "confirmed" | "cancelled") {
    try {
      await setAppointmentStatus(id, next)
      toast.add({
        title:
          next === "confirmed"
            ? "Appointment confirmed"
            : "Appointment cancelled",
        description:
          next === "confirmed"
            ? "The customer can now pay for this appointment."
            : undefined,
        type: "success",
      })
      router.refresh()
    } catch (err) {
      toast.add({
        title: next === "confirmed" ? "Couldn't confirm" : "Couldn't cancel",
        description: err instanceof Error ? err.message : "Please try again.",
        type: "error",
      })
      throw err
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="View appointment details"
        onClick={() => setDetailsOpen(true)}
      >
        <EyeIcon />
      </Button>
      {status === "pending" && (
        <Button size="sm" onClick={() => setAction("confirmed")}>
          <CheckIcon />
          Confirm
        </Button>
      )}
      {status !== "cancelled" && (
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setAction("cancelled")}
        >
          <XIcon />
          Cancel
        </Button>
      )}

      <DetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        title="Appointment details"
        description={summary}
      >
        {details}
      </DetailsDialog>

      <ConfirmDialog
        open={action !== null}
        onOpenChange={(open) => !open && setAction(null)}
        title={
          action === "confirmed"
            ? "Confirm this appointment?"
            : "Cancel this appointment?"
        }
        description={
          action === "confirmed"
            ? `${summary}. The customer will be able to pay once it's confirmed.`
            : `${summary}. The customer will see it as cancelled. This can't be undone.`
        }
        confirmLabel={
          action === "confirmed" ? "Confirm appointment" : "Cancel appointment"
        }
        destructive={action === "cancelled"}
        onConfirm={() => apply(action!)}
      />
    </div>
  )
}
