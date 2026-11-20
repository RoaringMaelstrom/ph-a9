import type {
  PageItem,
  PaginatedServices,
  Service,
  ServiceFilters,
  ServiceSort,
  ServicesPerPage,
} from "@/app/components/types/service"
import { SERVICE_CATEGORIES } from "./site"

export const SORT_OPTIONS: { value: ServiceSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "duration-asc", label: "Duration: Shortest first" },
  { value: "duration-desc", label: "Duration: Longest first" },
]

export const DEFAULT_SORT: ServiceSort = "newest"

export const PER_PAGE_OPTIONS: readonly ServicesPerPage[] = [9, 15, 30]
export const DEFAULT_PER_PAGE: ServicesPerPage = 9

const SORT_VALUES = new Set<string>(SORT_OPTIONS.map((o) => o.value))
const MAX_SEARCH_LENGTH = 100
const MAX_PAGE = 10_000

type RawParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? ""
}

function parsePage(value: string) {
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 ? Math.min(n, MAX_PAGE) : 1
}

function parsePerPage(value: string): ServicesPerPage {
  const n = Number(value)
  return (PER_PAGE_OPTIONS as readonly number[]).includes(n)
    ? (n as ServicesPerPage)
    : DEFAULT_PER_PAGE
}

/** Reads and validates `?search=&category=&sort=&page=&perPage=` from the URL. */
export function parseServiceFilters(params: RawParams): ServiceFilters {
  const search = first(params.search).trim().slice(0, MAX_SEARCH_LENGTH)

  const rawCategory = first(params.category)
  const category = (SERVICE_CATEGORIES as readonly string[]).includes(
    rawCategory
  )
    ? rawCategory
    : ""

  const rawSort = first(params.sort)
  const sort = SORT_VALUES.has(rawSort)
    ? (rawSort as ServiceSort)
    : DEFAULT_SORT

  return {
    search,
    category,
    sort,
    page: parsePage(first(params.page)),
    perPage: parsePerPage(first(params.perPage)),
  }
}

/** Builds the query string for the URL. Default/empty values are omitted. */
export function filtersToSearchParams(filters: ServiceFilters) {
  const params = new URLSearchParams()
  if (filters.search) params.set("search", filters.search)
  if (filters.category) params.set("category", filters.category)
  if (filters.sort !== DEFAULT_SORT) params.set("sort", filters.sort)
  if (filters.perPage !== DEFAULT_PER_PAGE)
    params.set("perPage", String(filters.perPage))
  if (filters.page > 1) params.set("page", String(filters.page))
  return params
}

/** Slices one page out of the list. Out-of-range pages snap to the nearest valid page. */
export function paginate(
  services: Service[],
  page: number,
  perPage: number
): PaginatedServices {
  const total = services.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(Math.max(1, page), totalPages)
  const start = (current - 1) * perPage
  const items = services.slice(start, start + perPage)
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

export function hasActiveFilters(filters: ServiceFilters) {
  return Boolean(filters.search || filters.category)
}

const comparators: Record<ServiceSort, (a: Service, b: Service) => number> = {
  newest: (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "duration-asc": (a, b) => a.duration - b.duration,
  "duration-desc": (a, b) => b.duration - a.duration,
}

/**
 * Applies search, category and sort to a list. The API does this too; this
 * keeps results correct even if the API ignores a parameter.
 */
export function applyServiceFilters(
  services: Service[],
  { search, category, sort }: Partial<ServiceFilters>
) {
  const term = search?.trim().toLowerCase()

  const filtered = services.filter(
    (s) =>
      (!term || s.serviceName.toLowerCase().includes(term)) &&
      (!category || s.category === category)
  )

  if (!sort) return filtered
  const compare = comparators[sort]
  // Name as a tie-breaker keeps the order stable between requests.
  return filtered.sort(
    (a, b) => compare(a, b) || a.serviceName.localeCompare(b.serviceName)
  )
}
