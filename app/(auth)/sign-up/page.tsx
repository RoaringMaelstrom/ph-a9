import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"
import { dashboardPathFor, safeRedirect } from "@/lib/routes"
import AuthShell from "@/app/components/shared/AuthShell"

import SignUpForm from "./SignUpForm"

export const metadata: Metadata = {
  title: "Sign Up | SalonBook",
  description: "Create a SalonBook account to book salon appointments online.",
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const redirectTo = safeRedirect(params.redirect)

  // Signed-in users don't need to register again.
  const session = await auth.api.getSession({ headers: await headers() })
  if (session) {
    redirect(redirectTo ?? dashboardPathFor(session.user.role))
  }

  return (
    <AuthShell>
      <SignUpForm redirectTo={redirectTo} />
    </AuthShell>
  )
}
