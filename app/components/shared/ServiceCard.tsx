import Image from "next/image"
import Link from "next/link"
import { ArrowRightIcon, ClockIcon, ScissorsIcon } from "lucide-react"

import type { Service } from "@/lib/types"
import { formatDuration, formatPrice } from "@/lib/format"
import { Button } from "@/components/ui/button"

/** Service card used on the home page and Browse Services page. */
export default function ServiceCard({
  service,
  preloadImage = false,
}: {
  service: Service
  preloadImage?: boolean
}) {
  const href = `/services/${service._id}`

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={href}
        className="relative block aspect-4/3 overflow-hidden bg-muted"
        tabIndex={-1}
        aria-hidden
      >
        {service.image ? (
          <Image
            src={service.image}
            alt=""
            fill
            preload={preloadImage}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted-foreground">
            <ScissorsIcon className="size-10" strokeWidth={1.5} />
          </span>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm backdrop-blur">
          {service.category}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg leading-snug font-semibold">
            <Link href={href} className="hover:text-primary focus-visible:text-primary">
              {service.serviceName}
            </Link>
          </h3>
          <p className="shrink-0 text-lg font-semibold text-primary">
            {formatPrice(service.price)}
          </p>
        </div>

        <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <ClockIcon className="size-3.5" />
          {formatDuration(service.duration)}
        </p>

        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {service.description}
        </p>

        <div className="mt-auto pt-5">
          <Button
            variant="outline"
            className="w-full group-hover:border-primary/40"
            render={<Link href={href} />}
            nativeButton={false}
          >
            View Details
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </div>
    </article>
  )
}
