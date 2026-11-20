import "server-only"

import { headers } from "next/headers"

import { auth } from "./auth"
import { API_URL, type ApiResult } from "./api"

/**
 * Authenticated GET from a Server Component to the Express API, using the
 * signed-in user's Better Auth JWT. Never cached: dashboard data is per-user.
 */
export async function serverApi<T>(path: string): Promise<ApiResult<T>> {
  if (!API_URL) {
    console.error("NEXT_PUBLIC_API_URL is not set.")
    return { data: null, error: "The salon server is not configured." }
  }

  let token: string
  try {
    const result = await auth.api.getToken({ headers: await headers() })
    token = result.token
  } catch {
    return {
      data: null,
      error: "Your session has expired. Please sign in again.",
    }
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    })
    const json = await res.json().catch(() => null)

    if (!res.ok) {
      console.error(`GET ${path} failed with ${res.status}`)
      const message =
        res.status === 401 || res.status === 403
          ? "You don't have access to this data."
          : (json?.message ?? "We couldn't load this data.")
      return { data: null, error: message }
    }
    return { data: (json?.data ?? json) as T, error: null }
  } catch (err) {
    console.error(`GET ${path} failed:`, err)
    return {
      data: null,
      error: "We couldn't reach the salon server. Please try again shortly.",
    }
  }
}
