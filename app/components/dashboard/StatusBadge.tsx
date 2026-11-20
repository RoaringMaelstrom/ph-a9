import {
  BanIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  ClockIcon,
  CreditCardIcon,
  XCircleIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type {
  AppointmentStatus,
  PaymentStatus,
} from "@/app/components/types/appointment"
import type { ServiceStatus } from "@/app/components/types/service"
import type { TransactionStatus } from "@/app/components/types/transaction"

const base =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3"

const STYLES = {
  warning: "bg-warning/15 text-foreground dark:text-warning",
  success: "bg-success/15 text-success",
  destructive: "bg-destructive/10 text-destructive",
  muted: "bg-muted text-muted-foreground",
}

function Badge({
  tone,
  icon,
  children,
}: {
  tone: keyof typeof STYLES
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <span className={cn(base, STYLES[tone])}>
      {icon}
      {children}
    </span>
  )
}

export function AppointmentStatusBadge({
  status,
}: {
  status: AppointmentStatus
}) {
  if (status === "confirmed")
    return (
      <Badge tone="success" icon={<CircleCheckIcon />}>
        Confirmed
      </Badge>
    )
  if (status === "cancelled")
    return (
      <Badge tone="destructive" icon={<XCircleIcon />}>
        Cancelled
      </Badge>
    )
  return (
    <Badge tone="warning" icon={<ClockIcon />}>
      Pending
    </Badge>
  )
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return status === "paid" ? (
    <Badge tone="success" icon={<CreditCardIcon />}>
      Paid
    </Badge>
  ) : (
    <Badge tone="muted" icon={<CircleDashedIcon />}>
      Unpaid
    </Badge>
  )
}

export function TransactionStatusBadge({
  status,
}: {
  status: TransactionStatus
}) {
  return status === "paid" ? (
    <Badge tone="success" icon={<CircleCheckIcon />}>
      Paid
    </Badge>
  ) : (
    <Badge tone="destructive" icon={<XCircleIcon />}>
      Failed
    </Badge>
  )
}

export function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  return status === "active" ? (
    <Badge tone="success" icon={<CircleCheckIcon />}>
      Active
    </Badge>
  ) : (
    <Badge tone="muted" icon={<BanIcon />}>
      Inactive
    </Badge>
  )
}

export function AccountStatusBadge({ isBlocked }: { isBlocked: boolean }) {
  return isBlocked ? (
    <Badge tone="destructive" icon={<BanIcon />}>
      Blocked
    </Badge>
  ) : (
    <Badge tone="success" icon={<CircleCheckIcon />}>
      Active
    </Badge>
  )
}
