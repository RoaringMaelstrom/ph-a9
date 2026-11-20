import { ScissorsIcon } from "lucide-react"

/** Static page header, shared by the page and its loading skeleton. */
export default function ServicesHeader() {
  return (
    <header className="border-b bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <p className="inline-flex items-center gap-2 text-sm font-medium tracking-wide text-primary uppercase">
          <ScissorsIcon className="size-4" />
          Our Menu
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Browse Services
        </h1>
        <p className="mt-3 max-w-2xl text-base text-pretty text-muted-foreground sm:text-lg">
          Explore every treatment we offer. Search by name, filter by category,
          and sort by price or duration to find your perfect appointment.
        </p>
      </div>
    </header>
  )
}
