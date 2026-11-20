import { LockIcon, ReceiptIcon } from "lucide-react"

import { requireRole } from "@/lib/session"
import { serverApi } from "@/lib/server-api"
import {
  formatAppointmentDate,
  formatDate,
  formatMoney,
  shortRef,
} from "@/lib/format"
import { paginate, parsePageParam } from "@/lib/pagination"
import type { TransactionDetails } from "@/app/components/types/transaction"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import DashboardPagination from "@/app/components/dashboard/DashboardPagination"
import DataError from "@/app/components/dashboard/DataError"
import PageHeader from "@/app/components/dashboard/PageHeader"
import { TransactionStatusBadge } from "@/app/components/dashboard/StatusBadge"
import UserAvatar from "@/app/components/dashboard/UserAvatar"
import SectionMessage from "@/app/components/shared/SectionMessage"

/**
 * Read-only by design: transactions are created only by the verified Stripe
 * webhook, and admins can't edit payment records.
 */
const PER_PAGE = 12
const SECTION_ID = "transactions-list"

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>
}) {
  await requireRole("admin", "/dashboard/admin/transactions")
  const page = parsePageParam((await searchParams).page)
  const result = await serverApi<TransactionDetails[]>("/admin/transactions")
  // Newest first, then one page of them.
  const pageData =
    result.error === null
      ? paginate(
          result.data
            .slice()
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
          page,
          PER_PAGE
        )
      : null

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Payments recorded from verified Stripe checkouts."
      />

      <p className="mb-5 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        <LockIcon className="size-3.5" />
        Payment records are created automatically by Stripe and can&apos;t be
        edited.
      </p>

      {result.error !== null ? (
        <DataError message={result.error} />
      ) : pageData === null || pageData.total === 0 ? (
        <SectionMessage
          icon={<ReceiptIcon className="size-6" />}
          title="No transactions yet"
          description="Payments will appear here once customers pay for confirmed appointments."
        />
      ) : (
        <section
          id={SECTION_ID}
          aria-label="Transactions"
          className="scroll-mt-24"
        >
          <div className="rounded-2xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Appointment
                  </TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Currency
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    Stripe session
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-4">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.items.map((t) => (
                  <TableRow key={t._id}>
                    <TableCell className="pl-4">
                      <div className="flex min-w-44 items-center gap-3">
                        <UserAvatar
                          name={t.customer?.name}
                          image={t.customer?.image}
                          className="size-8"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {t.customer?.name ?? "Deleted account"}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {t.customer?.email ?? "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-48 truncate">
                      {t.service?.serviceName ?? "Deleted service"}
                    </TableCell>
                    <TableCell className="hidden whitespace-nowrap md:table-cell">
                      {formatAppointmentDate(t.appointmentDate)}
                    </TableCell>
                    <TableCell className="font-semibold tabular-nums">
                      {formatMoney(t.amount, t.currency)}
                    </TableCell>
                    <TableCell className="hidden uppercase sm:table-cell">
                      {t.currency}
                    </TableCell>
                    <TableCell
                      className="hidden font-mono text-xs text-muted-foreground lg:table-cell"
                      title={t.stripeSessionId}
                    >
                      {shortRef(t.stripeSessionId)}
                    </TableCell>
                    <TableCell>
                      <TransactionStatusBadge status={t.status} />
                    </TableCell>
                    <TableCell className="pr-4 whitespace-nowrap">
                      {formatDate(t.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DashboardPagination
            {...pageData}
            sectionId={SECTION_ID}
            noun="transactions"
            className="mt-4"
          />
        </section>
      )}
    </>
  )
}
