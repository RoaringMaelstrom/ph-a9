import type {
  CategoryCount,
  Service,
  ServiceFilters,
  ServiceSort,
} from "@/app/components/types/service"
import { applyServiceFilters } from "./service-filters"

/** Base URL of the Express server, e.g. http://localhost:5000 (no trailing slash). */
export const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "")

export type ApiResult<T> =
  { data: T; error: null } | { data: null; error: string }

/** Accepts either a bare array or `{ data: [...] }` from the API. */
function unwrapList<T>(json: unknown): T[] | null {
  if (Array.isArray(json)) return json as T[]
  if (
    json &&
    typeof json === "object" &&
    Array.isArray((json as { data?: unknown }).data)
  ) {
    return (json as { data: T[] }).data
  }
  return null
}

/**
 * Number of active services per category, for the home page categories section.
 * Server-side only. Cached for 60s, tag `services`.
 */
export async function getCategoryCounts(): Promise<ApiResult<CategoryCount[]>> {
  if (!API_URL) {
    console.error(
      "NEXT_PUBLIC_API_URL is not set; cannot load category counts."
    )
    return { data: null, error: "Category data is temporarily unavailable." }
  }

  try {
    const res = await fetch(`${API_URL}/services/categories`, {
      next: { revalidate: 60, tags: ["services"] },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      console.error(`GET /services/categories failed with ${res.status}`)
      return { data: null, error: "We couldn't load categories right now." }
    }

    const list = unwrapList<CategoryCount>(await res.json())
    if (!list)
      return { data: null, error: "We couldn't load categories right now." }

    return {
      data: list.filter(
        (c) => typeof c?.category === "string" && Number.isFinite(c?.count)
      ),
      error: null,
    }
  } catch (err) {
    console.error("GET /services/categories failed:", err)
    return { data: null, error: "We couldn't reach the salon server." }
  }
}

type ActiveServicesQuery = Partial<ServiceFilters> & {
  limit?: number
  sort?: ServiceSort
}

/**
 * Active services from the public list endpoint, with optional search,
 * category filter, sort and limit. Server-side only. Cached for 60s and
 * tagged `services` so admin changes can revalidate it.
 */
export async function getActiveServices({
  limit,
  sort,
  search,
  category,
}: ActiveServicesQuery = {}): Promise<ApiResult<Service[]>> {
  if (!API_URL) {
    console.error("NEXT_PUBLIC_API_URL is not set; cannot load services.")
    return { data: null, error: "Services are temporarily unavailable." }
  }

  const params = new URLSearchParams({ status: "active" })
  if (search) params.set("search", search)
  if (category) params.set("category", category)
  if (sort) params.set("sort", sort)
  if (limit) params.set("limit", String(limit))

  try {
    const res = await fetch(`${API_URL}/services?${params}`, {
      next: { revalidate: 60, tags: ["services"] },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      console.error(`GET /services failed with ${res.status}`)
      return { data: null, error: "We couldn't load services right now." }
    }

    const list = unwrapList<Service>(await res.json())
    if (!list)
      return { data: null, error: "We couldn't load services right now." }

    // The API should already do all of this; re-apply so results stay correct.
    const services = applyServiceFilters(
      list.filter((s) => s.status === "active"),
      { search, category, sort }
    )
    return { data: limit ? services.slice(0, limit) : services, error: null }
  } catch (err) {
    console.error("GET /services failed:", err)
    return {
      data: null,
      error: "We couldn't reach the salon server. Please try again shortly.",
    }
  }
}

/** Home page "Featured Salon Services" (Dynamic Section 1). */
export function getFeaturedServices(limit = 6) {
  return getActiveServices({ limit })
}

/** Home page "New Arrivals" (Dynamic Section 3): newest active services first. */
export function getNewestServices(limit = 15) {
  return getActiveServices({ limit, sort: "newest" })
}

/** Browse Services page: all active services matching the URL filters. */
export function getBrowseServices(filters: ServiceFilters) {
  return getActiveServices(filters)
}
