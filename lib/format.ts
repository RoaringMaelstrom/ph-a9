import { format, parseISO } from "date-fns"

import { CURRENCY } from "./site"

const wholeFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 0,
})

const centsFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** 45 → "$45", 35.5 → "$35.50" */
export function formatPrice(amount: number) {
  return Number.isInteger(amount)
    ? wholeFormatter.format(amount)
    : centsFormatter.format(amount)
}

/** 45 → "45 min", 60 → "1 hr", 90 → "1 hr 30 min" */
export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} hr ${m} min` : `${h} hr`
}

/** ISO timestamp → "Nov 20, 2026" ("—" if missing/invalid). */
export function formatDate(iso?: string | null) {
  if (!iso) return "—"
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? "—" : format(date, "MMM d, yyyy")
}

/** Appointment day "2026-11-24" → "Tue, Nov 24, 2026" (local calendar date). */
export function formatAppointmentDate(day?: string | null) {
  if (!day) return "—"
  const date = parseISO(day)
  return Number.isNaN(date.getTime()) ? day : format(date, "EEE, MMM d, yyyy")
}

/** Amount in major units (e.g. dollars) with an ISO currency code. */
export function formatMoney(amount: number, currency = CURRENCY) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`
  }
}

/** "cs_test_a1B2c3D4e5..." → "cs_test_…e5F6" for compact display. */
export function shortRef(id?: string | null, keep = 6) {
  if (!id) return "—"
  if (id.length <= keep * 2 + 1) return id
  const prefix = id.match(/^cs_(test|live)_/)?.[0] ?? id.slice(0, keep)
  return `${prefix}…${id.slice(-keep)}`
}
