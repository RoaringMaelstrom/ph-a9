import type { Service } from "./types"

/** Base URL of the Express server, e.g. http://localhost:5000 (no trailing slash). */
export const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "")

export type ApiResult<T> = { data: T; error: null } | { data: null; error: string }

/** Accepts either a bare array or `{ data: [...] }` from the API. */
function unwrapList<T>(json: unknown): T[] | null {
  if (Array.isArray(json)) return json as T[]
  if (json && typeof json === "object" && Array.isArray((json as { data?: unknown }).data)) {
    return (json as { data: T[] }).data
  }
  return null
}

export type CategoryCount = { category: string; count: number }

/**
 * Number of active services per category, for the home page categories section.
 * Server-side only. Cached for 60s, tag `services`.
 */
export async function getCategoryCounts(): Promise<ApiResult<CategoryCount[]>> {
  if (!API_URL) {
    console.error("NEXT_PUBLIC_API_URL is not set; cannot load category counts.")
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
    if (!list) return { data: null, error: "We couldn't load categories right now." }

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

/**
 * Active services for the home page "Featured Salon Services" section.
 * Server-side only. Cached for 60s and tagged `services` so admin
 * changes can revalidate it.
 */
export async function getFeaturedServices(limit = 6): Promise<ApiResult<Service[]>> {
  if (!API_URL) {
    console.error("NEXT_PUBLIC_API_URL is not set; cannot load services.")
    return { data: null, error: "Services are temporarily unavailable." }
  }

  try {
    const res = await fetch(`${API_URL}/services?status=active&limit=${limit}`, {
      next: { revalidate: 60, tags: ["services"] },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      console.error(`GET /services failed with ${res.status}`)
      return { data: null, error: "We couldn't load services right now." }
    }

    const list = unwrapList<Service>(await res.json())
    if (!list) return { data: null, error: "We couldn't load services right now." }

    // The API should only return active services; filter again just in case.
    return { data: list.filter((s) => s.status === "active").slice(0, limit), error: null }
  } catch (err) {
    console.error("GET /services failed:", err)
    return { data: null, error: "We couldn't reach the salon server. Please try again shortly." }
  }
}
