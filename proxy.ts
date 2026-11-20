import { NextResponse, type NextRequest } from "next/server"
import { getCookieCache, getSessionCookie } from "better-auth/cookies"

import { dashboardPathFor } from "@/lib/routes"

/**
 * Optimistic route protection (runs before every matched request).
 *
 * - Private routes require a Better Auth session cookie; otherwise redirect to
 *   /sign-in?redirect=<original path> so the user comes back after signing in.
 * - Dashboards: if the signed session cache says the user has the other role,
 *   send them to their own dashboard.
 *
 * This only reads cookies (no database), so it's a fast first line of defence.
 * Pages and the Express API still verify the session, role and blocked status
 * themselves. Never rely on this file alone.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (!getSessionCookie(request)) {
    const signIn = new URL("/sign-in", request.url)
    signIn.searchParams.set("redirect", `${pathname}${search}`)
    return NextResponse.redirect(signIn)
  }

  if (pathname.startsWith("/dashboard")) {
    // Signed session cache (same strategy as lib/auth.ts). Null if expired.
    const cache = await getCookieCache(request, {
      secret: process.env.BETTER_AUTH_SECRET,
      strategy: "jwt",
    }).catch(() => null)

    const role = (cache?.user as { role?: string } | undefined)?.role
    if (role) {
      const own = dashboardPathFor(role)
      if (!pathname.startsWith(own)) {
        return NextResponse.redirect(new URL(own, request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Service details (but not the public /services list)
    "/services/:id",
    "/dashboard/:path*",
    "/payment/:path*",
  ],
}
