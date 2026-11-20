import { Suspense } from "react"
import Link from "next/link"
import {
  ArrowRightIcon,
  BrushIcon,
  DropletsIcon,
  Flower2Icon,
  HandIcon,
  LayoutGridIcon,
  PaletteIcon,
  ScissorsIcon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react"

import { getCategoryCounts } from "@/lib/api"
import { SERVICE_CATEGORIES, categoryHref } from "@/lib/site"
import { Skeleton } from "@/components/ui/skeleton"

const CATEGORY_DETAILS: Record<
  string,
  { icon: LucideIcon; description: string }
> = {
  "Haircut & Styling": {
    icon: ScissorsIcon,
    description: "Precision cuts, blow-dries and occasion styling.",
  },
  "Hair Coloring": {
    icon: PaletteIcon,
    description: "Balayage, highlights, root touch-ups and toning.",
  },
  "Hair Treatment": {
    icon: DropletsIcon,
    description: "Keratin, deep conditioning and scalp care.",
  },
  "Facial & Skincare": {
    icon: SparklesIcon,
    description: "Cleansing, hydrating and glow-boosting facials.",
  },
  Makeup: {
    icon: BrushIcon,
    description: "Everyday, party and bridal makeup looks.",
  },
  "Manicure & Pedicure": {
    icon: HandIcon,
    description: "Classic, gel and spa nail care for hands and feet.",
  },
  "Spa & Massage": {
    icon: Flower2Icon,
    description: "Relaxing massages and body treatments.",
  },
}

const FALLBACK_DETAILS = {
  icon: SparklesIcon,
  description: "Explore treatments in this category.",
}

/**
 * Dynamic Section 2: Salon Service Categories.
 * Every category links to the Browse Services page filtered by that category.
 * Active-service counts come from the API; if it's unavailable the tiles
 * still render (without counts), so users can always explore by category.
 */
export default function DynamicSection2() {
  return (
    <section
      aria-labelledby="categories-title"
      className="border-y bg-muted/40 py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-primary uppercase">
            <LayoutGridIcon className="size-4" />
            Service Categories
          </p>
          <h2
            id="categories-title"
            className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            Find the treatment you&apos;re looking for
          </h2>
          <p className="mt-3 text-base text-pretty text-muted-foreground sm:text-lg">
            From a fresh cut to a full spa day, browse our menu by category.
          </p>
        </div>

        <div className="mt-10 sm:mt-12">
          <Suspense fallback={<CategoryGridSkeleton />}>
            <CategoryGrid />
          </Suspense>
        </div>
      </div>
    </section>
  )
}

const gridClass =
  "grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4"

async function CategoryGrid() {
  const result = await getCategoryCounts()
  const counts =
    result.error === null
      ? new Map(result.data.map((c) => [c.category, c.count]))
      : null

  // Known categories in menu order, plus any extra ones the salon has added.
  const extra = counts
    ? [...counts.keys()].filter(
        (c) => !(SERVICE_CATEGORIES as readonly string[]).includes(c)
      )
    : []
  const categories = [...SERVICE_CATEGORIES, ...extra]

  const total = counts
    ? [...counts.values()].reduce((sum, n) => sum + n, 0)
    : null

  return (
    <ul className={gridClass}>
      {categories.map((category) => (
        <li key={category}>
          <CategoryTile
            category={category}
            count={counts ? (counts.get(category) ?? 0) : null}
          />
        </li>
      ))}
      <li>
        <Link
          href="/services"
          className="group flex h-full min-h-40 flex-col justify-between rounded-2xl bg-primary p-5 text-primary-foreground shadow-sm transition-shadow hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary-foreground/15">
            <LayoutGridIcon className="size-5" />
          </span>
          <span>
            <span className="block text-base font-semibold">All Services</span>
            <span className="mt-1 flex items-center gap-1 text-sm text-primary-foreground/80">
              {total !== null
                ? `Browse all ${total} services`
                : "Browse the full menu"}
              <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </span>
        </Link>
      </li>
    </ul>
  )
}

function CategoryTile({
  category,
  count,
}: {
  category: string
  count: number | null
}) {
  const { icon: Icon, description } =
    CATEGORY_DETAILS[category] ?? FALLBACK_DETAILS

  return (
    <Link
      href={categoryHref(category)}
      className="group flex h-full min-h-40 flex-col rounded-2xl border bg-card p-5 text-card-foreground shadow-sm transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-md focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <Icon className="size-5" />
        </span>
        {count !== null && (
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
            {count === 0
              ? "Coming soon"
              : `${count} ${count === 1 ? "service" : "services"}`}
          </span>
        )}
      </div>
      <h3 className="mt-4 text-base font-semibold">{category}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm font-medium text-primary">
        Explore
        <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

function CategoryGridSkeleton() {
  return (
    <div role="status" aria-label="Loading categories" className={gridClass}>
      {Array.from({ length: SERVICE_CATEGORIES.length + 1 }, (_, i) => (
        <div
          key={i}
          className="flex min-h-40 flex-col rounded-2xl border bg-card p-5 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <Skeleton className="size-11 rounded-xl" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-5 w-2/3" />
          <Skeleton className="mt-2 h-3.5 w-full" />
          <Skeleton className="mt-1.5 h-3.5 w-4/5" />
          <Skeleton className="mt-auto h-4 w-16" />
        </div>
      ))}
      <span className="sr-only">Loading categories...</span>
    </div>
  )
}
