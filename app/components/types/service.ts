/** Service-related types shared by the client. Shapes match the Express API (see AGENTS.md → API contract). */

export type ServiceStatus = "active" | "inactive"

export interface Service {
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

/** Active-service count for one category (`GET /services/categories`). */
export interface CategoryCount {
  category: string
  count: number
}

/** Service plus a server-formatted "added" date, for the New Arrivals section. */
export interface NewArrival extends Service {
  /** Pre-formatted on the server so server and client render the same text. */
  addedLabel: string
}

/** Sort options for service lists (sent to the API as `sort`). */
export type ServiceSort =
  "newest" | "price-asc" | "price-desc" | "duration-asc" | "duration-desc"

/** Allowed "services per page" values on Browse Services. */
export type ServicesPerPage = 9 | 15 | 30

/** Browse Services filters + pagination, parsed from the URL search params. */
export interface ServiceFilters {
  search: string
  /** Empty string = all categories */
  category: string
  sort: ServiceSort
  /** 1-based page number */
  page: number
  perPage: ServicesPerPage
}

/** One page of results plus the numbers needed to render pagination. */
export interface PaginatedServices {
  items: Service[]
  /** Current page, clamped to the valid range */
  page: number
  totalPages: number
  total: number
  /** 1-based index of the first/last item on this page (0 when empty) */
  from: number
  to: number
}

/** A page number button, or a gap ("…") in the pagination bar. */
export type PageItem = number | "ellipsis"
