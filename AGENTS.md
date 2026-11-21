<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SalonBook — Client (Assignment 9, Category 002)

The full spec is `Requirements.pdf` in the repo root. This file summarizes it plus the repo conventions. When in doubt, the PDF wins.

SalonBook is a salon appointment booking platform. **Customers** browse/search/filter salon services, request appointments, cancel pending ones, and pay for confirmed ones via Stripe. **Admins** manage services (with ImgBB image upload), confirm/cancel appointments, block/unblock customers, and view transactions.

## Architecture

- **This repo = client** (Next.js App Router). The **server is a separate repo** (Node + Express + MongoDB REST API). Both need their own README and meaningful commits (≥20 client, ≥12 server).
- **Auth:** Better Auth runs inside this Next app (`lib/auth.ts`, handler at `app/api/auth/[...all]/route.ts`), MongoDB adapter, email/password + Google OAuth, `jwt()` plugin. The client obtains a JWT from Better Auth and sends it as `Authorization: Bearer <token>` to Express; Express verifies it (JWKS from Better Auth) in a **JWT verification middleware** (challenge requirement), then checks role and `isBlocked` from the DB.
- **Role verification must happen on the server for every protected API.** Client-side route guards / hidden links are UX only.
- **Payments:** Express creates a Stripe Checkout session → Stripe redirects to `/payment/success` or `/payment/cancel` on this client. **Only a verified Stripe webhook** (on Express, signature-checked) may set `paymentStatus: "paid"` and insert the transaction. The success page must never mark anything paid itself; it only displays/refetches status.
- **Images:** ImgBB. Service image = file upload only (not URL). Profile image = upload or URL. The ImgBB key must not be exposed to the browser. Only `lib/imgbb.ts` (`server-only`) reads `IMGBB_API_KEY`, and only `app/api/upload/route.ts` calls it. That route requires same-origin + a signed-in, non-blocked user + a `purpose` (`profile` any user, `service` admin only), and it rate-limits per user. The client uses `uploadImage(file, purpose)` from `lib/upload-image.ts`. Sign-up uploads the photo *after* `signUp.email` (then `updateUser`), so there are no anonymous uploads. Never add an ImgBB `expiration` (images would be deleted).

### Stack in this repo
Next.js 16.4 (App Router, `proxy.ts` replaces `middleware.ts`), React 19.3, TypeScript, Tailwind v4 (`app/globals.css`), shadcn/ui (`base-vega` style on `@base-ui/react`, components in `components/ui/`), daisyUI, lucide-react, recharts, date-fns, react-hot-toast, next-themes. Path alias `@/*`.

Scripts: `npm run dev | build | start | lint | typecheck | format`.

## Data model (MongoDB — exactly these four main collections)

- `user` (Better Auth managed): `name, email, image, role ("customer" | "admin"), isBlocked (bool)`, optionally `phone`. `role`/`isBlocked` must be Better Auth `additionalFields` with `input: false` so sign-up and profile updates can't set them. Default role `customer`. Admin is assigned manually in the DB / via a seed script — never via public registration.
- `services`: `serviceName, category, description, price (>0), duration (minutes, >0), image, status ("active" | "inactive", default active), createdAt`
- `appointments`: `serviceId, customerId, appointmentDate, timeSlot, message, servicePrice, paymentStatus ("unpaid" | "paid", default unpaid), status ("pending" | "confirmed" | "cancelled", default pending), createdAt`
- `transactions`: `appointmentId, customerId, amount, currency, stripeSessionId, status ("paid" | "failed"), createdAt`

Categories: Haircut & Styling, Hair Coloring, Hair Treatment, Facial & Skincare, Makeup, Manicure & Pedicure, Spa & Massage.

## API contract (Express ↔ client)

Base URL: `NEXT_PUBLIC_API_URL` (no trailing slash), **including `/api`**, e.g. `http://localhost:5000/api`. All Express routes are mounted under `/api`, so the paths below are relative to it. Fetch helpers live in `lib/api.ts`; types/interfaces live in `app/components/types/` (e.g. `service.ts`). Put new shared types there, not in `lib/`. List endpoints may return a bare array or `{ data: [...] }`.

`GET /services` query params (all optional): `status=active`, `search` (case-insensitive match on `serviceName`), `category` (exact), `sort` = `newest` (default) | `price-asc` | `price-desc` | `duration-asc` | `duration-desc`, `limit`. The client re-applies filter/sort defensively (`lib/service-filters.ts`).

- `GET /services?status=active&search=&category=&sort=` (public): Browse Services page (`getBrowseServices`). Filters come from the page URL. Pagination (`?page=`, `?perPage=` 9 | 15 | 30, default 9) is applied in Next after fetching (`paginate` from `lib/pagination.ts`, re-exported by `lib/service-filters.ts`), so the API doesn't support it. The server ignores `status=` and always returns active services only; an unknown `category`/`sort` or a bad `limit` is a 400 (the client sanitizes the URL first, so this can't happen). `limit` is capped at 100; no `limit` = all.

- `GET /services?status=active&limit=6` (public): active services for the home page Featured section (`getFeaturedServices`, cached 60s, tag `services`).
- `GET /services?status=active&limit=15&sort=newest` (public): newest active services first (by `createdAt` desc), for the home page New Arrivals section (`getNewestServices`). The client also sorts defensively.
- `GET /services/:id` (public): one service (active or inactive) for the details page (`getServiceById`). 404 for unknown ids; malformed ids never reach the API.
- `POST /appointments` (**customer only**): body `{ serviceId, appointmentDate: "YYYY-MM-DD", timeSlot: "HH:mm", message? }` (types in `app/components/types/appointment.ts`). The server takes `customerId` from the JWT and `servicePrice` from the service, and sets `status: "pending"`, `paymentStatus: "unpaid"`. Responses: 201 `{ data: appointment }`, 400 (validation / inactive service), 401 (no or invalid token), 403 (admin or blocked user), 409 in two cases: that **service** already has a pending/confirmed appointment at that date + slot (also enforced by a unique partial index), or the **customer** already has one at that date + slot (any service). The server also rejects past dates (1-day time-zone allowance), dates > 60 days ahead (`BOOKING_WINDOW_DAYS`) and Sunday slots after 15:00, mirroring `lib/booking.ts`. Errors use `{ message }`, which is shown to the user. **Known gap:** `BookingForm.tsx` shows a hardcoded "Someone has already booked that time" for every 409 instead of the server's message.

**Authenticated requests** (`lib/api-client.ts`, browser only) send `Authorization: Bearer <JWT>` from `authClient.token()` (Better Auth `jwt` plugin). Express verifies it against the JWKS at `${BETTER_AUTH_URL}/api/auth/jwks`, then loads the user to check `role` and `isBlocked`. Express CORS must allow the client origin and the `Authorization` header.

**Route protection:** `proxy.ts` only checks that a session cookie exists on `/services/:id`, `/dashboard/*` and `/payment/*` (otherwise → `/sign-in?redirect=…`). It must **not** make role decisions: the cookie cache can hold a stale role, which caused an infinite redirect loop between dashboards. All server-side session reads use `getCurrentSession`/`requireRole` from `lib/session.ts` (DB, cookie cache bypassed), never `auth.api.getSession` directly. The cookie cache is 5 minutes (`lib/auth.ts`) and only affects client-side `useSession` (navbar).

- `GET /services/categories` (public): `[{ category, count }]`, the number of **active** services per category, for the home page Categories section (`getCategoryCounts`, cached 60s, tag `services`). Categories with 0 active services may be omitted.

**Dashboard endpoints.** All require a JWT. Express must check the role from the DB user (not from the request body) and reject blocked users with 403. Types are in `app/components/types/`.

Customer (only ever the caller's own records):
- `GET /appointments/me` → `AppointmentWithService[]` (`service` populated: `_id, serviceName, category, image, price`; `null` if deleted).
- `PATCH /appointments/:id/cancel`: only the owner (someone else's id → 404), only while `pending`; 409 otherwise.
- `GET /transactions/me` → `TransactionDetails[]` (payment history). Each item must include populated `service` (summary), `customer` and the appointment's `appointmentDate`, not just the stored transaction fields.
- `POST /payments/checkout-session` `{ appointmentId }` → `{ url }`: only the owner, only `confirmed` + `unpaid`. Creates a Stripe Checkout session (success → `${CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`, cancel → `/payment/cancel`). **Only the verified Stripe webhook** (`checkout.session.completed`, signature-checked) may set `paymentStatus: "paid"` and insert the `transactions` record. The amount always comes from the stored appointment; the webhook also checks metadata (`appointmentId`, `customerId`, `client_reference_id`), amount and currency, and is idempotent per session id.
- `GET /payments/checkout-session/:sessionId` → `CheckoutSessionStatus` (`app/components/types/payment.ts`): read-only, only the session's own customer (404 otherwise). Used by `/payment/success`, which shows "paid" only when the DB says so (appointment paid + transaction saved) and polls while the webhook is pending. `/payment/cancel?appointment_id=` offers "Try again" (`PayNowButton`) if the appointment is still confirmed + unpaid. Both pages call `requireRole("customer", …)`.

Admin (403 for everyone else):
- `GET /admin/stats` → `AdminStats` (customers, active services, total/pending/confirmed appointments, successful payments).
- `GET /admin/services` → `Service[]` including inactive. `POST /services`, `PATCH /services/:id` (partial `ServiceInput`), `DELETE /services/:id` (→ `{ _id }`). Validate price > 0 and duration > 0 (whole minutes ≤ 720), name 3–80, description 20–1000. `image` must be an `https` URL on `i.ibb.co` or `images.unsplash.com` (the hosts in `next.config` `remotePatterns`). Mongoose validation errors return `{ message: "Some fields are invalid.", errors: { field: msg } }`; the client only shows `message`.
- `GET /admin/appointments[?status=&limit=]` → `AppointmentDetails[]` (service + customer populated: `name, email, image, phone`), newest first; `limit` 1–100, none = all. `PATCH /admin/appointments/:id/status` `{ status: "confirmed" | "cancelled" }`: confirm only from `pending`; cancel from `pending` or `confirmed`. Never accepts `paymentStatus`. Invalid transitions → 409. Cancelling a paid confirmed appointment is allowed (no automatic refund).
- `GET /admin/users` → `UserAccount[]`: **customers only** (admins are excluded), newest first, each with `appointmentCount`. `PATCH /admin/users/:id/block` `{ isBlocked: boolean }`: never on admins (403), returns the updated `UserAccount`. When blocking, also delete the user's Better Auth `session` documents so they're signed out.
- `GET /admin/transactions` → `TransactionDetails[]`. Read-only; there are no admin write endpoints for transactions.

Profile updates don't go through Express: `ProfileForm` uses Better Auth `updateUser` (name, image, phone), and `role`/`isBlocked` are `input: false`. Passwords: `PasswordForm` (both profile pages) uses `changePassword` (current password required, optional sign-out of other devices) for email/password accounts, and the `setAccountPassword` Server Action (`app/(main)/dashboard/password-actions.ts`, wraps server-only `auth.api.setPassword`) to add a first password to Google-only accounts. `hasPasswordSignIn()` in `lib/session.ts` decides which form shows. The sign-up password rules are enforced server-side for `/change-password` too (hook in `lib/auth.ts`).

**Next-side guards** (`lib/session.ts`): every dashboard page calls `requireRole(role, path)`, which reads the session from the DB (`disableCookieCache`). Server Actions use `assertRole`. Layouts alone are not enough, because they don't re-run on client navigation. **Blocked users** are always *redirected* to `/account-blocked` (`BLOCKED_PATH`, a standalone page outside the dashboard layout) by `requireActiveUser`/`requireRole` and the service details page. Never show the blocked notice from inside the dashboard layout: on client navigation the old layout stays and the page area goes blank.

## Business rules (enforce on server; mirror in UI)

- Only authenticated, non-blocked **customers** can book; admins cannot book.
- Only **active** services are listed publicly and bookable.
- No duplicate active (pending/confirmed) appointment for the same date + time slot.
- Customer: sees only their own appointments; may cancel only their own **pending** ones; may pay only **confirmed + unpaid** ones.
- Admin: may confirm only **pending**; may cancel pending or confirmed; cannot manually edit payment records.
- Profile update: name, image, phone only — never role / isBlocked / another user's profile.
- Blocked users lose access to all protected features (server rejects; client signs out/redirects).
- Sign-up password: ≥6 chars, ≥1 uppercase, ≥1 lowercase.

## Pages / routes

Navbar: logo "SalonBook". Public: Home, Browse Services, Sign In, Sign Up. Authenticated: Home, (Service details), Dashboard (role-based). Profile dropdown: name, Dashboard, Logout. **Navbar must update immediately on auth change** (use `useSession`).

Footer: logo + short description, nav links, contact info, address + opening hours, social links, copyright.

| Route | Access | Notes |
|---|---|---|
| `/` | public | Banner (title, description, "Explore Salon Services" CTA, salon background image); Featured services (≥6 active from DB); Categories (link to filtered browse); +1 extra section of our own |
| `/services` | public | Active services cards; search by name, filter by category, sort by price; loading state |
| `/services/[id]` | private → redirect to sign-in | Details + booking form (date, predefined time slot, optional message). Invalid id → proper error |
| `/signin`, `/signup` | public | Credential + Google; toasts; role-based redirect after login |
| `/dashboard/...` customer | customer only | Overview (total/pending/confirmed/cancelled), My Appointments (table with status + payment badges, details, cancel, Pay Now), My Profile |
| `/dashboard/...` admin | admin only | Overview (customers, active services, total/pending/confirmed appointments, successful payments), Manage Services, Add/Update Service, Manage Appointments, Manage Users (view, block/unblock), Transactions, My Profile |
| `/payment/success`, `/payment/cancel` | private | Post-Stripe pages |
| `/about-us` | public | How the site works (SEO): static, metadata + canonical + Open Graph, `BeautySalon` and `FAQPage` JSON-LD, FAQ in native `<details>`. Linked from navbar and footer. `metadataBase` comes from `NEXT_PUBLIC_APP_URL` (root layout) |
| `not-found`, `error` | — | Custom pages |

Card data (home + browse): image, name, category, price, duration, short description, View Details button.

Users must not reach another role's dashboard by editing the URL. Dashboard = separate layout with sidebar + main content, responsive, stat cards, tables.

**Pagination & filters (client-side, URL-driven).** Lists are fetched whole and paginated in Next with `paginate`/`parsePageParam`/`parsePerPageParam` from `lib/pagination.ts`. Page and filters live in the URL (`?page=`, `?perPage=`, `?status=`, …) so reloads and back/forward work; changing any filter/tab/page size resets to page 1 and keeps the other params. Changing page scrolls the list's `<section id=…>` (which has `scroll-mt-24` for the sticky navbar) into view via `scrollToSection`. Components: `app/components/shared/PaginationBar.tsx` (presentational Previous/1…n/Next, used by Browse Services and the dashboard) and `app/components/dashboard/DashboardPagination.tsx` ("Showing a–b of n" + bar + optional "Show [n] per page"; it reads/updates the current URL with `useSearchParams`). Page sizes:

| Panel | Per page | Section id |
|---|---|---|
| Browse Services | 9 (choose 9 / 15 / 30) | `service-results` |
| Admin overview, pending requests | 5 | `pending-requests` |
| Admin Manage Appointments | 12 | `appointments-list` |
| Admin Manage Users | 12 | `users-list` |
| Admin Transactions | 12 | `transactions-list` |
| Admin Manage Services | 10 (choose 10 / 20 / 30 / 40) | `services-list` |

Admin Manage Services also reuses the Browse Services toolbar (`app/services/ServicesToolbar.tsx`: search, sort, category pills) together with its All/Active/Inactive `StatusTabs`. The toolbar takes `preserveParams` (keeps `status`/`perPage`) and `StatusTabs` takes `query` (keeps search/category/sort/perPage), so neither resets the other. Tab counts reflect the current search/category. Browse's own `perPage` is pinned to its default there, so it never leaks into the admin URL.

## UX requirements

- Toasts for all success/error feedback (never `alert()`); confirmation dialogs for destructive actions.
- Loaders while fetching services, loading dashboard data, creating appointments, processing payments.
- Error handling for: invalid routes, failed API calls, invalid forms, unauthorized access, failed image upload, booking conflicts, failed/cancelled payments.
- Fully responsive (mobile/tablet/desktop), professional salon theme, consistent spacing/typography/color, reusable components, minimal animation. Inspiration only (don't copy): Fresha, Booksy, Vagaro.

## Deployment / production

- No CORS, 404, or 504 errors; reloading any route works; private routes and sessions survive refresh.
- Stripe checkout + webhook must work on the live site; provided admin credentials must work.
- `trustedOrigins` / CORS / Better Auth base URL must come from env so localhost and prod both work.

## Environment variables (names only — never commit values)

`.env*` is gitignored; never commit secrets or print them. Client-side code may only read `NEXT_PUBLIC_*` vars.

Client (current + expected): `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_DB_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_API_URL` (Express base URL), `NEXT_PUBLIC_APP_URL`, `IMGBB_API_KEY`.
Server (`Server/`, its own git repo, ignored by the client repo, tsconfig and ESLint): `PORT`, `NODE_ENV`, `MONGODB_URI`, `DB_NAME` (`SalonBook`), `CLIENT_URL` (comma-separated CORS origins), `BETTER_AUTH_URL` (for JWKS), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `CURRENCY`. Env var names are documented in `Server/README.md` (there is no `.env.example`).

README (both repos) must have: name + description, features, tech stack, install steps, run locally, env var names, live link, both repo links.

## Express server (`Server/`) — build status (as of 2026-11-21)

`Server/` is a **staging copy**: the user copies each step into their real repo (`C:\Users\TradeOne\Desktop\SalonBook-Server`) and commits it there, to show ≥12 meaningful server commits. Build it **one step at a time, only when the user says "do step N"**, and finish each step with the file list plus a suggested commit message. Never commit. All 12 planned steps are done.

Stack: Express 5 + TypeScript 5.9 (NodeNext, `.js` import suffixes), mongoose 9 (use `returnDocument: "after"`, not `new: true`), jose JWKS verification, tsx for dev. Vercel zero-config: the entry is `src/index.ts` and it default-exports the app, and no file may be named `app.ts`/`server.ts` (Vercel would pick it). Local dev uses `src/dev.ts` (`npm run dev`, port 5000). `connectDB` runs per request (cached). The JSON parser skips `/api/payments/webhook` (raw body for Stripe). Responses are `{ success, data }` / `{ success: false, message, errors? }`. Auth: `verifyJWT` (EdDSA, iss = aud = `BETTER_AUTH_URL`), then `requireRole` loads the user from the DB. Use `...customerOnly` / `...adminOnly` on routes.

| Step | Commit | Status |
|---|---|---|
| 1 | Boilerplate | done |
| 2 | Env, DB connection, error handling | done |
| 3 | Endpoint stubs (501) | done |
| 4 | Models (User = Better Auth `user`, Service, Appointment, Transaction) | done |
| 5 | Public service endpoints | done |
| 6 | JWT middleware (`verifyJWT`) | done |
| 7 | Role / blocked authorization (`requireRole`) | done |
| 8 | Admin service CRUD + `seed/services.json` | done |
| 9 | Customer appointments (create, my list, cancel) | done |
| 10 | Admin appointments (confirm/cancel) + users (list, block/unblock + delete sessions) | done; the real block/session-deletion path is untested (see below) |
| 11 | Stripe Checkout + verified webhook (only place that sets `paid` and creates the transaction) + session status endpoint | done (tested in-process with signed fake events); real keys still missing from `Server/.env` |
| 12 | `/admin/stats`, `/transactions/me`, `/admin/transactions`, final README | done (tested in-process). README live API link is still _TBD_ |

Planned for later: make the validation-error `message` name the first invalid field (client toasts only show `message`).

**Seed data:** `Server/seed/services.json` has 38 services (MongoDB Extended JSON; 35 active, 3 inactive; Unsplash images, all checked to load). The user imports it themselves (Compass or `mongoimport`); never insert it for them.

**Testing rules (user-approved, 2026-11):**
- Test in-process or on ports 5055/5066. Port 5000 and 3000 are the user's own running server and client: only send read-only GETs there.
- Use a fake JWKS (own Ed25519 key) and an in-memory stub for `User.findById`.
- Writing `[TEST]` services/appointments to the real DB is OK if they're deleted in `finally` and leftovers are counted.
- **Never write to the real `user` or `session` collections.** The permission checker blocked this, and the user doesn't want test accounts created.
- Never print secrets or `.env` values; check env files with booleans/shapes only.
- In the DB, `session.userId` is an ObjectId. As of 2026-11-20 the only accounts were 2 admins.

## Current state / known leftovers (as of 2026-11-20)

The repo was bootstrapped from a previous template ("HireLoop"). Fix these as work proceeds:
- `README.md` is still the template README.
- Footer contact info and social links in `lib/site.ts` are placeholders.
- On 2026-11-21 the saved client `.env` had no `NEXT_PUBLIC_API_URL` line (only `Server/.env` did), though the user says it's set. If API calls fail with "unavailable", check the root `.env` first: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`, then restart `next dev`.
- `npm run lint` has 3 pre-existing problems in files we didn't write (`components/ui/carousel.tsx`, `hooks/use-mobile.ts`: set-state-in-effect; `app/layout.tsx`: unused `Geist`).

## Working conventions

- Read the relevant doc in `node_modules/next/dist/docs/` before using a Next API (e.g. `proxy.ts`, async `params`/`searchParams`, caching).
- Prefer Server Components; add `"use client"` only where interactivity/hooks are needed.
- **Colors:** the only place colors are defined is `:root` (light) and `.dark` (dark) in `app/globals.css`. next-themes toggles `.dark` on `<html>`. daisyUI has a single theme (`salonbook`) whose tokens are `var(...)` references to those variables. Never hardcode hex values in components or add a daisyUI theme with `--prefersdark`/`data-theme` (it would follow the OS instead of the toggle). Use tokens: `primary`, `secondary`, `accent`, `muted`, `destructive`, `success`, `warning`, `info`, `gold`, `chart-1..5`. To add a color, define it in both `:root` and `.dark`, then map it in `@theme inline`.
- Reuse `components/ui/*` (shadcn) before writing new primitives. Shared app components go in `app/components/` (or `components/`), skeletons in `app/components/skeletons/`. Every admin and customer dashboard page has its own `loading.tsx` that mirrors the loaded page, built from `app/components/skeletons/DashboardSkeletons.tsx` (page header, status tabs, table card with the real column headers and responsive classes, pagination), `FormSkeletons.tsx` (service, profile, password forms) and `ServicesToolbarSkeleton.tsx`. Static text (titles, column headers, tab and stat labels) is rendered for real; only data pulses. When a page layout changes, update its `loading.tsx` too. The generic `dashboard/loading.tsx` only covers the `/dashboard` redirect. The dashboard layout reads the session inside its own `<Suspense>` with `DashboardShellSkeleton` (sidebar + content), because a `loading.tsx` can't cover its own layout's await. The home page needs no `loading.tsx` (each section streams behind its own skeleton), and `/about-us` is static. `/account-blocked` has a `loading.tsx` that mirrors the `BlockedNotice` card without the "blocked" text (non-blocked users are redirected and must not see it flash). The payment pages use `PaymentCardSkeleton` (`app/(payment)/payment/`), which mirrors `PaymentCard` and uses `DetailsListSkeleton`.
- Keep commits small and meaningful (they're graded); don't commit unless asked.
- **SEO:** helpers live in `lib/seo.ts`. The root layout sets the title template (`%s | SalonBook`), so page titles must not repeat "| SalonBook". Public pages build metadata with `pageMetadata({ title, description, path })`, because child `openGraph`/`twitter` objects replace the parent's instead of merging. Private areas use `robots: NO_INDEX`. Structured data goes through `app/components/shared/JsonLd.tsx`. `app/robots.ts`, `app/sitemap.ts` and `app/manifest.ts` are generated, and absolute URLs come from `NEXT_PUBLIC_APP_URL`, so it must be set to the live URL in production.
- Run `npm run typecheck` and `npm run lint` before declaring work done.
