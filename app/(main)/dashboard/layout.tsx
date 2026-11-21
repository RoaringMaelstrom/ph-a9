import { Suspense } from "react"
import type { Metadata } from "next"
import { NO_INDEX } from "@/lib/seo"

import { requireActiveUser } from "@/lib/session"
import DashboardSidebar from "@/app/components/dashboard/DashboardSidebar"
import DashboardShellSkeleton from "@/app/components/skeletons/DashboardShellSkeleton"

export const metadata: Metadata = {
  title: "Dashboard",
  robots: NO_INDEX,
}

/**
 * Dashboard shell: role-based sidebar + main content.
 * The session is read from the DB inside a Suspense boundary, so entering the
 * dashboard shows `DashboardShellSkeleton` right away (`dashboard/loading.tsx`
 * sits inside this layout and can't cover that wait).
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<DashboardShellSkeleton />}>
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  )
}

/**
 * Blocked users are redirected to /account-blocked. Each page still calls
 * `requireRole` itself, because layouts aren't re-rendered on client-side
 * navigation between pages.
 */
async function DashboardShell({ children }: { children: React.ReactNode }) {
  const user = await requireActiveUser("/dashboard")

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <DashboardSidebar
        user={{
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }}
      />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
        {children}
      </main>
    </div>
  )
}
