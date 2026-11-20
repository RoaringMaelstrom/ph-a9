import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { dashboardPathFor, safeRedirect } from "@/lib/routes"
import AuthShell from "@/app/components/shared/AuthShell"

import SignInForm from "./SignInForm"

export const metadata: Metadata = {
  title: "Sign In | SalonBook",
  description: "Sign in to SalonBook to book and manage your salon appointments.",
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const redirectTo = safeRedirect(params.redirect)

  // Already signed in (including returning from Google OAuth):
  // send the user on to where they were going, or to their role's dashboard.
  const session = await auth.api.getSession({ headers: await headers() })
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
