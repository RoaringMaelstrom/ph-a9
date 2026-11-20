import { Suspense } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  ArrowRightIcon,
  CloudOffIcon,
  SparklesIcon,
  WandSparklesIcon,
} from "lucide-react"

import { getNewestServices } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import SectionMessage from "@/app/components/shared/SectionMessage"

import NewArrivalsPager, { type NewArrival } from "./NewArrivalsPager"

const NEWEST_COUNT = 15

/**
 * Dynamic Section 3 (the assignment's "extra section"): New Arrivals.
 * The 15 newest active services, shown 5 at a time with pagination.
 * Data is fetched once on the server; paging happens on the client.
 */
export default function DynamicSection3() {
  return (
    <section
      aria-labelledby="new-arrivals-title"
      className="py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-primary uppercase">
              <WandSparklesIcon className="size-4" />
              New Arrivals
            </p>
            <h2
              id="new-arrivals-title"
              className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              Fresh on the salon menu
            </h2>
            <p className="mt-3 text-base text-pretty text-muted-foreground sm:text-lg">
              The latest treatments our team has added. Be among the first to
              try them.
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="w-full shrink-0 sm:w-auto"
            render={<Link href="/services" />}
            nativeButton={false}
          >
            Browse all services
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>

        <div className="mt-10 sm:mt-12">
          <Suspense fallback={<NewArrivalsSkeleton />}>
            <NewArrivals />
          </Suspense>
        </div>
      </div>
    </section>
  )
}

async function NewArrivals() {
  const result = await getNewestServices(NEWEST_COUNT)

  if (result.error !== null) {
    return (
      <SectionMessage
        icon={<CloudOffIcon className="size-6" />}
        title="New arrivals are unavailable"
        description={`${result.error} You can still explore our full menu.`}
      />
    )
  }

  if (result.data.length === 0) {
    return (
      <SectionMessage
        icon={<SparklesIcon className="size-6" />}
        title="New treatments coming soon"
        description="We're preparing fresh additions to our menu. Check back shortly."
      />
    )
  }

  const services: NewArrival[] = result.data.map((service) => {
    const created = new Date(service.createdAt)
    return {
      ...service,
      addedLabel: Number.isNaN(created.getTime())
        ? "recently"
        : format(created, "MMM d, yyyy"),
    }
  })

  return <NewArrivalsPager services={services} />
}

function NewArrivalsSkeleton() {
  return (
    <div role="status" aria-label="Loading new arrivals">
      <div className="grid gap-4 lg:grid-cols-5 lg:gap-5">
        {Array.from({ length: 5 }, (_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-2xl border bg-card p-3 shadow-sm lg:flex-col lg:gap-0 lg:p-0"
          >
            <Skeleton className="aspect-square w-24 shrink-0 rounded-xl sm:w-32 lg:aspect-4/3 lg:w-full lg:rounded-none lg:rounded-t-2xl" />
            <div className="flex flex-1 flex-col gap-2 py-1 lg:p-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-3 w-24" />
              <div className="mt-auto flex justify-between pt-3">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-4 w-14" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="size-9" />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading new arrivals...</span>
    </div>
  )
}
