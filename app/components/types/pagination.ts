/** Pagination types shared by Browse Services and the dashboard tables. */

/** One page of results plus the numbers needed to render pagination. */
export interface Paginated<T> {
  items: T[]
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
