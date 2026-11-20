"use client"

import { useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"

import { scrollToSection } from "@/lib/pagination"
import { filtersToSearchParams } from "@/lib/service-filters"
import type { ServiceFilters } from "@/app/components/types/service"

/** id of the results <section>, used to scroll it into view on page change. */
export const RESULTS_SECTION_ID = "service-results"

/**
 * Updates the Browse Services URL (search, category, sort, page, perPage).
 * The server page re-renders with the new filters; `isPending` is true meanwhile.
 * `preserveParams` are extra query params kept on every navigation (e.g. the
 * admin page's `status` tab); empty values are left out.
 */
export function useServicesNavigation(
  filters: ServiceFilters,
  preserveParams: Record<string, string> = {}
) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function navigate(
    next: Partial<ServiceFilters>,
    {
      mode = "push",
      scroll = false,
    }: { mode?: "push" | "replace"; scroll?: boolean } = {}
  ) {
    const params = filtersToSearchParams({ ...filters, ...next })
    for (const [key, value] of Object.entries(preserveParams)) {
      if (value) params.set(key, value)
    }
    const query = params.toString()
    const url = query ? `${pathname}?${query}` : pathname

    if (scroll) scrollToSection(RESULTS_SECTION_ID)
    startTransition(() => {
      // Next's own scroll-to-top is disabled; we control scrolling ourselves.
      if (mode === "push") router.push(url, { scroll: false })
      else router.replace(url, { scroll: false })
    })
  }

  return { navigate, isPending }
}
