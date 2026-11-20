import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeftIcon } from "lucide-react"

import { requireRole } from "@/lib/session"
import { serverApi } from "@/lib/server-api"
import { isValidObjectId } from "@/lib/api"
import type { Service } from "@/app/components/types/service"
import { Button } from "@/components/ui/button"
import DataError from "@/app/components/dashboard/DataError"
import PageHeader from "@/app/components/dashboard/PageHeader"

import ServiceForm from "../../ServiceForm"

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireRole("admin", `/dashboard/admin/services/${id}/edit`)
  if (!isValidObjectId(id)) notFound()

  // Fresh (uncached) read so the form never shows stale values.
  const result = await serverApi<Service>(`/services/${id}`)

  return (
    <>
      <PageHeader
        title="Update Service"
        description={
          result.data ? result.data.serviceName : "Edit service details."
        }
        actions={
          <Button
            variant="outline"
            render={<Link href="/dashboard/admin/services" />}
            nativeButton={false}
          >
            <ArrowLeftIcon />
            All services
          </Button>
        }
      />
      {result.error !== null ? (
        <DataError message={result.error} />
      ) : !result.data?._id ? (
        notFound()
      ) : (
        <ServiceForm service={result.data} />
      )}
    </>
  )
}
