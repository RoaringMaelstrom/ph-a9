"use client"

import { useEffect, useState } from "react"
import { ArrowUpDownIcon, SearchIcon, XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { SERVICE_CATEGORIES } from "@/lib/site"
import { SORT_OPTIONS } from "@/lib/service-filters"
import type {
  ServiceFilters,
  ServiceSort,
} from "@/app/components/types/service"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"

import { useServicesNavigation } from "./useServicesNavigation"

const SEARCH_DEBOUNCE_MS = 350

/**
 * Search, category filter and sort controls. All state lives in the URL
 * (`?search=&category=&sort=`), so results are shareable and survive reloads.
 * The server page re-fetches whenever the URL changes.
 */
export default function ServicesToolbar({
  filters,
}: {
  filters: ServiceFilters
}) {
  const { navigate: navigateTo, isPending } = useServicesNavigation(filters)

  // Local input value so typing stays responsive; synced to the URL (debounced).
  const [search, setSearch] = useState(filters.search)
  // Last URL value we've seen, and the last value *we* pushed. When the URL
  // changes for another reason (back button, footer category link), adopt it.
  const [seenSearch, setSeenSearch] = useState(filters.search)
  const [pushedSearch, setPushedSearch] = useState<string | null>(null)
  if (filters.search !== seenSearch) {
    setSeenSearch(filters.search)
    if (filters.search !== pushedSearch) setSearch(filters.search)
  }

  /** Any search/category/sort change starts again from page 1. */
  function navigate(next: Partial<ServiceFilters>, mode: "push" | "replace") {
    const searchTerm = next.search ?? search.trim()
    setPushedSearch(searchTerm)
    navigateTo({ ...next, search: searchTerm, page: 1 }, { mode })
  }

  // Debounced search → URL
  useEffect(() => {
    const term = search.trim()
    if (term === filters.search) return
    const id = setTimeout(() => {
      setPushedSearch(term)
      navigateTo({ search: term, page: 1 }, { mode: "replace" })
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(id)
    // navigateTo is recreated every render but only reads `filters`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filters])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <form
          role="search"
          className="flex-1"
          onSubmit={(e) => {
            e.preventDefault()
            navigate({}, "replace")
          }}
        >
          <InputGroup className="h-10 bg-card">
            <InputGroupAddon>
              {isPending ? <Spinner /> : <SearchIcon />}
            </InputGroupAddon>
            <InputGroupInput
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search services by name..."
              aria-label="Search services by name"
              maxLength={100}
              className="[&::-webkit-search-cancel-button]:hidden"
            />
            {search && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearch("")
                    navigate({ search: "" }, "replace")
                  }}
                >
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
        </form>

        <div className="flex items-center gap-2 sm:w-64">
          <ArrowUpDownIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <NativeSelect
            aria-label="Sort services"
            className="w-full [&_select]:h-10 [&_select]:bg-card"
            value={filters.sort}
            onChange={(e) =>
              navigate({ sort: e.target.value as ServiceSort }, "push")
            }
          >
            {SORT_OPTIONS.map((option) => (
              <NativeSelectOption key={option.value} value={option.value}>
                {option.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      {/* Category filter: wraps on desktop, scrolls horizontally on mobile */}
      <div
        role="group"
        aria-label="Filter by category"
        className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {["", ...SERVICE_CATEGORIES].map((category) => {
          const active = filters.category === category
          return (
            <button
              key={category || "all"}
              type="button"
              aria-pressed={active}
              onClick={() => !active && navigate({ category }, "push")}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {category || "All Services"}
            </button>
          )
        })}
      </div>
    </div>
  )
}
