import { requireRole } from "@/lib/session"
import PageHeader from "@/app/components/dashboard/PageHeader"

import ServiceForm from "../ServiceForm"

export default async function AddServicePage() {
  await requireRole("admin", "/dashboard/admin/services/new")

  return (
    <>
      <PageHeader
        title="Add Service"
        description="Create a new service for the salon menu. New services are active by default."
      />
      <ServiceForm />
    </>
  )
}
