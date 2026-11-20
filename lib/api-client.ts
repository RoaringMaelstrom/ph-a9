"use client"

import { authClient } from "./auth-client"
import { API_URL } from "./api"
import type {
  Appointment,
  CreateAppointmentInput,
} from "@/app/components/types/appointment"

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
