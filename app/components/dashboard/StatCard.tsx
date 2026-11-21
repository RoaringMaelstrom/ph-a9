import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

const TONES = {
  primary: "bg-primary/10 text-primary",
  warning: "bg-warning/15 text-warning",
  success: "bg-success/15 text-success",
  destructive: "bg-destructive/10 text-destructive",
  info: "bg-info/15 text-info",
  gold: "bg-gold/20 text-gold-foreground dark:text-gold",
} as const

export type StatTone = keyof typeof TONES

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
}: {
  label: string
  value: number | string
  icon: LucideIcon
  tone?: StatTone
  hint?: string
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-xl",
            TONES[tone]
          )}
        >
          <Icon className="size-4.5" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Loading placeholder; pass the card's real `label` so only the number pulses. */
export function StatCardSkeleton({ label }: { label?: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        {label ? (
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        ) : (
          <Skeleton className="h-4 w-28" />
        )}
        <Skeleton className="size-9 shrink-0 rounded-xl" />
      </div>
      <Skeleton className="mt-3 h-8 w-16" />
    </div>
  )
}
