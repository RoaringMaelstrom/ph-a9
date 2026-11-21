"use server"

import { headers } from "next/headers"
import { APIError } from "better-auth/api"

import { auth } from "@/lib/auth"
import { passwordError } from "@/lib/password"
import { getCurrentSession } from "@/lib/session"

const MAX_PASSWORD_LENGTH = 128

/**
 * Adds an email + password sign-in to the current user's account (e.g. one
 * created with Google). Better Auth's `setPassword` is server-only and only
 * works when no password exists yet, so it can't overwrite one; changing an
 * existing password goes through `changePassword`, which needs the current one.
 *
 * Server Actions are public endpoints: the session is re-read from the DB
 * here, and errors are returned (not thrown) so the message reaches the toast.
 */
export async function setAccountPassword(
  newPassword: unknown
): Promise<{ error: string | null }> {
  const session = await getCurrentSession()
  if (!session) return { error: "Your session has expired. Please sign in again." }
  if (session.user.isBlocked) {
    return { error: "Your account has been blocked. Please contact the salon." }
  }

  if (typeof newPassword !== "string") return { error: "Please enter a password." }
  if (newPassword.length > MAX_PASSWORD_LENGTH) {
    return { error: `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.` }
  }
  const ruleError = passwordError(newPassword)
  if (ruleError) return { error: ruleError }

  try {
    await auth.api.setPassword({
      body: { newPassword },
      headers: await headers(),
    })
    return { error: null }
  } catch (err) {
    if (err instanceof APIError) {
      const body = err.body as { code?: string; message?: string } | undefined
      return {
        error:
          body?.code === "PASSWORD_ALREADY_SET"
            ? "Your account already has a password. Use Change password instead."
            : (body?.message ?? "We couldn't set your password."),
      }
    }
    console.error("setAccountPassword failed:", err)
    return { error: "We couldn't set your password. Please try again." }
  }
}
