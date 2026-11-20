"use client"

import { useId } from "react"

import { PER_PAGE_OPTIONS } from "@/lib/service-filters"
import type {
  ServiceFilters,
  ServicesPerPage,
} from "@/app/components/types/service"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"

import { useServicesNavigation } from "./useServicesNavigation"

/** "Show [9 ▾] per page". Changing it goes back to page 1. */
export default function PerPageSelect({
  filters,
}: {
  filters: ServiceFilters
}) {
  const { navigate } = useServicesNavigation(filters)
  const id = useId()

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <label htmlFor={id} className="whitespace-nowrap">
        Show
      </label>
      <NativeSelect
        id={id}
        size="sm"
        className="w-20 [&_select]:bg-card"
        value={filters.perPage}
        onChange={(e) =>
          navigate({
            perPage: Number(e.target.value) as ServicesPerPage,
            page: 1,
          })
        }
      >
        {PER_PAGE_OPTIONS.map((n) => (
          <NativeSelectOption key={n} value={n}>
            {n}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <span className="whitespace-nowrap">per page</span>
    </div>
  )
}
