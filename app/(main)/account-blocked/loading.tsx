import { Skeleton } from "@/components/ui/skeleton"
import { LoadingRegion } from "@/app/components/skeletons/DashboardSkeletons"

/**
 * Mirrors the page + `BlockedNotice` card while the account is checked.
 * The "blocked" wording isn't shown yet: users who aren't blocked are
 * redirected away, and shouldn't see it flash.
 */
export default function AccountBlockedLoading() {
  return (
    <main className="flex flex-1 items-center px-4 py-16 sm:px-6">
      <div className="mx-auto w-full max-w-lg">
        <LoadingRegion label="Checking your account">
          <div className="flex flex-col items-center rounded-2xl border border-dashed bg-muted/40 px-6 py-14 text-center">
            <Skeleton className="size-12 rounded-full" />
            <Skeleton className="mt-4 h-7 w-56" />
            <div className="mt-2 flex w-full flex-col items-center gap-1.5">
              <Skeleton className="h-4 w-full max-w-sm" />
              <Skeleton className="h-4 w-full max-w-xs" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="mt-6 h-9 w-28" />
          </div>
        </LoadingRegion>
      </div>
    </main>
  )
}
