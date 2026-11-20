import { UsersIcon } from "lucide-react"

import { requireRole } from "@/lib/session"
import { serverApi } from "@/lib/server-api"
import { formatDate } from "@/lib/format"
import type { UserAccount } from "@/app/components/types/user"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import DataError from "@/app/components/dashboard/DataError"
import DetailsList from "@/app/components/dashboard/DetailsList"
import PageHeader from "@/app/components/dashboard/PageHeader"
import StatusTabs from "@/app/components/dashboard/StatusTabs"
import { AccountStatusBadge } from "@/app/components/dashboard/StatusBadge"
import UserAvatar from "@/app/components/dashboard/UserAvatar"
import SectionMessage from "@/app/components/shared/SectionMessage"

import UserActions from "./UserActions"

export default async function ManageUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const admin = await requireRole("admin", "/dashboard/admin/users")
  const { status: raw } = await searchParams
  const status = raw === "active" || raw === "blocked" ? raw : ""

  const result = await serverApi<UserAccount[]>("/admin/users")

  return (
    <>
      <PageHeader
        title="Manage Users"
        description="View registered customers and block or unblock their accounts."
      />

      {result.error !== null ? (
        <DataError message={result.error} />
      ) : (
        <UsersTable
          // Spec: manage registered *customers*. Admin accounts aren't listed.
          users={result.data.filter((u) => u.role !== "admin")}
          status={status}
          currentAdminId={admin.id}
        />
      )}
    </>
  )
}

function UsersTable({
  users,
  status,
  currentAdminId,
}: {
  users: UserAccount[]
  status: "" | "active" | "blocked"
  currentAdminId: string
}) {
  const blocked = users.filter((u) => u.isBlocked).length
  const visible = users
    .filter((u) => !status || (status === "blocked") === u.isBlocked)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <>
      <StatusTabs
        basePath="/dashboard/admin/users"
        current={status}
        items={[
          { value: "", label: "All customers", count: users.length },
          { value: "active", label: "Active", count: users.length - blocked },
          { value: "blocked", label: "Blocked", count: blocked },
        ]}
      />

      {visible.length === 0 ? (
        <SectionMessage
          icon={<UsersIcon className="size-6" />}
          title={status ? `No ${status} customers` : "No customers yet"}
          description="Customers appear here after they create an account."
        />
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Customer</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((u) => (
                <TableRow key={u._id}>
                  <TableCell className="pl-4">
                    <div className="flex min-w-48 items-center gap-3">
                      <UserAvatar
                        name={u.name}
                        image={u.image}
                        className="size-9"
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{u.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap md:table-cell">
                    {u.phone || "—"}
                  </TableCell>
                  <TableCell>
                    <AccountStatusBadge isBlocked={u.isBlocked} />
                  </TableCell>
                  <TableCell className="hidden whitespace-nowrap text-muted-foreground lg:table-cell">
                    {formatDate(u.createdAt)}
                  </TableCell>
                  <TableCell className="pr-4">
                    <UserActions
                      id={u._id}
                      name={u.name}
                      isBlocked={u.isBlocked}
                      canBlock={u.role !== "admin" && u._id !== currentAdminId}
                      details={
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              name={u.name}
                              image={u.image}
                              className="size-14"
                            />
                            <div className="min-w-0">
                              <p className="truncate font-semibold">{u.name}</p>
                              <p className="truncate text-sm text-muted-foreground">
                                {u.email}
                              </p>
                            </div>
                          </div>
                          <DetailsList
                            rows={[
                              { label: "Phone", value: u.phone || "—" },
                              { label: "Account type", value: "Customer" },
                              {
                                label: "Status",
                                value: (
                                  <AccountStatusBadge isBlocked={u.isBlocked} />
                                ),
                              },
                              {
                                label: "Joined",
                                value: formatDate(u.createdAt),
                              },
                              ...(u.appointmentCount !== undefined
                                ? [
                                    {
                                      label: "Appointments",
                                      value: u.appointmentCount,
                                    },
                                  ]
                                : []),
                            ]}
                          />
                        </div>
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}
