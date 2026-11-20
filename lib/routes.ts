export type UserRole = "customer" | "admin"

export function dashboardPathFor(role?: string | null) {
  return role === "admin" ? "/dashboard/admin" : "/dashboard/customer"
}

/**
 * Only allow same-origin relative paths as post-login redirect targets,
 * so `?redirect=` can't be abused as an open redirect.
 */
export function safeRedirect(value?: string | string[] | null) {
  const path = Array.isArray(value) ? value[0] : value
  if (!path || !path.startsWith("/") || path.startsWith("//")) return null
  if (path.startsWith("/sign-in") || path.startsWith("/sign-up")) return null
  return path
}
