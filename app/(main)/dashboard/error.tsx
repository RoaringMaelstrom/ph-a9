"use client"

import { useEffect } from "react"
import { RotateCcwIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

/** Catches unexpected errors in dashboard pages without losing the sidebar. */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center rounded-2xl border border-dashed bg-muted/40 px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <TriangleAlertIcon className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">Something went wrong</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">
        We couldn&apos;t load this part of your dashboard. Please try again.
      </p>
      <Button className="mt-6" variant="outline" onClick={reset}>
        <RotateCcwIcon />
        Try again
      </Button>
    </div>
  )
}
