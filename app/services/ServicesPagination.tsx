"use client"

import type { ServiceFilters } from "@/app/components/types/service"
import PaginationBar from "@/app/components/shared/PaginationBar"

import { useServicesNavigation } from "./useServicesNavigation"

/**
 * Page navigation for Browse Services. Changing page updates `?page=` and
 * scrolls the results section (not the whole page) back to its top.
 */
export default function ServicesPagination({
  filters,
  page,
  totalPages,
}: {
  filters: ServiceFilters
  /** Current page (already clamped by the server) */
  page: number
  totalPages: number
}) {
  const { navigate } = useServicesNavigation(filters)

  return (
    <PaginationBar
      page={page}
      totalPages={totalPages}
      onPageChange={(target) => navigate({ page: target }, { scroll: true })}
      label="Services pages"
      className="mt-10"
    />
  )
}
