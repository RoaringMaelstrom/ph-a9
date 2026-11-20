/**
 * Static salon details shown in the footer (and reusable elsewhere).
 * Replace the placeholder contact info and social URLs with real ones.
 */
export const SALON_INFO = {
  name: "SalonBook",
  tagline:
    "Book hair, skin, nail and spa appointments online. Browse our services, pick a time that suits you, and pay securely once your visit is confirmed.",
  phone: "+1 (555) 014-2290",
  email: "hello@salonbook.com",
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
