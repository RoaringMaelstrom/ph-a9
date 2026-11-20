"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  CalendarCheckIcon,
  CalendarIcon,
  CircleCheckIcon,
  ClockIcon,
  MessageSquareIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { TIME_SLOTS } from "@/lib/site"
import {
  firstBookableDay,
  isDayBookable,
  isSlotAvailable,
  lastBookableDay,
  timeSlotLabel,
  toDateKey,
} from "@/lib/booking"
import { formatPrice } from "@/lib/format"
import { ApiError, createAppointment } from "@/lib/api-client"
import type { Service } from "@/app/components/types/service"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"

const MESSAGE_MAX = 500

type Errors = Partial<Record<"date" | "slot" | "form", string>>

const subscribe = () => () => {}
/** Dates/slots depend on the visitor's clock, so render the form client-side only. */
function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}

export default function BookingForm({ service }: { service: Service }) {
  const mounted = useMounted()
  if (!mounted) return <BookingFormSkeleton />
  return <BookingFormInner service={service} />
}

function BookingFormInner({ service }: { service: Service }) {
  const router = useRouter()
  const pathname = usePathname()
  const [now] = useState(() => new Date())

  const [date, setDate] = useState<Date | undefined>()
  const [slot, setSlot] = useState<string>("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [submitting, setSubmitting] = useState(false)
  const [booked, setBooked] = useState<{ date: Date; slot: string } | null>(
    null
  )

  function selectDate(next: Date | undefined) {
    setDate(next)
    setErrors((e) => ({ ...e, date: undefined, form: undefined }))
    // Drop a slot that isn't available on the newly chosen day.
    if (next && slot && !isSlotAvailable(next, slot, new Date())) setSlot("")
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const next: Errors = {}
    if (!date) next.date = "Please choose a date."
    if (!slot) next.slot = "Please choose a time."
    else if (date && !isSlotAvailable(date, slot, new Date()))
      next.slot = "That time is no longer available. Please pick another."
    setErrors(next)
    if (next.date || next.slot || !date) return

    setSubmitting(true)
    try {
      await createAppointment({
        serviceId: service._id,
        appointmentDate: toDateKey(date),
        timeSlot: slot,
        message: message.trim() || undefined,
      })
      setBooked({ date, slot })
      toast.add({
        title: "Appointment requested!",
        description: "We'll review it and confirm shortly.",
        type: "success",
      })
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0
      const text = err instanceof Error ? err.message : "Something went wrong."

      if (status === 401) {
        toast.add({
          title: "Please sign in again",
          description: text,
          type: "error",
        })
        router.push(`/sign-in?redirect=${encodeURIComponent(pathname)}`)
        return
      }
      if (status === 409) {
        setErrors({
          slot: "This time slot is already booked. Please choose another time or date.",
        })
        toast.add({
          title: "Time slot unavailable",
          description:
            "Someone has already booked that time. Please pick another.",
          type: "error",
        })
      } else {
        setErrors({ form: text })
        toast.add({ title: "Booking failed", description: text, type: "error" })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (booked) {
    return (
      <div className="flex flex-col items-center py-4 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
          <CircleCheckIcon className="size-6" />
        </span>
        <h3 className="mt-4 text-lg font-semibold">Request sent!</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Your request for{" "}
          <span className="font-medium text-foreground">
            {service.serviceName}
          </span>{" "}
          on{" "}
          <span className="font-medium text-foreground">
            {format(booked.date, "EEEE, MMM d")} at {timeSlotLabel(booked.slot)}
          </span>{" "}
          is <span className="font-medium text-foreground">pending</span>. You
          can pay once the salon confirms it.
        </p>
        <div className="mt-6 flex w-full flex-col gap-2">
          <Button
            render={<Link href="/dashboard/customer/appointments" />}
            nativeButton={false}
          >
            View my appointments
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setBooked(null)
              setDate(undefined)
              setSlot("")
              setMessage("")
            }}
          >
            Book another time
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Date */}
      <Field data-invalid={!!errors.date || undefined}>
        <FieldLabel className="flex items-center gap-2">
          <CalendarIcon className="size-4 text-primary" />
          Choose a date
        </FieldLabel>
        <div className="rounded-xl border bg-background">
          <Calendar
            mode="single"
            selected={date}
            onSelect={selectDate}
            disabled={(day) => !isDayBookable(day, now)}
            startMonth={firstBookableDay(now)}
            endMonth={lastBookableDay(now)}
            showOutsideDays={false}
            className="mx-auto w-full bg-transparent [--cell-size:--spacing(9)]"
          />
        </div>
        <FieldError>{errors.date}</FieldError>
      </Field>

      {/* Time slot */}
      <Field data-invalid={!!errors.slot || undefined}>
        <FieldLabel id="slot-label" className="flex items-center gap-2">
          <ClockIcon className="size-4 text-primary" />
          Choose a time
        </FieldLabel>
        {!date ? (
          <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
            Pick a date to see available times.
          </p>
        ) : (
          <div
            role="radiogroup"
            aria-labelledby="slot-label"
            className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3"
          >
            {TIME_SLOTS.map((s) => {
              const available = isSlotAvailable(date, s.value, now)
              const selected = slot === s.value
              return (
                <button
                  key={s.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!available || submitting}
                  onClick={() => {
                    setSlot(s.value)
                    setErrors((e) => ({
                      ...e,
                      slot: undefined,
                      form: undefined,
                    }))
                  }}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:line-through disabled:opacity-40",
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background hover:border-primary/50"
                  )}
                >
                  {s.label}
                </button>
              )
            })}
          </div>
        )}
        <FieldError>{errors.slot}</FieldError>
      </Field>

      {/* Message */}
      <Field>
        <FieldLabel
          htmlFor="booking-message"
          className="flex items-center gap-2"
        >
          <MessageSquareIcon className="size-4 text-primary" />
          Message{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </FieldLabel>
        <Textarea
          id="booking-message"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
          placeholder="Anything we should know? e.g. hair length, allergies, preferred stylist"
          rows={3}
          disabled={submitting}
          className="resize-none bg-background"
        />
        <p className="text-right text-xs text-muted-foreground">
          {message.length}/{MESSAGE_MAX}
        </p>
      </Field>

      {/* Summary + submit */}
      <div className="space-y-4 border-t pt-5">
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">When</dt>
            <dd className="text-right font-medium">
              {date ? format(date, "EEE, MMM d, yyyy") : "—"}
              {slot ? ` · ${timeSlotLabel(slot)}` : ""}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Price</dt>
            <dd className="font-semibold text-primary">
              {formatPrice(service.price)}
            </dd>
          </div>
        </dl>

        {errors.form && (
          <p
            role="alert"
            className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {errors.form}
          </p>
        )}

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full"
          disabled={submitting}
        >
          {submitting ? <Spinner /> : <CalendarCheckIcon />}
          {submitting ? "Sending request..." : "Request Appointment"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          No payment now. You&apos;ll pay once the salon confirms your
          appointment.
        </p>
      </div>
    </form>
  )
}

export function BookingFormSkeleton() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="space-y-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-20 w-full" />
      </div>
      <Skeleton className="h-11 w-full" />
    </div>
  )
}
