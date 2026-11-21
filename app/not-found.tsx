import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRightIcon, HomeIcon, ScissorsIcon, SparklesIcon } from "lucide-react"

import { SERVICE_CATEGORIES, categoryHref } from "@/lib/site"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for doesn't exist or has been moved.",
}

/*
 * Uses only the shadcn theme tokens (primary, muted, card, chart-*, ...) so it
 * follows the same light/dark class as the navbar and footer. Everything is
 * scoped to this <main>; it sets no global styles and doesn't touch <html>/<body>.
 */
export default function NotFound() {
  return (
    <main className="relative isolate flex flex-1 items-center overflow-hidden">
      {/* Decorative background, clipped to this section */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 size-136 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-24 size-96 rounded-full bg-chart-3/15 blur-3xl" />
        <div className="absolute top-1/3 -right-24 size-80 rounded-full bg-chart-5/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_75%)] bg-size-[22px_22px] opacity-60" />
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-card/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <SparklesIcon className="size-3.5 text-primary" />
          Error 404
        </span>

        {/* 4 [scissors] 4 */}
        <div
          aria-hidden
          className="mt-8 flex items-center justify-center gap-3 sm:gap-5"
        >
          <span className="bg-linear-to-b from-primary to-chart-4 bg-clip-text text-8xl leading-none font-bold tracking-tighter text-transparent sm:text-9xl">
            4
          </span>
          <span className="relative flex size-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-8 shadow-primary/25 ring-primary/15 sm:size-28">
            <ScissorsIcon className="size-9 -rotate-45 sm:size-12" strokeWidth={1.75} />
            <span className="absolute -top-1 -right-1 size-4 rounded-full border-2 border-background bg-chart-3 sm:size-5" />
          </span>
          <span className="bg-linear-to-b from-primary to-chart-4 bg-clip-text text-8xl leading-none font-bold tracking-tighter text-transparent sm:text-9xl">
            4
          </span>
        </div>

        <h1 className="mt-10 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          This look isn&apos;t on our menu
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
          The page you&apos;re looking for may have been moved, renamed, or never
          existed. Let&apos;s get you back to something beautiful.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="w-full px-5 sm:w-auto"
            render={<Link href="/" />}
            nativeButton={false}
          >
            <HomeIcon />
            Back to Home
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full px-5 sm:w-auto"
            render={<Link href="/services" />}
            nativeButton={false}
          >
            Browse Services
            <ArrowRightIcon />
          </Button>
        </div>

        <div className="mx-auto mt-14 max-w-2xl rounded-2xl border bg-card/70 p-6 backdrop-blur sm:p-8">
          <p className="text-sm font-medium">Looking for a treatment? Try one of these:</p>
          <ul className="mt-4 flex flex-wrap justify-center gap-2">
            {SERVICE_CATEGORIES.map((category) => (
              <li key={category}>
                <Link
                  href={categoryHref(category)}
                  className="inline-flex items-center rounded-full border bg-background px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-secondary hover:text-secondary-foreground"
                >
                  {category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
