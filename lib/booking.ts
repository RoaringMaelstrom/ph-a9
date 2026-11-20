import { addDays, format, isSameDay, startOfDay } from "date-fns"

import { BOOKING_WINDOW_DAYS, TIME_SLOTS } from "./site"

/** Sunday closes at 4 PM (see SALON_INFO.hours). */
const SUNDAY_LAST_START_HOUR = 15

export function firstBookableDay(now = new Date()) {
  return startOfDay(now)
}

export function lastBookableDay(now = new Date()) {
  return addDays(startOfDay(now), BOOKING_WINDOW_DAYS)
}

/** "YYYY-MM-DD" in the user's local time (what the API stores). */
export function toDateKey(date: Date) {
  return format(date, "yyyy-MM-dd")
}

/**
 * Whether a slot can be booked on a date: not in the past (with a 1-hour
 * buffer for today) and within that day's opening hours.
 */
export function isSlotAvailable(
  date: Date,
  slotValue: string,
  now = new Date()
) {
  const [hour, minute] = slotValue.split(":").map(Number)
  if (date.getDay() === 0 && hour > SUNDAY_LAST_START_HOUR) return false

  if (isSameDay(date, now)) {
    const slotStart = new Date(date)
    slotStart.setHours(hour, minute, 0, 0)
    return slotStart.getTime() - now.getTime() >= 60 * 60 * 1000
  }
  return true
}

/** A day is selectable if it's in the booking window and has a free slot. */
export function isDayBookable(date: Date, now = new Date()) {
  if (date < firstBookableDay(now) || date > lastBookableDay(now)) return false
  return TIME_SLOTS.some((slot) => isSlotAvailable(date, slot.value, now))
}

export function timeSlotLabel(value: string) {
  return TIME_SLOTS.find((s) => s.value === value)?.label ?? value
}
