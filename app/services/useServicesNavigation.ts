"use client"

import { useTransition } from "react"
import { usePathname, useRouter } from "next/navigation"

import { filtersToSearchParams } from "@/lib/service-filters"
import type { ServiceFilters } from "@/app/components/types/service"

/** id of the results <section>, used to scroll it into view on page change. */
export const RESULTS_SECTION_ID = "service-results"

/** Scrolls the results section (not the whole page) to the top of the viewport. */
export function scrollToResults() {
  const el = document.getElementById(RESULTS_SECTION_ID)
  if (!el) return
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches
  el.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  })
}

/**
 * Updates the Browse Services URL (search, category, sort, page, perPage).
 * The server page re-renders with the new filters; `isPending` is true meanwhile.
 */
export function useServicesNavigation(filters: ServiceFilters) {
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
    const query = filtersToSearchParams({ ...filters, ...next }).toString()
    const url = query ? `${pathname}?${query}` : pathname

    if (scroll) scrollToResults()
    startTransition(() => {
      // Next's own scroll-to-top is disabled; we control scrolling ourselves.
      if (mode === "push") router.push(url, { scroll: false })
      else router.replace(url, { scroll: false })
    })
  }

  return { navigate, isPending }
}
