/**
 * Static salon details shown in the footer (and reusable elsewhere).
 * Replace the placeholder contact info and social URLs with real ones.
 */
export const SALON_INFO = {
  name: "SalonBook",
  tagline:
    "Book hair, skin, nail and spa appointments online. Browse our services, pick a time that suits you, and pay securely once your visit is confirmed.",
  phone: "+1 (555) 014-2290",
  email: "muhtadihashimabdullah@gmail.com",
  address: ["123 Blossom Avenue, Suite 4", "Springfield, ST 10001"],
  hours: [
    { days: "Mon – Fri", time: "9:00 AM – 8:00 PM" },
    { days: "Saturday", time: "9:00 AM – 6:00 PM" },
    { days: "Sunday", time: "10:00 AM – 4:00 PM" },
  ],
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    x: "https://x.com",
    youtube: "https://youtube.com",
  },
} as const

/**
 * Predefined appointment start times (24h). Hourly, within opening hours.
 * Sunday closes at 4 PM, so later slots are disabled then (see lib/booking.ts).
 */
export const TIME_SLOTS = [
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
  { value: "17:00", label: "5:00 PM" },
] as const

/** How far ahead customers can book. */
export const BOOKING_WINDOW_DAYS = 60

/** Display + Stripe currency (ISO 4217). */
export const CURRENCY = "USD"

export const SERVICE_CATEGORIES = [
  "Haircut & Styling",
  "Hair Coloring",
  "Hair Treatment",
  "Facial & Skincare",
  "Makeup",
  "Manicure & Pedicure",
  "Spa & Massage",
] as const

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]

export function categoryHref(category: string) {
  return `/services?category=${encodeURIComponent(category)}`
}
