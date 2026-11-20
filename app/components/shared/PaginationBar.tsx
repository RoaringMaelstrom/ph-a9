"use client"

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { getPageItems } from "@/lib/pagination"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "@/components/ui/pagination"

/**
 * Previous / page numbers / Next. Presentational only: the parent decides
 * what a page change does (update the URL, scroll, ...). Hidden for 1 page.
 */
export default function PaginationBar({
  page,
  totalPages,
  onPageChange,
  label = "Pages",
  size = "default",
  className,
}: {
  /** Current page (already clamped) */
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  /** Accessible name of the navigation landmark */
  label?: string
  size?: "default" | "sm"
  className?: string
}) {
  if (totalPages <= 1) return null

  function goTo(target: number) {
    if (target === page || target < 1 || target > totalPages) return
    onPageChange(target)
  }

  const sm = size === "sm"

  return (
    <Pagination aria-label={label} className={className}>
      <PaginationContent className="flex-wrap justify-center">
        <PaginationItem>
          <Button
            variant="ghost"
            size={sm ? "sm" : "default"}
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
                size={sm ? "icon-sm" : "icon"}
                onClick={() => goTo(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={cn(
                  "tabular-nums",
                  item === page && "border-primary/40 text-primary"
                )}
              >
                {item}
              </Button>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <Button
            variant="ghost"
            size={sm ? "sm" : "default"}
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
