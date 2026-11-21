import "server-only"

import { cache } from "react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "./auth"
import { dashboardPathFor, type UserRole } from "./routes"

export type SessionUser = typeof auth.$Infer.Session.user

/**
 * The current session, read from the database (cookie cache bypassed) so a
 * role change or block takes effect immediately. Deduped per request.
 */
export const getCurrentSession = cache(async () =>
  auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  })
)

/** Signed-in user or redirect to sign-in (coming back to `returnTo`). */
export async function requireUser(returnTo: string): Promise<SessionUser> {
  const session = await getCurrentSession()
  if (!session) {
    redirect(`/sign-in?redirect=${encodeURIComponent(returnTo)}`)
  }
  return session.user
}

/**
 * Where blocked users are sent. It's a standalone page outside the dashboard
 * layout, so it renders fully even on client-side navigation (a notice inside
 * the dashboard layout would not, because layouts aren't re-rendered).
 */
export const BLOCKED_PATH = "/account-blocked"

/** Signed-in, non-blocked user, or redirect (sign-in / blocked page). */
export async function requireActiveUser(
  returnTo: string
): Promise<SessionUser> {
  const user = await requireUser(returnTo)
  if (user.isBlocked) redirect(BLOCKED_PATH)
  return user
}

/**
 * Server-side authorization for role-specific pages. Call it in every page
 * (layouts don't re-run on client navigation).
 * - not signed in → sign-in
 * - blocked → /account-blocked
 * - wrong role → their own dashboard (a customer can never render admin pages)
 */
export async function requireRole(
  role: UserRole,
  returnTo: string
): Promise<SessionUser> {
  const user = await requireActiveUser(returnTo)
  if (user.role !== role) redirect(dashboardPathFor(user.role))
  return user
}

/**
 * Whether the signed-in user can sign in with email + password (has a
 * "credential" account). Google-only accounts can set one on their profile.
 */
export async function hasPasswordSignIn(): Promise<boolean> {
  const accounts = await auth.api.listUserAccounts({ headers: await headers() })
  return accounts.some((account) => account.providerId === "credential")
}

/** Same check for Server Actions: throws instead of redirecting. */
export async function assertRole(role: UserRole): Promise<SessionUser> {
  const session = await getCurrentSession()
  if (!session || session.user.isBlocked || session.user.role !== role) {
    throw new Error("You don't have permission to do that.")
  }
  return session.user
}
