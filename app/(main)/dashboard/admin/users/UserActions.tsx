"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { BanIcon, EyeIcon, UnlockIcon } from "lucide-react"

import { setUserBlocked } from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import ConfirmDialog from "@/app/components/dashboard/ConfirmDialog"
import DetailsDialog from "@/app/components/dashboard/DetailsDialog"

/** View details and block/unblock a customer account. */
export default function UserActions({
  id,
  name,
  isBlocked,
  canBlock,
  details,
}: {
  id: string
  name: string
  isBlocked: boolean
  /** False for admin accounts (including yourself) */
  canBlock: boolean
  details: React.ReactNode
}) {
  const router = useRouter()
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function toggleBlock() {
    try {
      await setUserBlocked(id, !isBlocked)
      toast.add({
        title: isBlocked ? "User unblocked" : "User blocked",
        description: isBlocked
          ? `${name} can use the platform again.`
          : `${name} can no longer sign in or book appointments.`,
        type: "success",
      })
      router.refresh()
    } catch (err) {
      toast.add({
        title: isBlocked ? "Couldn't unblock user" : "Couldn't block user",
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
        aria-label={`View details for ${name}`}
        onClick={() => setDetailsOpen(true)}
      >
        <EyeIcon />
      </Button>
      {canBlock &&
        (isBlocked ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmOpen(true)}
          >
            <UnlockIcon />
            Unblock
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmOpen(true)}
          >
            <BanIcon />
            Block
          </Button>
        ))}

      <DetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        title={name}
      >
        {details}
      </DetailsDialog>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={isBlocked ? `Unblock ${name}?` : `Block ${name}?`}
        description={
          isBlocked
            ? "They'll be able to sign in, book appointments and pay again."
            : "They'll be signed out and won't be able to use their dashboard, book appointments or pay until you unblock them."
        }
        confirmLabel={isBlocked ? "Unblock user" : "Block user"}
        destructive={!isBlocked}
        onConfirm={toggleBlock}
      />
    </div>
  )
}
