# SalonBook — Client

**SalonBook** is a salon appointment booking platform. Customers browse salon services, request an appointment for a date and time slot, follow its status, and pay for confirmed appointments with Stripe. The salon admin manages services, confirms or cancels appointment requests, manages customers and reviews payment transactions.

This repository is the **client**: a Next.js (App Router) app that also hosts authentication (Better Auth). The REST API is a separate Express + MongoDB server.

| | Link |
|---|---|
| Live website | https://ph-a9.vercel.app/ |
| Client repository | https://github.com/RoaringMaelstrom/ph-a9 |
| Server repository | https://github.com/RoaringMaelstrom/ph_a9_server |

---

## Important features

### Customers
- **Browse services** (public): active services only, in a responsive card grid (image, name, category, price, duration, short description, View Details).
- **Search, filter and sort**: search by service name, filter by category, sort by price (low→high, high→low), duration or newest. All filters live in the URL, so reloads, shared links and back/forward keep them.
- **Service details** (`/services/[id]`, sign-in required): full information plus a booking form with a date picker, a predefined list of time slots and an optional message. Invalid or unknown ids show a proper error page.
- **Appointment requests** are saved as *Pending* / *Unpaid*. Booking rules: only active services, no past dates, bookings up to 60 days ahead, no late Sunday slots, and no double bookings. A service can't be booked twice for the same slot, and a customer can't book two appointments at the same time. Conflicts are shown as toasts.
- **Customer dashboard**:
  - **Overview** with total / pending / confirmed / cancelled counts.
  - **My Appointments** table with status and payment badges and a details dialog. You can cancel pending requests (with a confirmation dialog) and use **Pay Now** on confirmed + unpaid ones.
  - **Payment history.**
  - **My Profile.**
- **Stripe payments**: Pay Now opens Stripe Checkout. The success page shows "paid" only after the server has received the **verified Stripe webhook**, and keeps checking while it's on its way. The cancel page offers "Try again".

### Admin
- **Overview**: registered customers, active services, total / pending / confirmed appointments, successful payments, and a list of pending requests to act on.
- **Manage Services**: view all services (active and inactive) with search, category filter, sort, All/Active/Inactive tabs and pagination. Add, update, delete (with confirmation) and activate/deactivate services. Service images are **uploaded** to ImgBB (file upload, not a URL). Validation: price > 0, duration > 0.
- **Manage Appointments**: all requests with customer, service, date/time, message, price, status, payment status and request date, filterable by status. Confirm only *pending* requests; cancel *pending* or *confirmed* ones.
- **Manage Users**: all registered customers with appointment counts, a details dialog, and **block / unblock**. Blocking also signs the user out everywhere.
- **Transactions**: customer, service, appointment date, amount, currency, a shortened Stripe session id, status and date. Read-only: admins can't edit payment records.

### Authentication and security
- **Better Auth** with email/password and **Google** sign-in. Sign-up asks for full name, email, password and a profile image (upload or URL). Password rule: at least 6 characters with an uppercase and a lowercase letter, enforced on the server too.
- **Role-based redirect** after sign-in. A new account is always a *customer*: `role` and `isBlocked` can't be set by sign-up or profile updates. Admin access is assigned directly in the database.
- **Protected routes**:
  - `proxy.ts` sends visitors without a session to `/sign-in?redirect=…`.
  - Every dashboard page checks the role **from the database**, so a customer can't open the admin dashboard by editing the URL, and vice versa.
  - Blocked users are redirected to an "account blocked" page.
- **Server-side verification**: the client sends a Better Auth **JWT** (`Authorization: Bearer …`) to Express. Express verifies it with a **JWT middleware** (JWKS), then checks the role and blocked status from the database on every protected API.
- **Secrets stay on the server**, and no secret uses a `NEXT_PUBLIC_` name. The ImgBB key is read only in a `server-only` module (`lib/imgbb.ts`), at the moment of an upload. The upload route (`/api/upload`) accepts only same-origin requests from signed-in, non-blocked users. Profile photos are allowed for any user, service images for admins only. It rate-limits each user, and it checks the file's real type and size. Sign-up creates the account first and then uploads the photo, so there are never anonymous uploads.

### UI / UX
- Responsive layouts for mobile, tablet and desktop, with a salon-themed design, a navbar, a footer and a dashboard with a sidebar.
- The navbar updates immediately on sign-in/out (`useSession`). The profile dropdown shows your name, Dashboard and Logout.
- Toast notifications for all success and error feedback (no `alert()`), and confirmation dialogs for destructive actions.
- Loading states everywhere data is fetched (skeletons that mirror each page), plus loaders while booking and processing payments.
- Error handling for invalid routes (custom 404), failed API requests, invalid forms, unauthorized access, failed image uploads, booking conflicts and failed or cancelled payments.

---

## Extra features (beyond the requirements)

- **New Arrivals section** on the home page: the newest active services in a paged carousel. This is the required "extra section of our own".
- **About Us page** (`/about-us`): how booking works, service categories, why SalonBook, opening hours and an FAQ. It's built for search engines (see [SEO](#seo-optimizations)) and linked from the navbar and footer.
- **Light / dark theme toggle** (next-themes). All colors come from one set of theme tokens, so every page, including the dashboards, switches consistently.
- **URL-driven pagination** on Browse Services (9 / 15 / 30 per page) and on every admin table. Page and filters are kept in the URL, and changing page scrolls back to the list.
- **Category counts** on the home page categories (number of active services per category).
- **Booking guards in the UI** mirror the server: past dates, dates beyond 60 days and Sunday slots after closing are disabled in the form.
- **Password management** on both profile pages: change your password (optionally signing out other devices), or add a first password to a Google-only account.
- **Account blocked page**: a clear, dedicated notice instead of a blank or broken dashboard.
- **Matching skeleton loaders** for every dashboard, payment and auth page. Static text is rendered for real and only the data pulses, so there's no layout jump.
- **Payment status polling**: the success page waits for the webhook instead of assuming the payment worked.
- **SEO optimizations**: see the next section.

---

## SEO optimizations

All SEO code lives in `lib/seo.ts` and uses Next.js's built-in Metadata API and metadata files. Everything is rendered on the server, so crawlers get complete HTML without running JavaScript.

### What was done and why

| What | How | Why |
|---|---|---|
| **Unique titles everywhere** | The root layout sets a title template (`%s \| SalonBook`) and a default. Each page sets only its own part, e.g. *"Hair Coloring Services \| SalonBook"*. The home page uses the full title *"SalonBook \| Book Salon Appointments Online"*. | The title is the strongest on-page ranking signal and is what users see in results. Before this change the home page had no title at all. |
| **Meta descriptions** | Written for each public page. Service pages build theirs from name, price, duration and description, trimmed to ~155 characters at a word boundary. | Descriptions become the snippet under the result. A clear, specific snippet improves click-through. |
| **Canonical URLs** | `alternates.canonical` on every public page. On Browse Services, the canonical is `/services` or `/services?category=…`; `?page=`, `?sort=` and `?perPage=` variants all point back to it. The auth pages strip `?redirect=`. | Filters and pagination create many URLs with the same content. Canonicals tell search engines which one to rank, so ranking signals aren't split across duplicates. |
| **`noindex` where it makes sense** | Search-result pages (`?search=`) are `noindex, follow`. The dashboard, payment and account-blocked pages, and inactive services, are `noindex`. | Search results are thin, endless pages, and private pages are useless (and redirect) for visitors from Google. Keeping them out focuses crawling on pages that should rank. |
| **Category landing pages** | `?category=` views get their own title, description and canonical, and are listed in the sitemap. | People search for "hair coloring" or "manicure", not "browse services". Each category becomes a page that can rank for that intent. |
| **Open Graph and Twitter cards** | Every public page has `og:title`, `og:description`, `og:url`, `og:image` (1200×630) and a `summary_large_image` card. Service pages use the service's own photo. | Links shared on Facebook, WhatsApp, X, Slack and similar apps show a rich preview instead of a bare URL. The `pageMetadata()` helper builds these for every page, because Next *replaces* (doesn't merge) a parent's `openGraph` when a page sets its own, which would otherwise drop the site name and image. |
| **Structured data (JSON-LD)** | `BeautySalon` (name, address, phone, opening hours, service catalog) on Home and About Us; `WebSite` with a `SearchAction` on Home; `FAQPage` on About Us; `Service` + `Offer` (price, currency, availability) on service pages; `BreadcrumbList` on About Us and service pages. Rendered by `app/components/shared/JsonLd.tsx`, with `<` escaped to prevent script injection. | Structured data lets Google understand the business and show rich results: local business details and hours, FAQ answers, breadcrumbs, and prices. It's also how AI search tools read a page. |
| **`robots.txt`** (`app/robots.ts`) | Allows the site; disallows `/api/`, `/dashboard`, `/payment/`, `/account-blocked`; points to the sitemap. | Stops crawlers from wasting their crawl budget on private or API URLs. |
| **`sitemap.xml`** (`app/sitemap.ts`) | Lists Home, Browse Services, all 7 category pages, About Us, Sign Up and Sign In, with change frequency and priority. | Helps search engines find every public page quickly, including the category pages that are only linked through filters. |
| **Web app manifest** (`app/manifest.ts`) | Name, short name, description, start URL, icon. | Gives browsers and search engines app details for "add to home screen" and app-like listings. |
| **Semantic HTML and accessibility** | One `<h1>` per page (added to Sign In / Sign Up), a logical heading order, `<main>`, `<nav>`, `<header>`, `<footer>`, `<address>`, and `aria-labelledby` on sections. The About Us FAQ uses native `<details>`, so the answers are in the HTML. Service card images have descriptive `alt` text. | Search engines use headings and landmarks to understand page structure. Alt text makes images findable in image search. Native `<details>` keeps FAQ content indexable without JavaScript. |
| **Performance** | `next/image` (resized, modern formats, lazy-loaded, above-the-fold images preloaded), `next/font` (self-hosted, no layout shift), Server Components by default, and services cached for 60 s. | Page speed and Core Web Vitals are ranking factors and keep visitors from leaving. |
| **Absolute URLs from env** | `metadataBase` and all canonical/sitemap/OG URLs come from `NEXT_PUBLIC_APP_URL`. | The same code produces correct URLs on localhost and in production. **Set it to the live URL when deploying.** |

**Known limitation:** service details pages require sign-in (an assignment requirement), so search engines can't crawl them. They are deliberately left out of the sitemap, and the services are discoverable through the public category pages instead.

---

## Technology stack

| Area | Tools |
|---|---|
| Framework | **Next.js 16** (App Router, Server Components, Server Actions, `proxy.ts`), **React 19**, **TypeScript** |
| Styling / UI | **Tailwind CSS v4**, **shadcn/ui** (on Base UI), **daisyUI**, lucide-react icons, next-themes (light/dark) |
| Auth | **Better Auth** (email/password, Google OAuth, JWT plugin, MongoDB adapter) |
| Data / API | REST API on **Express.js + MongoDB (Mongoose)** (separate repo); JWT sent as `Authorization: Bearer` |
| Payments | **Stripe Checkout** + verified webhook (on the server) |
| Images | **ImgBB** (uploaded through a server-side route handler) |
| Utilities | date-fns, react-day-picker, react-hot-toast |
| Tooling | ESLint, Prettier, TypeScript `tsc` |

---

## Installation

**Prerequisites:** Node.js 20+, npm, a MongoDB database (e.g. MongoDB Atlas), and the [SalonBook server](https://github.com/RoaringMaelstrom/ph_a9_server) running locally or deployed. For full functionality you also need a Google OAuth client, an ImgBB API key and a Stripe test account (the Stripe keys go in the server).

```bash
git clone https://github.com/RoaringMaelstrom/ph-a9.git salonbook-client
cd salonbook-client
npm install
```

Create a `.env` file in the project root with the variables below.

### Required environment variables

Names only. Never commit real values (`.env*` is git-ignored).

| Variable | Purpose |
|---|---|
| `BETTER_AUTH_SECRET` | Secret used by Better Auth to sign sessions and tokens |
| `BETTER_AUTH_URL` | Base URL of this app (e.g. `http://localhost:3000`). Used by Better Auth, as a trusted origin, and by the server to fetch the JWKS |
| `BETTER_AUTH_DB_URL` | MongoDB connection string (the app uses the `SalonBook` database) |
| `GOOGLE_CLIENT_ID` | Google OAuth client id |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `NEXT_PUBLIC_API_URL` | Express API base URL **including `/api`**, no trailing slash (e.g. `http://localhost:5000/api`) |
| `NEXT_PUBLIC_APP_URL` | Public URL of this site, used for canonical, Open Graph and sitemap URLs |
| `IMGBB_API_KEY` | ImgBB API key (server-side only) |

For Google sign-in, add `<BETTER_AUTH_URL>/api/auth/callback/google` as an authorized redirect URI in the Google Cloud console.

The server's own variables (MongoDB, Stripe secret and webhook secret, client URL for CORS, etc.) are listed in the server README.

---

## Running locally

1. Start the **server** first (see its README). By default it runs at `http://localhost:5000`.
2. Start the client:

   ```bash
   npm run dev
   ```

3. Open http://localhost:3000.

Other scripts:

| Command | What it does |
|---|---|
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run format` | Prettier |

**Admin account:** every new sign-up is a customer. To make an admin, sign up normally, then set `role` to `"admin"` on that user's document in the `user` collection (MongoDB Compass or Atlas). Admin credentials for evaluation are submitted separately, not stored in this repository.

**Testing payments:** use Stripe test mode and the test card `4242 4242 4242 4242` with any future expiry date and any CVC. Locally, forward webhooks to the server with the Stripe CLI (see the server README).

---

## Project structure (short)

```
app/
  (auth)/            sign-in, sign-up
  (main)/dashboard/  customer + admin dashboards (role-checked per page)
  (payment)/         Stripe success / cancel pages
  services/          browse services + service details & booking
  about-us/          How SalonBook works (SEO page)
  api/               Better Auth handler, ImgBB upload route
  components/        shared, landing, dashboard, skeletons, types
  robots.ts, sitemap.ts, manifest.ts
components/ui/       shadcn/ui primitives
lib/                 auth, session guards, API helpers, booking rules, SEO helpers
proxy.ts             redirects signed-out users away from private routes
```
