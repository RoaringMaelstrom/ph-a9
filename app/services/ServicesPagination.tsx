"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { getPageItems } from "@/lib/service-filters"
import type { ServiceFilters } from "@/app/components/types/service"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination"

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

  if (totalPages <= 1) return null

  function goTo(target: number) {
    if (target === page || target < 1 || target > totalPages) return
    navigate({ page: target }, { scroll: true })
  }

  return (
    <Pagination aria-label="Services pages" className="mt-10">
      <PaginationContent className="flex-wrap justify-center">
        <PaginationItem>
          <Button
            variant="ghost"
            className="pl-2"
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
          >
            <ChevronLeftIcon data-icon="inline-start" />
            <span className="hidden sm:block">Previous</span>
          </Button>
        </PaginationItem>

        {getPageItems(page, totalPages).map((item, i) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <Button
                variant={item === page ? "outline" : "ghost"}
                size="icon"
                onClick={() => goTo(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={
                  item === page ? "border-primary/40 text-primary" : undefined
                }
              >
                {item}
              </Button>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <Button
            variant="ghost"
            className="pr-2"
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            aria-label="Next page"
          >
            <span className="hidden sm:block">Next</span>
            <ChevronRightIcon data-icon="inline-end" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
