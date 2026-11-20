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
Server (other repo): `MONGODB_URI`, `CLIENT_URL`, `BETTER_AUTH_URL` (for JWKS), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PORT`.

README (both repos) must have: name + description, features, tech stack, install steps, run locally, env var names, live link, both repo links.

## Current state / known leftovers (as of 2026-11-20)

The repo was bootstrapped from a previous template ("HireLoop"). Fix these as work proceeds:
- `package.json` name is `HireLoop-Client`; `lib/auth.ts` uses DB name `"HireLoop"` → rename to SalonBook.
- `app/layout.tsx` imports `./components/shared/Navbar`, which doesn't exist yet (build fails until it's created). `app/components/shared` and `app/components/skeletons` are empty.
- `app/page.tsx` is still the shadcn placeholder; `README.md` is the template README.
- `lib/auth-client.ts` reads `process.env.BETTER_AUTH_URL` in browser code (undefined there) — use `NEXT_PUBLIC_APP_URL` or omit for same-origin.
- `lib/auth.ts` hardcodes `trustedOrigins: ["http://localhost:3000"]` and has no `role`/`isBlocked` additionalFields yet.
- No `proxy.ts` route protection yet.

## Working conventions

- Read the relevant doc in `node_modules/next/dist/docs/` before using a Next API (e.g. `proxy.ts`, async `params`/`searchParams`, caching).
- Prefer Server Components; add `"use client"` only where interactivity/hooks are needed.
- Reuse `components/ui/*` (shadcn) before writing new primitives. Shared app components go in `app/components/` (or `components/`), skeletons in `app/components/skeletons/`.
- Keep commits small and meaningful (they're graded); don't commit unless asked.
- Run `npm run typecheck` and `npm run lint` before declaring work done.
