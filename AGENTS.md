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
- **Images:** ImgBB. Service image = file upload only (not URL). Profile image = upload or URL. The ImgBB key must not be exposed to the browser — upload via a server route (Next route handler or Express).

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

- `GET /services?status=active&search=&category=&sort=` (public): Browse Services page (`getBrowseServices`). Filters come from the page URL. Pagination (`?page=`, `?perPage=` 9 | 15 | 30, default 9) is currently applied in Next after fetching (`paginate` in `lib/service-filters.ts`), so the API doesn't need to support it yet.

- `GET /services?status=active&limit=6` (public): active services for the home page Featured section (`getFeaturedServices`, cached 60s, tag `services`).
- `GET /services?status=active&limit=15&sort=newest` (public): newest active services first (by `createdAt` desc), for the home page New Arrivals section (`getNewestServices`). The client also sorts defensively.
- `GET /services/:id` (public): one service (active or inactive) for the details page (`getServiceById`). 404 for unknown ids; malformed ids never reach the API.
- `POST /appointments` (**customer only**): body `{ serviceId, appointmentDate: "YYYY-MM-DD", timeSlot: "HH:mm", message? }` (types in `app/components/types/appointment.ts`). The server takes `customerId` from the JWT and `servicePrice` from the service, and sets `status: "pending"`, `paymentStatus: "unpaid"`. Responses: 201 `{ data: appointment }`, 400 (validation / inactive service), 401 (no or invalid token), 403 (admin or blocked user), 409 (an active appointment already exists for that date + slot). Errors use `{ message }`, which is shown to the user.

**Authenticated requests** (`lib/api-client.ts`, browser only) send `Authorization: Bearer <JWT>` from `authClient.token()` (Better Auth `jwt` plugin). Express verifies it against the JWKS at `${BETTER_AUTH_URL}/api/auth/jwks`, then loads the user to check `role` and `isBlocked`. Express CORS must allow the client origin and the `Authorization` header.

**Route protection:** `proxy.ts` only checks that a session cookie exists on `/services/:id`, `/dashboard/*` and `/payment/*` (otherwise → `/sign-in?redirect=…`). It must **not** make role decisions: the cookie cache can hold a stale role, which caused an infinite redirect loop between dashboards. All server-side session reads use `getCurrentSession`/`requireRole` from `lib/session.ts` (DB, cookie cache bypassed), never `auth.api.getSession` directly. The cookie cache is 5 minutes (`lib/auth.ts`) and only affects client-side `useSession` (navbar).

- `GET /services/categories` (public): `[{ category, count }]`, the number of **active** services per category, for the home page Categories section (`getCategoryCounts`, cached 60s, tag `services`). Categories with 0 active services may be omitted.

**Dashboard endpoints.** All require a JWT. Express must check the role from the DB user (not from the request body) and reject blocked users with 403. Types are in `app/components/types/`.

Customer (only ever the caller's own records):
- `GET /appointments/me` → `AppointmentWithService[]` (`service` populated: `_id, serviceName, category, image, price`; `null` if deleted).
- `PATCH /appointments/:id/cancel`: only the owner, only while `pending`; 409 otherwise.
- `GET /transactions/me` → `TransactionDetails[]` (payment history).
- `POST /payments/checkout-session` `{ appointmentId }` → `{ url }`: only the owner, only `confirmed` + `unpaid`. Creates a Stripe Checkout session (success → `${CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`, cancel → `/payment/cancel`). **Only the verified Stripe webhook** (`checkout.session.completed`, signature-checked) may set `paymentStatus: "paid"` and insert the `transactions` record.

Admin (403 for everyone else):
- `GET /admin/stats` → `AdminStats` (customers, active services, total/pending/confirmed appointments, successful payments).
- `GET /admin/services` → `Service[]` including inactive. `POST /services`, `PATCH /services/:id` (partial `ServiceInput`), `DELETE /services/:id`. Validate price > 0 and duration > 0.
- `GET /admin/appointments[?status=&limit=]` → `AppointmentDetails[]` (service + customer populated). `PATCH /admin/appointments/:id/status` `{ status: "confirmed" | "cancelled" }`: confirm only from `pending`; cancel from `pending` or `confirmed`. Never accepts `paymentStatus`.
- `GET /admin/users` → `UserAccount[]`. `PATCH /admin/users/:id/block` `{ isBlocked }`: never on admins. When blocking, also delete the user's Better Auth `session` documents so they're signed out.
- `GET /admin/transactions` → `TransactionDetails[]`. Read-only; there are no admin write endpoints for transactions.

Profile updates don't go through Express: `ProfileForm` uses Better Auth `updateUser` (name, image, phone), and `role`/`isBlocked` are `input: false`.

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
| `not-found`, `error` | — | Custom pages |

Card data (home + browse): image, name, category, price, duration, short description, View Details button.

Users must not reach another role's dashboard by editing the URL. Dashboard = separate layout with sidebar + main content, responsive, stat cards, tables.

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

## Current state / known leftovers (as of 2026-11-20)

The repo was bootstrapped from a previous template ("HireLoop"). Fix these as work proceeds:
- `package.json` name is still `HireLoop-Client`. (The auth DB is now `"SalonBook"`; the Express server must use the same database.)
- `README.md` is still the template README.
- Footer contact info and social links in `lib/site.ts` are placeholders.
- `/payment/success` and `/payment/cancel` pages (Stripe redirects) are not built yet.

## Working conventions

- Read the relevant doc in `node_modules/next/dist/docs/` before using a Next API (e.g. `proxy.ts`, async `params`/`searchParams`, caching).
- Prefer Server Components; add `"use client"` only where interactivity/hooks are needed.
- **Colors:** the only place colors are defined is `:root` (light) and `.dark` (dark) in `app/globals.css`. next-themes toggles `.dark` on `<html>`. daisyUI has a single theme (`salonbook`) whose tokens are `var(...)` references to those variables. Never hardcode hex values in components or add a daisyUI theme with `--prefersdark`/`data-theme` (it would follow the OS instead of the toggle). Use tokens: `primary`, `secondary`, `accent`, `muted`, `destructive`, `success`, `warning`, `info`, `gold`, `chart-1..5`. To add a color, define it in both `:root` and `.dark`, then map it in `@theme inline`.
- Reuse `components/ui/*` (shadcn) before writing new primitives. Shared app components go in `app/components/` (or `components/`), skeletons in `app/components/skeletons/`.
- Keep commits small and meaningful (they're graded); don't commit unless asked.
- Run `npm run typecheck` and `npm run lint` before declaring work done.
