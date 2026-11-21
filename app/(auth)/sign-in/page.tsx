import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getCurrentSession } from "@/lib/session"
import { pageMetadata } from "@/lib/seo"
import { dashboardPathFor, safeRedirect } from "@/lib/routes"
import AuthShell from "@/app/components/shared/AuthShell"

import SignInForm from "./SignInForm"

export const metadata: Metadata = pageMetadata({
  title: "Sign In",
  description:
    "Sign in to SalonBook to book salon appointments, follow their status and pay securely online.",
  path: "/sign-in",
})

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const redirectTo = safeRedirect(params.redirect)

  // Already signed in (including returning from Google OAuth):
  // send the user on to where they were going, or to their role's dashboard.
  const session = await getCurrentSession()
  if (session) {
    redirect(redirectTo ?? dashboardPathFor(session.user.role))
  }

  const oauthError = typeof params.error === "string" ? params.error : null

  return (
    <AuthShell>
      <SignInForm redirectTo={redirectTo} oauthError={oauthError} />
    </AuthShell>
  )
}
