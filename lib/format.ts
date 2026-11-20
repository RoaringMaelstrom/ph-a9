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
