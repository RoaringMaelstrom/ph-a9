import { cn } from "@/lib/utils"

const TONES = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
  primary: "bg-primary/10 text-primary",
} as const

/** Shared shell for the payment result pages: icon, title, text, body, actions. */
export default function PaymentCard({
  icon,
  tone = "primary",
  title,
  description,
  children,
  actions,
}: {
  icon: React.ReactNode
  tone?: keyof typeof TONES
  title: string
  description: React.ReactNode
  children?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border bg-card px-6 py-10 shadow-sm sm:px-10">
      <div className="flex flex-col items-center text-center">
        <span
          className={cn(
            "flex size-14 items-center justify-center rounded-full",
            TONES[tone]
          )}
        >
          {icon}
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {children && <div className="mt-8">{children}</div>}
      {actions && (
        <div className="mt-8 flex flex-col-reverse justify-center gap-2 sm:flex-row">
          {actions}
        </div>
      )}
    </section>
  )
}
