import { Suspense } from "react"
import Link from "next/link"
import { ArrowRightIcon, CloudOffIcon, SparklesIcon } from "lucide-react"

import { getFeaturedServices } from "@/lib/api"
import { Button } from "@/components/ui/button"
import SectionMessage from "@/app/components/shared/SectionMessage"
import ServiceCard from "@/app/components/shared/ServiceCard"
import ServiceGridSkeleton from "@/app/components/skeletons/ServiceCardSkeleton"

const FEATURED_COUNT = 6

/**
 * Dynamic Section 1: Featured Salon Services.
 * Shows up to 6 active services from the database (via the Express API).
 * The heading renders immediately; the cards stream in behind a skeleton.
 */
export default function DynamicSection1() {
  return (
    <section
      aria-labelledby="featured-title"
      className="py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-primary uppercase">
              <SparklesIcon className="size-4" />
              Featured Services
            </p>
            <h2
              id="featured-title"
              className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              Treatments our clients love
            </h2>
            <p className="mt-3 text-base text-pretty text-muted-foreground sm:text-lg">
              Hand-picked services from our salon menu. Pick one to see the
              details and request your appointment.
            </p>
          </div>
          <Button
            variant="outline"
            size="lg"
            className="w-full shrink-0 sm:w-auto"
            render={<Link href="/services" />}
            nativeButton={false}
          >
            View all services
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>

        <div className="mt-10 sm:mt-12">
          <Suspense fallback={<ServiceGridSkeleton count={FEATURED_COUNT} />}>
            <FeaturedServicesGrid />
          </Suspense>
        </div>
      </div>
    </section>
  )
}

async function FeaturedServicesGrid() {
  const result = await getFeaturedServices(FEATURED_COUNT)

  if (result.error !== null) {
    return (
      <SectionMessage
        icon={<CloudOffIcon className="size-6" />}
        title="Services are unavailable"
        description={`${result.error} You can still explore our full menu.`}
      />
    )
  }

  const services = result.data

  if (services.length === 0) {
    return (
      <SectionMessage
        icon={<SparklesIcon className="size-6" />}
        title="New services coming soon"
        description="Our salon menu is being updated. Please check back shortly."
      />
    )
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, i) => (
        <li key={service._id}>
          <ServiceCard service={service} preloadImage={i < 3} />
        </li>
      ))}
    </ul>
  )
}
