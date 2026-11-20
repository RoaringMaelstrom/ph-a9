import Image from "next/image"
import Link from "next/link"
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  ClockIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react"

import { SERVICE_CATEGORIES } from "@/lib/site"
import { Button } from "@/components/ui/button"

const BANNER_IMAGE =
  "https://images.unsplash.com/photo-1562322140-8baeececf3df"

const HIGHLIGHTS = [
  { icon: SparklesIcon, label: `${SERVICE_CATEGORIES.length} service categories` },
  { icon: CalendarCheckIcon, label: "Book online in minutes" },
  { icon: ShieldCheckIcon, label: "Secure payments with Stripe" },
  { icon: ClockIcon, label: "Open 7 days a week" },
]

/**
 * Home page hero.
 *
 * The photo is washed with the page `background` color and the copy uses
 * `foreground` / `muted-foreground`, so it's cream-on-dark-text in light mode
 * and dark-on-light-text in dark mode, always with enough contrast.
 * - Mobile: the overlay is even, because the text covers the whole photo.
 * - md and up: the overlay fades left → right so the stylist stays visible.
 */
export default function Banner() {
  return (
    <section
      aria-labelledby="banner-title"
      className="relative isolate flex items-center overflow-hidden bg-background md:min-h-[600px] lg:min-h-[680px]"
    >
      {/* Background photo */}
      <Image
        src={BANNER_IMAGE}
        alt="Stylist blow-drying a client's hair in a bright salon"
        fill
        preload
        sizes="100vw"
        quality={80}
        className="-z-20 object-cover object-[75%_center]"
      />

      {/* Theme-aware wash: solid on mobile, gradient from the text side on md+ */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-background/85 md:bg-transparent md:bg-linear-to-r md:from-background md:from-35% md:via-background/80 md:via-55% md:to-background/10"
      />
      {/* Soft fade into the next section */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-t from-background to-transparent"
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="max-w-xl text-foreground lg:max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted-foreground backdrop-blur-sm sm:text-sm">
            <span className="size-1.5 rounded-full bg-primary" />
            Hair · Skin · Nails · Spa
          </span>

          <h1
            id="banner-title"
            className="mt-5 text-[2rem] leading-[1.1] font-semibold tracking-tight text-balance sm:mt-6 sm:text-5xl lg:text-6xl"
          >
            Your next great look starts with{" "}
            <span className="text-primary">SalonBook</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-pretty text-muted-foreground sm:mt-6 sm:text-lg lg:max-w-xl">
            Discover expert haircuts, coloring, skincare, makeup and spa
            treatments. Choose a service, request a time that suits you, and pay
            securely once your appointment is confirmed.
          </p>

          <div className="mt-8 sm:mt-9">
            <Button
              size="lg"
              className="h-12 w-full px-6 text-base shadow-lg shadow-primary/25 sm:w-auto"
              render={<Link href="/services" />}
              nativeButton={false}
            >
              Explore Salon Services
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>

          <ul className="mt-10 grid grid-cols-1 gap-3 border-t pt-7 text-sm text-muted-foreground min-[420px]:grid-cols-2 sm:mt-12 sm:gap-x-6 sm:gap-y-4 sm:pt-8 lg:grid-cols-4 lg:gap-x-4">
            {HIGHLIGHTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2.5 lg:items-start">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-3.5" />
                </span>
                <span className="leading-snug font-medium text-foreground/80 lg:pt-1">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
