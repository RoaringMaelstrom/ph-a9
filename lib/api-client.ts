"use client"

import { authClient } from "./auth-client"
import { API_URL } from "./api"
import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentInput,
} from "@/app/components/types/appointment"
import type { Service, ServiceInput } from "@/app/components/types/service"
import type { UserAccount } from "@/app/components/types/user"

/** Error from the Express API with its HTTP status (0 = network/timeout). */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
    this.name = "ApiError"
  }
}

/** Short-lived Better Auth JWT for the Express API (`Authorization: Bearer`). */
async function getAuthToken() {
  const { data, error } = await authClient.token()
  if (error || !data?.token) {
    throw new ApiError("Your session has expired. Please sign in again.", 401)
  }
  return data.token
}

/** Authenticated JSON request from the browser to the Express API. */
export async function apiRequest<T>(
  path: string,
  init: { method?: string; body?: unknown } = {}
): Promise<T> {
  if (!API_URL) {
    throw new ApiError("The salon server is not configured.", 0)
  }

  const token = await getAuthToken()

  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: init.method ?? "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        ...(init.body !== undefined && { "Content-Type": "application/json" }),
      },
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: AbortSignal.timeout(10_000),
    })
  } catch {
    throw new ApiError(
      "We couldn't reach the salon server. Please check your connection and try again.",
      0
    )
  }

  const json = await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(
      json?.message ?? "Something went wrong. Please try again.",
      res.status
    )
  }
  return (json?.data ?? json) as T
}

/** Customer submits an appointment request (status pending, payment unpaid). */
export function createAppointment(input: CreateAppointmentInput) {
  return apiRequest<Appointment>("/appointments", {
    method: "POST",
    body: input,
  })
}

// ---------------------------------------------------------------------------
// Customer
// ---------------------------------------------------------------------------

/** Customer cancels their own *pending* request. The server enforces both rules. */
export function cancelMyAppointment(id: string) {
  return apiRequest<Appointment>(`/appointments/${id}/cancel`, {
    method: "PATCH",
  })
}

/**
 * Starts Stripe Checkout for a confirmed, unpaid appointment and returns the
 * Checkout URL. Payment status only changes via the verified Stripe webhook.
 */
export function startCheckout(appointmentId: string) {
  return apiRequest<{ url: string }>("/payments/checkout-session", {
    method: "POST",
    body: { appointmentId },
  })
}

// ---------------------------------------------------------------------------
// Admin (Express rejects these with 403 for non-admins)
// ---------------------------------------------------------------------------

export function createService(input: ServiceInput) {
  return apiRequest<Service>("/services", { method: "POST", body: input })
}

export function updateService(id: string, input: Partial<ServiceInput>) {
  return apiRequest<Service>(`/services/${id}`, {
    method: "PATCH",
    body: input,
  })
}

export function deleteService(id: string) {
  return apiRequest<void>(`/services/${id}`, { method: "DELETE" })
}

/** Confirm (pending only) or cancel (pending/confirmed) an appointment. */
export function setAppointmentStatus(
  id: string,
  status: Extract<AppointmentStatus, "confirmed" | "cancelled">
) {
  return apiRequest<Appointment>(`/admin/appointments/${id}/status`, {
    method: "PATCH",
    body: { status },
  })
}

export function setUserBlocked(id: string, isBlocked: boolean) {
  return apiRequest<UserAccount>(`/admin/users/${id}/block`, {
    method: "PATCH",
    body: { isBlocked },
  })
}
