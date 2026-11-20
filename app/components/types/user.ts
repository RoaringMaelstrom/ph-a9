import type { UserRole } from "@/lib/routes"

/** A registered user as listed in the admin "Manage Users" page. */
export interface UserAccount {
  _id: string
  name: string
  email: string
  image?: string | null
  phone?: string | null
  role: UserRole
  isBlocked: boolean
  createdAt: string
  /** Optional extras the API may include for the details view */
  appointmentCount?: number
}

/** Fields a user may change on their own profile (never role/isBlocked). */
export interface ProfileUpdateInput {
  name: string
  image?: string
  phone?: string
}
