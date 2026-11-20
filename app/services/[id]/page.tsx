import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"
import {
  BanIcon,
  CalendarCheckIcon,
  ClockIcon,
  CloudOffIcon,
  CreditCardIcon,
  ScissorsIcon,
  ShieldAlertIcon,
  TagIcon,
} from "lucide-react"

import { auth } from "@/lib/auth"
import { getServiceById } from "@/lib/api"
import { formatDuration, formatPrice } from "@/lib/format"
import { categoryHref } from "@/lib/site"
import { dashboardPathFor } from "@/lib/routes"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import SectionMessage from "@/app/components/shared/SectionMessage"

import BookingForm from "./BookingForm"

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const result = await getServiceById(id)
  if (result.status !== "ok") return { title: "Service | SalonBook" }
  return {
    title: `${result.data.serviceName} | SalonBook`,
    description: result.data.description.slice(0, 155),
  }
}

export default async function ServiceDetailsPage({ params }: Props) {
  const { id } = await params

  // proxy.ts already redirects visitors without a session cookie; this is the
  // real check against the database.
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session)
    redirect(`/sign-in?redirect=${encodeURIComponent(`/services/${id}`)}`)

  if (session.user.isBlocked) {
    return (
      <PageShell>
        <SectionMessage
          icon={<BanIcon className="size-6" />}
          title="Your account is blocked"
          description="You can't view services or book appointments right now. Please contact the salon for help."
        />
      </PageShell>
    )
  }

  const result = await getServiceById(id)
  if (result.status === "not-found") notFound()
  if (result.status === "error") {
    return (
      <PageShell>
        <SectionMessage
          icon={<CloudOffIcon className="size-6" />}
          title="We couldn't load this service"
          description={`${result.error} Please refresh the page or try again in a moment.`}
          action={
            <Button
              variant="outline"
              render={<Link href="/services" />}
              nativeButton={false}
            >
              Back to services
            </Button>
          }
        />
      </PageShell>
    )
  }

  const service = result.data
  const isActive = service.status === "active"
  const isAdmin = session.user.role === "admin"

  return (
    <PageShell>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link href="/services" />}>
              Services
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1">
              {service.serviceName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
        {/* Service details */}
        <article>
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-muted sm:aspect-video lg:aspect-4/3">
            {service.image ? (
              <Image
                src={service.image}
                alt={service.serviceName}
                fill
                preload
                sizes="(min-width: 1024px) 60vw, 100vw"
                className="object-cover"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-muted-foreground">
                <ScissorsIcon className="size-14" strokeWidth={1.25} />
              </span>
            )}
            {!isActive && (
              <span className="absolute top-4 left-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-destructive shadow-sm backdrop-blur">
                Currently unavailable
              </span>
            )}
          </div>

          <div className="mt-6">
            <Link
              href={categoryHref(service.category)}
              className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/70"
            >
              <TagIcon className="size-3" />
              {service.category}
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {service.serviceName}
            </h1>

            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Fact icon={<CreditCardIcon className="size-4" />} label="Price">
                <span className="text-primary">
                  {formatPrice(service.price)}
                </span>
              </Fact>
              <Fact
                icon={<ClockIcon className="size-4" />}
                label="Estimated duration"
              >
                {formatDuration(service.duration)}
              </Fact>
              <Fact
                icon={<TagIcon className="size-4" />}
                label="Category"
                className="col-span-2 sm:col-span-1"
              >
                {service.category}
              </Fact>
            </dl>

            <h2 className="mt-8 text-lg font-semibold">About this service</h2>
            <p className="mt-2 leading-relaxed whitespace-pre-line text-muted-foreground">
              {service.description}
            </p>
          </div>
        </article>

        {/* Booking */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <CalendarCheckIcon className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">Book an appointment</h2>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(service.price)} ·{" "}
                  {formatDuration(service.duration)}
                </p>
              </div>
            </div>

            {isAdmin ? (
              <Notice
                icon={<ShieldAlertIcon className="size-5" />}
                title="Admins can't book appointments"
                description="You're signed in as an admin. Appointment requests can only be made from a customer account."
                action={
                  <Button
                    variant="outline"
                    className="w-full"
                    render={<Link href={dashboardPathFor("admin")} />}
                    nativeButton={false}
                  >
                    Go to admin dashboard
                  </Button>
                }
              />
            ) : !isActive ? (
              <Notice
                icon={<BanIcon className="size-5" />}
                title="Not available for booking"
                description="This service is currently inactive. Please explore our other services."
                action={
                  <Button
                    variant="outline"
                    className="w-full"
                    render={<Link href={categoryHref(service.category)} />}
                    nativeButton={false}
                  >
                    See similar services
                  </Button>
                }
              />
            ) : (
              <BookingForm service={service} />
            )}
          </div>
        </aside>
      </div>
    </PageShell>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {children}
      </div>
    </main>
  )
}

function Fact({
  icon,
  label,
  children,
  className,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl border bg-card px-4 py-3 ${className ?? ""}`}>
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 font-semibold">{children}</dd>
    </div>
  )
}

function Notice({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode
  title: string
  description: string
  action: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-dashed bg-muted/40 p-5 text-center">
      <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4">{action}</div>
    </div>
  )
}
