import type { AppointmentStatus } from "./appointment"

/** Customer overview cards, computed from the customer's own appointments. */
export type CustomerStats = Record<"total" | AppointmentStatus, number>

/** Admin overview cards (`GET /admin/stats`). */
export interface AdminStats {
  totalCustomers: number
  activeServices: number
  totalAppointments: number
  pendingAppointments: number
  confirmedAppointments: number
  successfulPayments: number
}
