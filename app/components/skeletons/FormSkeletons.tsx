import { Skeleton } from "@/components/ui/skeleton"

import { FieldSkeleton, FormActionsSkeleton } from "./DashboardSkeletons"

/** Field-group spacing used by the real forms (`FieldGroup`: gap-7). */
const GROUP = "flex flex-col gap-7"

/** Mirrors `ServiceForm` (admin Add / Update Service). */
export function ServiceFormSkeleton({ isEdit = false }: { isEdit?: boolean }) {
  return (
    <div className="max-w-3xl rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className={GROUP}>
        <FieldSkeleton label="w-28" />
        <FieldSkeleton label="w-20" />
        <FieldSkeleton label="w-24">
          {/* Textarea (5 rows) + character counter */}
          <Skeleton className="h-29 w-full" />
          <Skeleton className="ml-auto h-3 w-14" />
        </FieldSkeleton>
        <div className="grid gap-6 sm:grid-cols-2">
          <FieldSkeleton label="w-24" />
          <FieldSkeleton label="w-48" />
        </div>
        <FieldSkeleton label="w-28">
          {/* ImageInput: 4:3 preview + "Choose an image" button + hint */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Skeleton className="aspect-4/3 w-full shrink-0 rounded-xl sm:w-48" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="mt-2 h-3 w-48" />
            </div>
          </div>
          {isEdit && <Skeleton className="h-4 w-56" />}
        </FieldSkeleton>
        <FieldSkeleton label="w-14">
          {/* Active / Inactive choice cards */}
          <div className="grid gap-3 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="space-y-1.5 rounded-xl border p-3">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-44 max-w-full" />
              </div>
            ))}
          </div>
        </FieldSkeleton>
      </div>
      <FormActionsSkeleton buttons={["sm:w-20", "sm:w-32"]} />
    </div>
  )
}

/** Mirrors `ProfileForm` (photo, name, phone, email, account type). */
export function ProfileFormSkeleton() {
  return (
    <div className="max-w-2xl rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className={GROUP}>
        <FieldSkeleton label="w-24">
          {/* Round photo + Upload / Image URL tabs + button + hint */}
          <div className="flex items-start gap-4">
            <Skeleton className="size-20 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Skeleton className="h-9 w-full rounded-lg" />
              <div>
                <Skeleton className="h-9 w-full" />
                <Skeleton className="mt-2 h-3 w-48 max-w-full" />
              </div>
            </div>
          </div>
        </FieldSkeleton>
        <FieldSkeleton label="w-20" />
        <FieldSkeleton label="w-28" />
        <FieldSkeleton label="w-12">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </FieldSkeleton>
        <FieldSkeleton label="w-24">
          <Skeleton className="h-7 w-28 rounded-full" />
          <Skeleton className="h-4 w-52 max-w-full" />
        </FieldSkeleton>
      </div>
      <FormActionsSkeleton buttons={["sm:w-16", "sm:w-28"]} />
    </div>
  )
}

/** Mirrors `PasswordForm` in its "Change password" mode (the common case). */
export function PasswordFormSkeleton() {
  return (
    <div className="mt-6 max-w-2xl rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      </div>
      <div className={GROUP}>
        <FieldSkeleton label="w-32" />
        <FieldSkeleton label="w-28">
          <Skeleton className="h-9 w-full" />
          {/* Password rules checklist */}
          <div className="grid gap-1 sm:grid-cols-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </FieldSkeleton>
        <FieldSkeleton label="w-40" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-4 w-52" />
        </div>
      </div>
      <FormActionsSkeleton buttons={["sm:w-16", "sm:w-36"]} />
    </div>
  )
}
