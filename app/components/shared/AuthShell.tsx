import { CalendarCheckIcon, ScissorsIcon, SparklesIcon, StarIcon } from "lucide-react"

const HIGHLIGHTS = [
  { icon: SparklesIcon, text: "Hair, skin, nails and spa services in one place" },
  { icon: CalendarCheckIcon, text: "Request appointments in a few clicks" },
  { icon: StarIcon, text: "Track bookings and payments from your dashboard" },
]

/**
 * Two-column layout shared by the sign-in and sign-up pages:
 * a branded panel on large screens and the form on the right.
 */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-[calc(100svh-4rem)] items-stretch">
      <aside className="relative hidden w-1/2 overflow-hidden bg-linear-to-br from-primary via-primary/85 to-[#5b3a33] text-primary-foreground lg:flex">
        <div
          aria-hidden
          className="absolute -top-24 -right-24 size-96 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -left-20 size-112 rounded-full bg-black/10 blur-3xl"
        />
        <div className="relative flex flex-col justify-between p-12 xl:p-16">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex size-9 items-center justify-center rounded-full bg-white/15">
              <ScissorsIcon className="size-4" />
            </span>
            SalonBook
          </div>

          <div className="max-w-md space-y-6">
            <h2 className="text-4xl leading-tight font-semibold tracking-tight">
              Your next salon visit, booked beautifully.
            </h2>
            <ul className="space-y-4">
              {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-primary-foreground/90">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <Icon className="size-3.5" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-primary-foreground/70">
            &copy; {new Date().getFullYear()} SalonBook
          </p>
        </div>
      </aside>

      <section className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </section>
    </main>
  )
}
