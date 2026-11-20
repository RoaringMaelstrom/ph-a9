import { NextResponse, type NextRequest } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

/**
 * Optimistic route protection (runs before every matched request).
 *
 * Private routes require a Better Auth session cookie; otherwise redirect to
 * /sign-in?redirect=<original path> so the user comes back after signing in.
 *
 * Role checks deliberately do NOT happen here. The cookie can carry a cached
 * (possibly stale) role, and redirecting on it fought with the pages' database
 * check (e.g. an account promoted to admin looped between dashboards).
 * Pages decide roles with `requireRole` (lib/session.ts), which reads the DB,
 * and the Express API enforces roles again on every request.
 */
export function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    const { pathname, search } = request.nextUrl
    const signIn = new URL("/sign-in", request.url)
    signIn.searchParams.set("redirect", `${pathname}${search}`)
    return NextResponse.redirect(signIn)
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
