"use client"

import { useId, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  ScissorsIcon,
} from "lucide-react"

import type { NewArrival } from "@/app/components/types/service"
import { formatDuration, formatPrice } from "@/lib/format"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"

const PAGE_SIZE = 5

export default function NewArrivalsPager({
  services,
}: {
  services: NewArrival[]
}) {
  const [page, setPage] = useState(0)
  const listId = useId()

  const pageCount = Math.ceil(services.length / PAGE_SIZE)
  const start = page * PAGE_SIZE
  const visible = services.slice(start, start + PAGE_SIZE)
  const end = start + visible.length

  return (
    <div>
      <ul
        id={listId}
        key={page}
        className="grid animate-in gap-4 duration-300 fade-in lg:grid-cols-5 lg:gap-5"
      >
        {visible.map((service) => (
          <li key={service._id}>
            <NewArrivalCard service={service} />
          </li>
        ))}
      </ul>

      {pageCount > 1 && (
        <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing{" "}
            <span className="font-medium text-foreground">
              {start + 1}–{end}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {services.length}
            </span>{" "}
            new services
          </p>

          <Pagination aria-label="New arrivals pages" className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <Button
                  variant="ghost"
                  className="pl-2"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  aria-controls={listId}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon data-icon="inline-start" />
                  <span className="hidden sm:block">Previous</span>
                </Button>
              </PaginationItem>

              {Array.from({ length: pageCount }, (_, i) => (
                <PaginationItem key={i}>
                  <Button
                    variant={i === page ? "outline" : "ghost"}
                    size="icon"
                    onClick={() => setPage(i)}
                    aria-current={i === page ? "page" : undefined}
                    aria-controls={listId}
                    aria-label={`Page ${i + 1}`}
                    className={
                      i === page ? "border-primary/40 text-primary" : undefined
                    }
                  >
                    {i + 1}
                  </Button>
                </PaginationItem>
              ))}

              <PaginationItem>
                <Button
                  variant="ghost"
                  className="pr-2"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === pageCount - 1}
                  aria-controls={listId}
                  aria-label="Next page"
                >
                  <span className="hidden sm:block">Next</span>
                  <ChevronRightIcon data-icon="inline-end" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

/**
 * Compact card: a horizontal row on mobile/tablet (5 rows stay short),
 * a vertical card on desktop (5 across).
 */
function NewArrivalCard({ service }: { service: NewArrival }) {
  const href = `/services/${service._id}`

  return (
    <article className="group relative flex h-full gap-4 overflow-hidden rounded-2xl border bg-card p-3 text-card-foreground shadow-sm transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md lg:flex-col lg:gap-0 lg:p-0">
      <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:w-32 lg:aspect-4/3 lg:w-full lg:rounded-none">
        {service.image ? (
          <Image
            src={service.image}
            alt=""
            fill
            sizes="(min-width: 1024px) 20vw, 128px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted-foreground">
            <ScissorsIcon className="size-8" strokeWidth={1.5} />
          </span>
        )}
        <span className="absolute top-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide text-primary-foreground uppercase shadow-sm">
          New
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-1 lg:p-4">
        <p className="truncate text-xs font-medium text-primary">
          {service.category}
        </p>
        <h3 className="mt-1 line-clamp-2 text-base leading-snug font-semibold">
          {/* The whole card is clickable via this stretched link. */}
          <Link
            href={href}
            className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
          >
            {service.serviceName}
          </Link>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Added {service.addedLabel}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="text-base font-semibold">
            {formatPrice(service.price)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ClockIcon className="size-3.5" />
            {formatDuration(service.duration)}
          </span>
        </div>
        <span className="mt-2 hidden items-center gap-1 text-sm font-medium text-primary sm:inline-flex lg:mt-3">
          View details
          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  )
}
