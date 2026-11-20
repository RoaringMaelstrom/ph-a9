import {
  CalendarCheckIcon,
  CalendarDaysIcon,
  LayoutDashboardIcon,
  ListIcon,
  PlusCircleIcon,
  ReceiptIcon,
  UserCircleIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"

import type { UserRole } from "@/lib/routes"

export interface DashboardNavItem {
  href: string
  label: string
  icon: LucideIcon
  /** Only highlight on an exact match (used for Overview pages) */
  exact?: boolean
}

const CUSTOMER_NAV: DashboardNavItem[] = [
  {
    href: "/dashboard/customer",
    label: "Overview",
    icon: LayoutDashboardIcon,
    exact: true,
  },
  {
    href: "/dashboard/customer/appointments",
    label: "My Appointments",
    icon: CalendarCheckIcon,
  },
  {
    href: "/dashboard/customer/profile",
    label: "My Profile",
    icon: UserCircleIcon,
  },
]

const ADMIN_NAV: DashboardNavItem[] = [
  {
    href: "/dashboard/admin",
    label: "Overview",
    icon: LayoutDashboardIcon,
    exact: true,
  },
  {
    href: "/dashboard/admin/services",
    label: "Manage Services",
    icon: ListIcon,
    exact: true,
  },
  {
    href: "/dashboard/admin/services/new",
    label: "Add Service",
    icon: PlusCircleIcon,
  },
  {
    href: "/dashboard/admin/appointments",
    label: "Manage Appointments",
    icon: CalendarDaysIcon,
  },
  { href: "/dashboard/admin/users", label: "Manage Users", icon: UsersIcon },
  {
    href: "/dashboard/admin/transactions",
    label: "Transactions",
    icon: ReceiptIcon,
  },
  {
    href: "/dashboard/admin/profile",
    label: "My Profile",
    icon: UserCircleIcon,
  },
]

/** Sidebar links for a role. Navigation is UI only; pages enforce access on the server. */
export function navFor(role: UserRole | string | null | undefined) {
  return role === "admin" ? ADMIN_NAV : CUSTOMER_NAV
}

export function isNavItemActive(item: DashboardNavItem, pathname: string) {
  if (item.exact) {
    // "Manage Services" should also be active on /services/<id>/edit
    if (item.href === "/dashboard/admin/services") {
      return pathname === item.href || /\/services\/[^/]+\/edit$/.test(pathname)
    }
    return pathname === item.href
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}
