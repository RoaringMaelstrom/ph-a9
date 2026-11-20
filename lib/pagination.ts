import type { PageItem, Paginated } from "@/app/components/types/pagination"

const MAX_PAGE = 10_000

type RawParam = string | string[] | undefined

function first(value: RawParam) {
  return (Array.isArray(value) ? value[0] : value) ?? ""
}

/** `?page=` → a page number ≥ 1 (anything invalid → 1). */
export function parsePageParam(value: RawParam) {
  const n = Number(first(value))
  return Number.isInteger(n) && n >= 1 ? Math.min(n, MAX_PAGE) : 1
}

/** `?perPage=` → one of `options` (anything else → `fallback`). */
export function parsePerPageParam<T extends number>(
  value: RawParam,
  options: readonly T[],
  fallback: T
): T {
  const n = Number(first(value))
  return (options as readonly number[]).includes(n) ? (n as T) : fallback
}

/** Slices one page out of the list. Out-of-range pages snap to the nearest valid page. */
export function paginate<T>(
  list: T[],
  page: number,
  perPage: number
): Paginated<T> {
  const total = list.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(Math.max(1, page), totalPages)
  const start = (current - 1) * perPage
  const items = list.slice(start, start + perPage)
  return {
    items,
    page: current,
    totalPages,
    total,
    from: items.length ? start + 1 : 0,
    to: start + items.length,
  }
}

/**
 * Page buttons to show, e.g. for page 6 of 12: 1 … 5 6 7 … 12.
 * Always shows the first, last, and current ± 1 pages.
 */
export function getPageItems(current: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages = new Set([1, totalPages, current - 1, current, current + 1])
  // Near the edges, show a few extra pages instead of a lone "…".
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p))
  if (current >= totalPages - 2)
    [totalPages - 3, totalPages - 2, totalPages - 1].forEach((p) =>
      pages.add(p)
    )

  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b)

  const items: PageItem[] = []
  sorted.forEach((p, i) => {
    const gap = i > 0 ? p - sorted[i - 1] : 1
    // A gap of exactly one page shows that page instead of "…".
    if (gap === 2) items.push(p - 1)
    else if (gap > 2) items.push("ellipsis")
    items.push(p)
  })
  return items
}

/**
 * Scrolls a section (not the whole page) to the top of the viewport.
 * Give the section a `scroll-mt-*` class so it clears the sticky navbar.
 */
export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches
  el.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  })
}
