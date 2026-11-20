"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EyeIcon, EyeOffIcon, PencilIcon, Trash2Icon } from "lucide-react"

import { deleteService, updateService } from "@/lib/api-client"
import type { ServiceStatus } from "@/app/components/types/service"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "@/components/ui/toast"
import ConfirmDialog from "@/app/components/dashboard/ConfirmDialog"

import { refreshServicesCache } from "./actions"

/** Activate/deactivate, edit and delete a service. */
export default function ServiceRowActions({
  id,
  name,
  status,
}: {
  id: string
  name: string
  status: ServiceStatus
}) {
  const router = useRouter()
  const [toggling, setToggling] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const nextStatus: ServiceStatus = status === "active" ? "inactive" : "active"

  async function toggleStatus() {
    setToggling(true)
    try {
      await updateService(id, { status: nextStatus })
      await refreshServicesCache(id).catch(() => {})
      toast.add({
        title:
          nextStatus === "active" ? "Service activated" : "Service deactivated",
        description:
          nextStatus === "active"
            ? `${name} is now visible and bookable.`
            : `${name} is hidden from the site.`,
        type: "success",
      })
      router.refresh()
    } catch (err) {
      toast.add({
        title: "Couldn't update status",
        description: err instanceof Error ? err.message : "Please try again.",
        type: "error",
      })
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteService(id)
      await refreshServicesCache(id).catch(() => {})
      toast.add({
        title: "Service deleted",
        description: name,
        type: "success",
      })
      router.refresh()
    } catch (err) {
      toast.add({
        title: "Couldn't delete service",
        description: err instanceof Error ? err.message : "Please try again.",
        type: "error",
      })
      throw err
    }
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleStatus}
        disabled={toggling}
        aria-label={
          nextStatus === "active" ? `Activate ${name}` : `Deactivate ${name}`
        }
      >
        {toggling ? (
          <Spinner />
        ) : nextStatus === "active" ? (
          <EyeIcon />
        ) : (
          <EyeOffIcon />
        )}
        <span className="hidden xl:inline">
          {nextStatus === "active" ? "Activate" : "Deactivate"}
        </span>
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Edit ${name}`}
        render={<Link href={`/dashboard/admin/services/${id}/edit`} />}
        nativeButton={false}
      >
        <PencilIcon />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete ${name}`}
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2Icon />
      </Button>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this service?"
        description={
          <>
            <strong>{name}</strong> will be permanently removed from the menu.
            Existing appointments keep their details. To hide it temporarily,
            deactivate it instead.
          </>
        }
        confirmLabel="Delete service"
        destructive
        onConfirm={handleDelete}
      />
    </div>
  )
}
