import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getCurrentSession } from "@/lib/session"
import { pageMetadata } from "@/lib/seo"
import { dashboardPathFor, safeRedirect } from "@/lib/routes"
import AuthShell from "@/app/components/shared/AuthShell"

import SignUpForm from "./SignUpForm"

export const metadata: Metadata = pageMetadata({
  title: "Create an Account",
  description:
    "Create a free SalonBook account to book haircuts, facials, nails and spa treatments online and manage your appointments.",
  path: "/sign-up",
})

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const redirectTo = safeRedirect(params.redirect)

  // Signed-in users don't need to register again.
  const session = await getCurrentSession()
  if (session) {
    redirect(redirectTo ?? dashboardPathFor(session.user.role))
  }

  return (
    <AuthShell>
      <SignUpForm redirectTo={redirectTo} />
    </AuthShell>
  )
}
