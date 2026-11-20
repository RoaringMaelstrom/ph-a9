import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { requireUser } from "@/lib/session"
import { dashboardPathFor } from "@/lib/routes"
import BlockedNotice from "@/app/components/dashboard/BlockedNotice"

export const metadata: Metadata = {
  title: "Account blocked | SalonBook",
  robots: { index: false },
}

/**
 * Where every protected page sends blocked users. It lives outside the
 * dashboard layout so it always renders, including on client-side navigation.
 */
export default async function AccountBlockedPage() {
  const user = await requireUser("/account-blocked")
  // Only blocked users belong here.
  if (!user.isBlocked) redirect(dashboardPathFor(user.role))

  return (
    <main className="flex flex-1 items-center px-4 py-16 sm:px-6">
      <BlockedNotice />
    </main>
  )
}
