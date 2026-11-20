/** Appointment types. Shapes match the Express API (see AGENTS.md → API contract). */

export type AppointmentStatus = "pending" | "confirmed" | "cancelled"
export type PaymentStatus = "unpaid" | "paid"

export interface Appointment {
  _id: string
  serviceId: string
  customerId: string
  /** Calendar date, "YYYY-MM-DD" */
  appointmentDate: string
  /** 24h start time from TIME_SLOTS, e.g. "14:00" */
  timeSlot: string
  message?: string
  servicePrice: number
  paymentStatus: PaymentStatus
  status: AppointmentStatus
  createdAt: string
}

/**
 * Body for `POST /appointments`. The customer comes from the JWT and the price
 * from the service on the server; neither is sent by the client.
 */
export interface CreateAppointmentInput {
  serviceId: string
  appointmentDate: string
  timeSlot: string
  message?: string
}

/** Service fields the API embeds in appointment/transaction lists. `null` if the service was deleted. */
export interface ServiceSummary {
  _id: string
  serviceName: string
  category: string
  image: string
  price: number
}

/** Customer fields the API embeds in admin lists. `null` if the account was deleted. */
export interface CustomerSummary {
  _id: string
  name: string
  email: string
  image?: string | null
  phone?: string | null
}

/** Appointment with its service populated (customer "My Appointments"). */
export interface AppointmentWithService extends Appointment {
  service: ServiceSummary | null
}

/** Appointment with service and customer populated (admin "Manage Appointments"). */
export interface AppointmentDetails extends AppointmentWithService {
  customer: CustomerSummary | null
}

/** A bookable time slot shown in the appointment form. */
export interface TimeSlot {
  /** 24h "HH:mm", stored on the appointment */
  value: string
  /** Display label, e.g. "2:00 PM" */
  label: string
}
