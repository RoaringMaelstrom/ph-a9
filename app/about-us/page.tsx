import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRightIcon,
  CalendarCheckIcon,
  CalendarClockIcon,
  ChevronDownIcon,
  ClockIcon,
  CreditCardIcon,
  HeartHandshakeIcon,
  LayoutDashboardIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserCheckIcon,
} from "lucide-react"

import {
  BOOKING_WINDOW_DAYS,
  SALON_INFO,
  SERVICE_CATEGORIES,
  TIME_SLOTS,
  categoryHref,
} from "@/lib/site"
import { Button } from "@/components/ui/button"

const DESCRIPTION =
  "Learn how SalonBook works: browse hair, skin, nail and spa services, request an appointment online, get it confirmed by the salon, and pay securely with Stripe."

export const metadata: Metadata = {
  title: "About Us | How SalonBook Works",
  description: DESCRIPTION,
  keywords: [
    "salon booking",
    "online salon appointment",
    "book haircut online",
    "beauty salon",
    "spa booking",
    "nail salon appointment",
    "SalonBook",
  ],
  alternates: { canonical: "/about-us" },
  openGraph: {
    type: "website",
    url: "/about-us",
    siteName: SALON_INFO.name,
    title: "About SalonBook | How online salon booking works",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: "About SalonBook | How online salon booking works",
    description: DESCRIPTION,
  },
}

const FIRST_SLOT = TIME_SLOTS[0].label
const LAST_SLOT = TIME_SLOTS[TIME_SLOTS.length - 1].label

const STEPS = [
  {
    icon: SearchIcon,
    title: "Browse services",
    text: "Explore our full menu of salon services. Search by name, filter by category and sort by price or duration to compare treatments, prices and how long each visit takes.",
  },
  {
    icon: CalendarClockIcon,
    title: "Request an appointment",
    text: `Sign in, open a service and choose a date up to ${BOOKING_WINDOW_DAYS} days ahead and an hourly time slot between ${FIRST_SLOT} and ${LAST_SLOT}. Add a note for your stylist if you like. Your request is saved as pending.`,
  },
  {
    icon: UserCheckIcon,
    title: "The salon confirms",
    text: "Our team reviews every request and confirms it, so you never arrive to a double-booked chair. You can follow the status of each appointment from your dashboard.",
  },
  {
    icon: CreditCardIcon,
    title: "Pay securely online",
    text: "Once your appointment is confirmed, pay with Stripe Checkout from My Appointments. Your booking is marked as paid as soon as Stripe verifies the payment.",
  },
] as const

const FEATURES = [
  {
    icon: CalendarCheckIcon,
    title: "No double bookings",
    text: "Each service can only be booked once per time slot, and you can't book two appointments at the same time.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure payments",
    text: "Payments are handled by Stripe. SalonBook never sees or stores your card details, and only a verified Stripe confirmation marks a booking as paid.",
  },
  {
    icon: LayoutDashboardIcon,
    title: "Your own dashboard",
    text: "See every request with its status and payment badge, cancel pending requests, pay for confirmed visits, review your payment history and update your profile.",
  },
  {
    icon: HeartHandshakeIcon,
    title: "Real people, real salon",
    text: "Every appointment is reviewed by our team, so your visit is planned around the time and care your treatment needs.",
  },
] as const

const FAQS = [
  {
    q: "Do I need an account to book a salon appointment?",
    a: "You can browse all services without an account. To request an appointment, create a free account with your email or sign in with Google.",
  },
  {
    q: "How far in advance can I book?",
    a: `You can request appointments from today up to ${BOOKING_WINDOW_DAYS} days ahead. Time slots run hourly from ${FIRST_SLOT} to ${LAST_SLOT}; on Sundays the last slot is 3:00 PM because the salon closes at 4 PM.`,
  },
  {
    q: "When do I pay for my appointment?",
    a: "Only after the salon confirms your request. A Pay Now button then appears in My Appointments and takes you to Stripe's secure checkout. You can't be charged for a pending or cancelled appointment.",
  },
  {
    q: "Can I cancel an appointment?",
    a: "You can cancel a pending request yourself from your dashboard at any time. Once an appointment is confirmed, please contact the salon to change or cancel it.",
  },
  {
    q: "Is online payment safe?",
    a: "Yes. Payments are processed by Stripe, a PCI-certified payment provider. Your card details go directly to Stripe and are never stored by SalonBook.",
  },
  {
    q: "What happens if I leave the checkout page?",
    a: "Nothing is charged. Your appointment stays confirmed and unpaid, and you can pay later from My Appointments.",
  },
] as const

/** Structured data: the salon (local business) and the FAQ, for search engines. */
function jsonLd() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "")
  return [
    {
      "@context": "https://schema.org",
      "@type": "BeautySalon",
      name: SALON_INFO.name,
      description: SALON_INFO.tagline,
      ...(baseUrl && { url: baseUrl }),
      telephone: SALON_INFO.phone,
      email: SALON_INFO.email,
      address: {
        "@type": "PostalAddress",
        streetAddress: SALON_INFO.address[0],
        addressLocality: SALON_INFO.address[1],
      },
      openingHoursSpecification: [
        { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "20:00" },
        { days: ["Saturday"], opens: "09:00", closes: "18:00" },
        { days: ["Sunday"], opens: "10:00", closes: "16:00" },
      ].map(({ days, opens, closes }) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: days,
        opens,
        closes,
      })),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Salon services",
        itemListElement: SERVICE_CATEGORIES.map((category) => ({
          "@type": "OfferCatalog",
          name: category,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ]
}

function SectionHeading({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-medium tracking-wide text-primary uppercase">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
      >
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base text-pretty text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </div>
  )
}

export default function AboutUsPage() {
  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd()).replace(/</g, "\\u003c"),
        }}
      />

      {/* Intro */}
      <section className="border-b bg-muted/40">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3.5 py-1.5 text-xs font-medium tracking-wide text-muted-foreground sm:text-sm">
            <SparklesIcon className="size-3.5 text-primary" />
            About SalonBook
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Salon appointments, booked the easy way
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
            SalonBook is our salon&apos;s online booking platform. Browse hair,
            skin, nail and spa services, request a time that suits you, and pay
            securely once your visit is confirmed. No phone calls, no waiting
            on hold.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              render={<Link href="/services" />}
              nativeButton={false}
            >
              Explore salon services
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/sign-up" />}
              nativeButton={false}
            >
              Create a free account
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        aria-labelledby="how-it-works"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <SectionHeading
          id="how-it-works"
          eyebrow="How it works"
          title="From browsing to booked in four steps"
          description="Every appointment follows the same simple, transparent process."
        />
        <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li
              key={title}
              className="relative rounded-2xl border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Services */}
      <section
        aria-labelledby="our-services"
        className="border-y bg-muted/40 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            id="our-services"
            eyebrow="Our services"
            title="Everything from a fresh cut to a full spa day"
            description="Our menu covers seven categories of salon treatments. Pick one to see the services, prices and durations."
          />
          <ul className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
            {SERVICE_CATEGORIES.map((category) => (
              <li key={category}>
                <Link
                  href={categoryHref(category)}
                  className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {category}
                  <ArrowRightIcon className="size-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Why SalonBook */}
      <section
        aria-labelledby="why-salonbook"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <SectionHeading
          id="why-salonbook"
          eyebrow="Why SalonBook"
          title="Built for clear, reliable bookings"
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 rounded-2xl border bg-card p-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Visit us */}
      <section
        aria-labelledby="visit-us"
        className="border-y bg-muted/40 py-16 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            id="visit-us"
            eyebrow="Visit us"
            title="Opening hours and location"
          />
          <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="flex items-center gap-2 font-semibold">
                <ClockIcon className="size-4 text-primary" />
                Opening hours
              </h3>
              <dl className="mt-4 divide-y text-sm">
                {SALON_INFO.hours.map(({ days, time }) => (
                  <div key={days} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-muted-foreground">{days}</dt>
                    <dd className="font-medium">{time}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-2xl border bg-card p-6">
              <h3 className="flex items-center gap-2 font-semibold">
                <MapPinIcon className="size-4 text-primary" />
                Find us
              </h3>
              <address className="mt-4 space-y-3 text-sm not-italic">
                <p className="text-muted-foreground">
                  {SALON_INFO.address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
                <a
                  href={`tel:${SALON_INFO.phone.replace(/[^\d+]/g, "")}`}
                  className="flex items-center gap-2 font-medium hover:text-primary"
                >
                  <PhoneIcon className="size-4 text-muted-foreground" />
                  {SALON_INFO.phone}
                </a>
                <a
                  href={`mailto:${SALON_INFO.email}`}
                  className="flex items-center gap-2 font-medium hover:text-primary"
                >
                  <MailIcon className="size-4 text-muted-foreground" />
                  {SALON_INFO.email}
                </a>
              </address>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        aria-labelledby="faq"
        className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <SectionHeading
          id="faq"
          eyebrow="FAQ"
          title="Frequently asked questions"
        />
        {/* Native <details>: answers are in the HTML for search engines and work without JS. */}
        <div className="mt-10 divide-y rounded-2xl border bg-card">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                <h3>{q}</h3>
                <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground sm:px-12">
          <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Ready for your next salon visit?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
            Browse our services and request an appointment in a few clicks.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-7"
            render={<Link href="/services" />}
            nativeButton={false}
          >
            Browse services
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
      </section>
    </main>
  )
}
