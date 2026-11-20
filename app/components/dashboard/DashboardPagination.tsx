"use client"

import { useId, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { scrollToSection } from "@/lib/pagination"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import PaginationBar from "@/app/components/shared/PaginationBar"

/**
 * Updates query params on the current dashboard URL, keeping all the others
 * (status tab, search, sort, ...). The server page re-renders with them.
 */
function useQueryNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  function navigate(
    updates: Record<string, string | null>,
    sectionId?: string
  ) {
    const params = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key)
      else params.set(key, value)
    }
    const query = params.toString()

    if (sectionId) scrollToSection(sectionId)
    startTransition(() => {
      // Next's own scroll-to-top is disabled; we scroll to the section instead.
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
    })
  }

  return { navigate, isPending }
}

/**
 * "Showing 1–12 of 40 appointments" + page buttons, below a dashboard table.
 * Uses `?page=` (`pageParam`); changing page scrolls `sectionId` into view.
 * Give that section a `scroll-mt-24` class so it clears the sticky navbar.
 */
export default function DashboardPagination({
  page,
  totalPages,
  total,
  from,
  to,
  sectionId,
  noun = "items",
  pageParam = "page",
  perPage,
  className,
}: {
  page: number
  totalPages: number
  total: number
  from: number
  to: number
  sectionId: string
  /** Plural label for the count, e.g. "appointments" */
  noun?: string
  pageParam?: string
  /** Adds a "Show [n] per page" select next to the count */
  perPage?: { value: number; options: readonly number[]; defaultValue: number }
  className?: string
}) {
  const { navigate, isPending } = useQueryNavigation()

  if (total === 0) return null

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-3 sm:flex-row",
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <p
          className="inline-flex items-center gap-2 text-sm text-muted-foreground"
          aria-live="polite"
        >
          {isPending && <Spinner className="size-3.5" />}
          <span>
            Showing{" "}
            <span className="font-medium text-foreground tabular-nums">
              {from}–{to}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground tabular-nums">
              {total}
            </span>{" "}
            {noun}
          </span>
        </p>
        {perPage && (
          <DashboardPerPageSelect {...perPage} pageParam={pageParam} />
        )}
      </div>
      <PaginationBar
        page={page}
        totalPages={totalPages}
        size="sm"
        label={`${noun} pages`}
        className="mx-0 w-auto"
        onPageChange={(target) =>
          navigate(
            { [pageParam]: target > 1 ? String(target) : null },
            sectionId
          )
        }
      />
    </div>
  )
}

/** "Show [10 ▾] per page" for a dashboard table. Changing it goes back to page 1. */
export function DashboardPerPageSelect({
  value,
  options,
  defaultValue,
  param = "perPage",
  pageParam = "page",
}: {
  value: number
  options: readonly number[]
  /** Omitted from the URL when selected */
  defaultValue: number
  param?: string
  pageParam?: string
}) {
  const { navigate } = useQueryNavigation()
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
        value={value}
        onChange={(e) => {
          const next = Number(e.target.value)
          navigate({
            [param]: next === defaultValue ? null : String(next),
            [pageParam]: null,
          })
        }}
      >
        {options.map((n) => (
          <NativeSelectOption key={n} value={n}>
            {n}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <span className="whitespace-nowrap">per page</span>
    </div>
  )
}
