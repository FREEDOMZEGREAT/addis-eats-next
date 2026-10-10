# Addis Eats — Project Strategy

## Overview

Location: `module-03-react-nextjs/Days/Day_44/addis-eats`

Stack: Next.js 16.3.6 App Router · React 19 · Tailwind CSS 4 · NextAuth v5 beta · Zod 4

Status: Day 44. The app now includes global SEO metadata and per-dish metadata generation for the product detail pages. The home page still highlights Doro Wat, Tibs, and Ethiopian Coffee, while the menu and checkout flows remain aligned with the teaching demo setup.

Purpose: Keep project goals, guardrails, and day-by-day progress aligned with the code that is actually in this folder.

## 1. Product and route strategy

Addis Eats is a teaching app for an Ethiopian food-ordering experience in Addis Ababa. Its routes intentio
nally demonstrate different Next.js rendering and data-flow patterns, and the Day 44 update adds SEO and metadata as a first-class product concern.

| Route        | Strategy                | Current implementation                                                 |
| ------------ | ----------------------- | ---------------------------------------------------------------------- |
| `/`          | Revalidated page        | Home hero and three real dish cards; one-hour revalidation             |
| `/menu`      | Revalidated page        | Server-filtered dish list with horizontal category controls            |
| `/menu/[id]` | Static generation       | Dish pages generated from the catalog and given page-specific metadata |
| `/cart`      | Client-side state       | Browser-persisted cart and quantity editing                            |
| `/checkout`  | Dynamic + server action | Session guard, validation, authoritative pricing, order write          |
| `/orders`    | Dynamic + protected     | Orders scoped to the signed-in app user                                |
| `/kitchen`   | Dynamic + staff-only    | Staff queue guarded by role                                            |
| `/api/*`     | Route handlers          | Dish and protected order APIs                                          |
| `/signin`    | Auth entry route        | Google OAuth and demo credentials for the teaching environment         |

## 2. Non-negotiable guardrails

- Prices and delivery fees are recomputed on the server from the dish catalog and validated order data.
- Cart state belongs to the browser and is not trusted as an order total.
- Order flow checks the session and payload limits before schema validation, server-side pricing, and writing.
- Dish detail routes use `generateMetadata` and `generateStaticParams` to keep metadata and URL output aligned with the catalog.
- Root app metadata is defined in `src/app/layout.js` with `metadataBase`, title template, description, and Open Graph defaults.
- Order writes go through the serialized in-memory flow in `src/lib/orders.js`.
- The app's signed `session` cookie remains the authorization source for pages, actions, and order routes; Google OAuth must create this app session before redirecting into protected routes.
- The proxy is not the only security boundary. Protected server pages, actions, and route handlers enforce their own session and role/ownership checks.
- Keep server components as the default; use client components near the interactive controls.
- Use shared design tokens and UI patterns from `src/app/globals.css`.
- Currency is ETB and prices are integer-valued.

## 3. Day 44 priorities

### Completed

- Added global site metadata and a default title template in `src/app/layout.js`.
- Added Open Graph metadata configuration for consistent social previews.
- Added a per-dish `generateMetadata` function in `src/app/menu/[id]/page.js` using the catalog data.
- Kept static generation working via `generateStaticParams` and `dynamicParams = false` for dish detail URLs.
- Verified the project builds successfully after the metadata update.

### Remaining risks and limitations

- Orders are stored in memory and disappear when the server restarts.
- Demo email/password credentials are environment-configured; authentication does not use a persistent user database or password hashing.
- OAuth and app authorization use separate session mechanisms; the app's protected routes rely on the custom HMAC cookie.
- Automated coverage for pricing, validation, authorization, OAuth-to-app-session behavior, and SEO metadata output is still useful.
- The `/api/dishes` endpoint can still accept search query parameters even though the UI search control was removed.

## 4. Next steps

1. Add focused tests for server-side pricing, delivery-area fees, ownership checks, role enforcement, and metadata output.
2. Add an end-to-end check for Google OAuth callback, app-session creation, and redirect behavior.
3. Replace in-memory users/orders with persistent storage before treating the app as production-ready.
4. Keep the README, AUTH.md, and this strategy document in sync with route, auth, and SEO changes.

## Log

- Day 40: Documented the original route rendering split and project guardrails.
- Day 41: Continued correctness and mobile navigation work.
- Day 42: Fixed checkout payload handling, delivery-area validation, and cart-clearing behavior; refreshed the project README and strategy for the active folder.
- Day 43: Added Google OAuth and bridged successful Google sign-in to the app session; refreshed the home specials layout and simplified menu controls. Updated project and authentication docs to reflect current behavior and limitations.
- Day 44: Added site-wide metadata and per-dish SEO metadata, including Open Graph and title template support, and aligned the docs with the final implementation state.
