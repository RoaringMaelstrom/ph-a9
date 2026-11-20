import Link from "next/link"

import { cn } from "@/lib/utils"

/**
 * URL-driven filter tabs (`?status=`), so the server renders the filtered list.
 * `query` holds other params to keep when switching tabs (e.g. search/sort).
 */
export default function StatusTabs({
  basePath,
  current,
  items,
  query,
}: {
  basePath: string
  current: string
  items: { value: string; label: string; count?: number }[]
  query?: URLSearchParams
}) {
  function hrefFor(status: string) {
    const params = new URLSearchParams(query)
    params.delete("status")
    if (status) params.set("status", status)
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  return (
    <nav
      aria-label="Filter by status"
      className="-mx-4 mb-5 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) => {
        const active = item.value === current
        const href = hrefFor(item.value)
        return (
          <Link
            key={item.value || "all"}
            href={href}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  active ? "bg-primary-foreground/20" : "bg-muted"
                )}
              >
                {item.count}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
