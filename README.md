# Addis Eats

Addis Eats is a Next.js teaching app for an Ethiopian food-ordering experience in Addis Ababa. It demonstrates App Router rendering, Google OAuth, custom app sessions, client-side cart state, server-side order validation, route handlers, and metadata/SEO best practices for product pages.

## Tech stack

- Next.js 16.3.6 App Router
- React 19
- Tailwind CSS 4
- NextAuth v5 beta with Google OAuth
- Zod validation
- Metadata and Open Graph configuration in App Router

## Production URL

Configured canonical and deployment URL: [https://addis-eats-next-rho.vercel.app/] The deployment returned HTTP 404 during the 2026-10-10 project review; redeploy and verify it before sharing it as a live site.

## Getting started

Prerequisite: Node.js 20.9 or newer and Git.

Clone the repository and enter the app directory:

```bash
git clone https://github.com/IBT-Qiyas-Full-Stack-Academy/sq2-netsanet-degu.git
cd sq2-netsanet-degu/module-03-react-nextjs/project/addis-eats-next
npm ci
```

Create a private environment file from the safe template. In PowerShell:

```powershell
Copy-Item .env.example .env.local
```

In Bash:

```bash
cp .env.example .env.local
```

Replace the placeholders with local values. Use distinct random secrets, with `SESSION_SECRET` at least 32 characters. Customer accounts are stored locally under the ignored `data/` directory, so signup does not require MongoDB or a paid database. Configure Google OAuth if Google sign-in is needed. See [AUTH.md](AUTH.md) for details. `.env.local` is ignored by Git.

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`. Google and demo email/password authentication require the environment variables described in [AUTH.md](AUTH.md).

Available scripts:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Features

- Home page featuring Doro Wat, Tibs, and Ethiopian Coffee under “Today's Specials”
- Menu browsing with horizontal category filters and debounced live search
- Dish detail pages generated from the dish catalog
- Dynamic SEO metadata for each dish page and a global site metadata configuration
- Open Graph metadata and title template setup for better sharing and page previews
- Browser-persisted cart with quantity editing; cart contents survive page reloads
- Checkout through a server action with schema validation and server-side pricing
- Google OAuth and configured demo email/password sign-in
- Customer account registration with local file persistence and scrypt password hashing
- Customer order history and a staff-only kitchen queue
- Staff-only admin dashboard with order charts, URL-sorted tables, and pagination

## Route overview

| Route                                | Purpose                                                              | Rendering pattern                       |
| ------------------------------------ | -------------------------------------------------------------------- | --------------------------------------- |
| `/`                                  | Today's Specials                                                     | Revalidated page (one hour)             |
| `/menu`                              | Category-filtered menu                                               | Revalidated page (one hour)             |
| `/menu/[id]`                         | Individual dish details + SEO metadata                               | Static generation with generated params |
| `/cart`                              | Cart review and quantity editing                                     | Client-side cart state                  |
| `/checkout`                          | Order submission                                                     | Dynamic route and server action         |
| `/orders`                            | Signed-in user's orders                                              | Dynamic, session-protected route        |
| `/kitchen`                           | Staff order queue                                                    | Dynamic, staff-protected route          |
| `/admin`                             | Order analytics and paged order table                                | Dynamic, staff-protected server page    |
| `/signin` and `/signup`              | Google OAuth, demo credentials, and locally stored customer accounts | App routes                              |
| `/api/auth/[...nextauth]`            | NextAuth provider callbacks                                          | Route handler                           |
| `/api/dishes` and `/api/dishes/[id]` | Dish listing and detail APIs                                         | Route handlers                          |
| `/api/orders` and `/api/orders/[id]` | Order creation, listing, and detail APIs                             | Protected route handlers                |

## SEO and metadata implementation

The current Day 44 update adds metadata to the app using Next.js App Router conventions:

- Global site metadata is defined in `src/app/layout.js`.
- The app sets `metadataBase`, a default title, a `%s` title template, description text, and Open Graph defaults.
- Each dish page uses `generateMetadata` in `src/app/menu/[id]/page.js` to return a page-specific title and description based on the dish record.
- The route also uses `generateStaticParams` and `dynamicParams = false` so dish pages are statically generated and keep predictable metadata and URL behavior.

## Data and guardrails

- The dish catalog is defined in `src/lib/dishes.js`.
- The order schema and delivery area fees live in `src/lib/schema.js`.
- The cart is provided through `src/app/providers.jsx` and persisted in the browser.
- The app's authorization cookie is created and verified by `src/lib/session.js` and `src/lib/session-token.js`.
- Order prices and delivery fees are recomputed on the server; browser-provided totals are not trusted.
- Registered customer accounts are stored in the ignored local `data/users.json` file by `src/lib/users.js`; passwords are scrypt-hashed. No external database is required for local development.
- Local file-backed accounts are not suitable for Vercel/serverless or multi-instance deployments because their filesystem is ephemeral and instance-local.
- Orders are persisted to Neon Postgres through `src/lib/orders.js` whenever `DATABASE_URL` is set; local development falls back to an in-memory store.
- This is a teaching demo, not a production backend or payment integration.

See [DATA.md](DATA.md) for query locations, logical keys, refresh behavior, and cache/privacy notes. See [PERF.md](PERF.md) for the performance budget and before/after measurements.

## Deployment (Vercel + Neon)

The app is built to deploy on Vercel with a Neon Postgres database. Set these environment variables in the project:

| Variable                                                                                             | Purpose                                                                                          |
| ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`                                                                                       | Neon Postgres connection string. Required in production for customer accounts and orders.        |
| `SESSION_SECRET`                                                                                     | Signing key for the app session cookie (at least 32 characters).                                 |
| `AUTH_SECRET`                                                                                        | NextAuth secret for Google OAuth sessions.                                                       |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`                                                              | Google OAuth client credentials (optional if you only use email/password sign-in).              |
| `DEMO_CUSTOMER_EMAIL` / `DEMO_CUSTOMER_PASSWORD` / `DEMO_STAFF_EMAIL` / `DEMO_STAFF_PASSWORD`         | Seeded demo accounts. Change the default passwords before going live.                            |

The `customer_accounts` and `orders` tables are created automatically on first use. When using Google OAuth, add `https://<your-domain>/api/auth/callback/google` as an authorized redirect URI on the Google client.

Customer flow after deploy: open `/signup`, create an account, sign in, add dishes to the cart, and place an order — it is stored in Postgres and visible on `/orders` and in the staff `/kitchen` and `/admin` views.

## Teaching goals

Day 44 extends the live app with metadata and SEO best practices. The focus is on app-level site metadata, per-page metadata generation, Open Graph setup, and keeping route metadata aligned with the product data model. The project still reinforces Next.js static generation, revalidation, dynamic rendering, server actions, route handlers, authentication flow, and role-based access.

## Project structure

```text
src/
  app/              App Router pages, route handlers, and UI components
  lib/              Catalog, session, validation, pricing, and order helpers
  auth.js           NextAuth Google provider and app-session bridge
public/
  dishes/           Menu image assets
```
