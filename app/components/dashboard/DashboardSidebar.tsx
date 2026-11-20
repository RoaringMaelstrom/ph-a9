"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { MenuIcon, ShieldCheckIcon, UserIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { isNavItemActive, navFor } from "./nav"
import UserAvatar from "./UserAvatar"

type SidebarUser = {
  name: string
  email: string
  image?: string | null
  role: string
}

function NavLinks({
  role,
  onNavigate,
}: {
  role: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()

  return (
    <nav aria-label="Dashboard">
      <ul className="space-y-1">
        {navFor(role).map((item) => {
          const active = isNavItemActive(item, pathname)
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function UserCard({ user }: { user: SidebarUser }) {
  const isAdmin = user.role === "admin"
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card p-3">
      <UserAvatar name={user.name} image={user.image} className="size-10" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground">
          {isAdmin ? (
            <ShieldCheckIcon className="size-3 text-primary" />
          ) : (
            <UserIcon className="size-3" />
          )}
          {isAdmin ? "Administrator" : "Customer"}
        </p>
      </div>
    </div>
  )
}

/**
 * Role-based dashboard navigation: a sticky sidebar on desktop and a
 * slide-out menu on mobile/tablet.
 */
export default function DashboardSidebar({ user }: { user: SidebarUser }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const current = navFor(user.role).find((item) =>
    isNavItemActive(item, pathname)
  )

  return (
    <>
      {/* Mobile / tablet bar */}
      <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3 sm:px-6 lg:hidden">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            {user.role === "admin" ? "Admin dashboard" : "My dashboard"}
          </p>
          <p className="truncate text-sm font-semibold">
            {current?.label ?? "Dashboard"}
          </p>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger render={<Button variant="outline" size="sm" />}>
            <MenuIcon />
            Menu
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Dashboard</SheetTitle>
            </SheetHeader>
            <div className="space-y-5 px-4">
              <UserCard user={user} />
              <NavLinks role={user.role} onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-muted/30 lg:block">
        <div className="sticky top-16 space-y-6 p-5">
          <UserCard user={user} />
          <NavLinks role={user.role} />
        </div>
      </aside>
    </>
  )
}
