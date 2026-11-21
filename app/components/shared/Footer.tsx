import Link from "next/link"
import {
  ClockIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ScissorsIcon,
} from "lucide-react"

import { SALON_INFO, SERVICE_CATEGORIES, categoryHref } from "@/lib/site"
import { Separator } from "@/components/ui/separator"

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Browse Services" },
  { href: "/about-us", label: "About Us" },
  { href: "/sign-in", label: "Sign In" },
  { href: "/sign-up", label: "Create Account" },
]

// lucide-react no longer ships brand icons, so these are inlined.
const iconProps = {
  viewBox: "0 0 24 24",
  className: "size-4",
  "aria-hidden": true,
} as const

function FacebookIcon() {
  return (
    <svg
      {...iconProps}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg
      {...iconProps}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg {...iconProps} fill="currentColor">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  )
}

function YoutubeIcon() {
  return (
    <svg
      {...iconProps}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  )
}

const SOCIAL_LINKS = [
  { href: SALON_INFO.social.facebook, label: "Facebook", icon: FacebookIcon },
  {
    href: SALON_INFO.social.instagram,
    label: "Instagram",
    icon: InstagramIcon,
  },
  { href: SALON_INFO.social.x, label: "X (Twitter)", icon: XIcon },
  { href: SALON_INFO.social.youtube, label: "YouTube", icon: YoutubeIcon },
]

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-4 text-sm font-semibold tracking-wide text-foreground uppercase">
      {children}
    </h3>
  )
}

const linkClass =
  "text-sm text-muted-foreground transition-colors hover:text-primary"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t bg-muted/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/*
          Layout:
          - mobile: single column
          - tablet (sm–lg): brand row (text left, social right) → Quick Links | Services
            → Visit Us with contact | hours side by side
          - desktop (lg+): 4 columns
        */}
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-12 lg:gap-x-10">
          {/* Brand + social */}
          <div className="flex flex-col gap-6 sm:col-span-2 sm:flex-row sm:items-end sm:justify-between lg:col-span-4 lg:flex-col lg:items-start lg:justify-start">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <ScissorsIcon className="size-4" />
                </span>
                {SALON_INFO.name}
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground sm:max-w-md lg:max-w-sm">
                {SALON_INFO.tagline}
              </p>
            </div>
            <ul className="flex shrink-0 gap-2" aria-label="Social media">
              {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex size-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Icon />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer" className="lg:col-span-2">
            <FooterHeading>Quick Links</FooterHeading>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Service categories */}
          <nav aria-label="Service categories" className="lg:col-span-3">
            <FooterHeading>Services</FooterHeading>
            <ul className="grid gap-2.5 md:grid-cols-2 md:gap-x-6 lg:grid-cols-1">
              {SERVICE_CATEGORIES.map((category) => (
                <li key={category}>
                  <Link href={categoryHref(category)} className={linkClass}>
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact, address, hours */}
          <div className="sm:col-span-2 lg:col-span-3">
            <FooterHeading>Visit Us</FooterHeading>
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-1">
              <address className="space-y-3 text-sm text-muted-foreground not-italic">
                <p className="flex gap-3">
                  <MapPinIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    {SALON_INFO.address.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </p>
                <p className="flex gap-3">
                  <PhoneIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <a
                    href={`tel:${SALON_INFO.phone.replace(/[^\d+]/g, "")}`}
                    className="hover:text-primary"
                  >
                    {SALON_INFO.phone}
                  </a>
                </p>
                <p className="flex gap-3">
                  <MailIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <a
                    href={`mailto:${SALON_INFO.email}`}
                    className="hover:text-primary"
                  >
                    {SALON_INFO.email}
                  </a>
                </p>
              </address>

              <div className="flex gap-3 text-sm text-muted-foreground">
                <ClockIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
                  {SALON_INFO.hours.map(({ days, time }) => (
                    <div key={days} className="contents">
                      <dt className="font-medium text-foreground">{days}</dt>
                      <dd>{time}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-3 text-center text-sm text-muted-foreground sm:flex-row sm:text-left">
          <p>
            &copy; {year} {SALON_INFO.name}. All rights reserved.
          </p>
          <p>Crafted for effortless salon bookings.</p>
        </div>
      </div>
    </footer>
  )
}
