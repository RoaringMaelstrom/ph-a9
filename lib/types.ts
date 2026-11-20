/** Shapes returned by the Express API (see AGENTS.md → API contract). */

export type ServiceStatus = "active" | "inactive"

export type Service = {
  _id: string
  serviceName: string
  category: string
  description: string
  price: number
  /** Estimated duration in minutes */
  duration: number
  image: string
  status: ServiceStatus
  createdAt: string
}
