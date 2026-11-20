import { redirect } from "next/navigation"

import { requireActiveUser } from "@/lib/session"
import { dashboardPathFor } from "@/lib/routes"

/** /dashboard → the signed-in user's own dashboard (blocked → /account-blocked). */
export default async function DashboardIndexPage() {
  const user = await requireActiveUser("/dashboard")
  redirect(dashboardPathFor(user.role))
}
