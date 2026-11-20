"use server"

import { updateTag } from "next/cache"

import { assertRole } from "@/lib/session"

/**
 * After an admin creates/updates/deletes a service (via the Express API),
 * expire the cached public service data (home page sections, Browse
 * Services, details) so visitors see the change immediately.
 * Server Actions are public endpoints, so the role is re-checked here.
 */
export async function refreshServicesCache(serviceId?: string) {
  await assertRole("admin")
  updateTag("services")
  if (serviceId) updateTag(`service:${serviceId}`)
}
