import { Skeleton } from "@/components/ui/skeleton"

/**
 * Placeholder matching the sign-in / sign-up card.
 * - `fields`: number of plain text inputs (sign-in: 2, sign-up: 3)
 * - `passwordRules`: show the password checklist row (sign-up)
 * - `imagePicker`: show the avatar + upload/URL tabs block (sign-up)
 */
export default function AuthFormSkeleton({
  fields = 2,
  passwordRules = false,
  imagePicker = false,
}: {
  fields?: number
  passwordRules?: boolean
  imagePicker?: boolean
}) {
  return (
    <div
      role="status"
      aria-label="Loading form"
      className="flex flex-col gap-6 rounded-xl py-6 sm:bg-card sm:shadow-sm sm:ring-1 sm:ring-foreground/10"
    >
      {/* Header */}
      <div className="flex flex-col items-center gap-2 px-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>

      <div className="flex flex-col gap-7 px-6">
        {/* Google button */}
        <Skeleton className="h-10 w-full" />

        {/* "or" separator */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-px flex-1" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-px flex-1" />
        </div>

        {/* Text fields */}
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
            {passwordRules && i === fields - 1 && (
              <div className="grid gap-2 sm:grid-cols-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-28" />
              </div>
            )}
          </div>
        ))}

        {/* Profile image picker */}
        {imagePicker && (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-36" />
            <div className="flex items-start gap-4">
              <Skeleton className="size-16 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Footer link */}
      <div className="flex justify-center px-6">
        <Skeleton className="h-4 w-52" />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  )
}
