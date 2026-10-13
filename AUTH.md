# Authentication

Addis Eats supports Google OAuth through NextAuth and a separate demo email/password form. Both flows create the app's custom `session` cookie; the app uses that cookie for authorization on protected pages and order operations.

## Local setup

Create `.env.local` in the project root and set these variables. Keep the file private and never commit real credentials.

```dotenv
AUTH_GOOGLE_ID=your-google-oauth-client-id
AUTH_GOOGLE_SECRET=your-google-oauth-client-secret
AUTH_SECRET=replace-with-a-random-secret
SESSION_SECRET=replace-with-a-random-secret-of-at-least-32-characters
DEMO_CUSTOMER_EMAIL=customer@example.com
DEMO_CUSTOMER_PASSWORD=choose-a-local-demo-password
DEMO_STAFF_EMAIL=staff@example.com
DEMO_STAFF_PASSWORD=choose-a-local-demo-password
# Optional additional credential accounts (JSON array; roles: customer or staff)
DEMO_USERS_JSON='[{"email":"another.customer@example.com","password":"choose-a-password","role":"customer"},{"email":"another.staff@example.com","password":"choose-a-password","role":"staff"}]'
# Optional comma-separated Google accounts granted the staff role
DEMO_STAFF_EMAILS=staff-two@example.com,staff-three@example.com
```

Configure this authorized redirect URI in the Google OAuth client:

```text
http://localhost:3000/api/auth/callback/google
```

No external database is required for local development. Start the app with `npm run dev` and open `/signin`. From there, new customers can follow **Create an account**; signup returns to the requested local path, including `/checkout`. New accounts are customer-only, emails are unique and normalized, and passwords of 6-128 characters are scrypt-hashed before storage in the ignored local `data/users.json` file. Existing credential accounts continue to work.

Any Google account that provides an email can sign in. Google users default to the `customer` role; addresses matching `DEMO_STAFF_EMAIL` or any entry in `DEMO_STAFF_EMAILS` receive the `staff` role. Email/password sign-in accepts the two legacy accounts (`DEMO_CUSTOMER_*` and `DEMO_STAFF_*`), locally registered accounts, plus optional accounts in `DEMO_USERS_JSON`. Each JSON account needs a unique email, password, and either the `customer` or `staff` role. Restart the development server after changing `.env.local`.

The `staff` role can access both `/kitchen` and `/admin`. Give staff access only to people you trust. These environment-configured accounts are for the teaching demo; use a persistent user store and proper password hashing for a real multi-user service.

## App session and access rules

After Google OAuth or account signup succeeds, `src/auth.js` or `src/app/auth-actions.js` creates the app session. The cookie is named `session`, lasts seven days, is `httpOnly`, uses `sameSite=lax`, and is marked `secure` in production. `SESSION_SECRET` must be at least 32 characters. NextAuth uses `AUTH_SECRET` for its provider flow.

| Route or operation                           | Security layers                                                                                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/checkout`, `/orders`, `/kitchen`, `/admin` | `src/proxy.js` verifies the signed session cookie before routing. Unauthenticated requests go to `/signin`; kitchen/admin require staff at the proxy.         |
| `/orders`, `/kitchen`, `/admin` pages        | Each server page independently reads the app session. Orders query only the current session user ID; kitchen/admin pages also check the staff role.           |
| `placeOrder`, `cancelOrder` server actions   | Each action re-reads the app session. Placement validates the payload and recomputes prices server-side; cancellation checks the order owner before mutation. |
| `signUp` server action                       | Validates email/password, assigns only the `customer` role, scrypt-hashes passwords, and persists accounts in the local ignored user file.                    |
| `/api/orders`                                | Each method verifies the app session; reads are scoped to its user ID and writes are validated server-side.                                                   |
| `/api/orders/[id]`                           | Verifies the app session and returns an order only if its `userId` matches the session user.                                                                  |
| Sign-in/sign-out server actions              | Sign-in validates configured credentials before creating a signed app session and sanitizes `next`; sign-out deletes the app session cookie.                  |
| Sign-in redirects                            | `safeRedirectPath` rejects external, protocol-relative, and backslash-containing destinations before redirecting.                                             |

The proxy is an early gate, not the sole authorization check. The signed `session` cookie is the authorization source; a browser-provided identity or NextAuth provider session alone does not grant app-route access.

Google sign-in normally returns users to `/orders`, or to a valid `next` path when one was requested. Configure the staff Google address as `DEMO_STAFF_EMAIL` to grant kitchen access.

## Security attack tests

1. **Forged session / role escalation:** Change a signed cookie's payload or role to `staff` without a valid HMAC, then request `/admin`, `/kitchen`, and `/api/orders`. Expect protected pages to redirect/deny access and the API to return `401`; changing the role claim must not grant staff access.
2. **Order IDOR:** Sign in as customer A, then request `/api/orders/<customer-B-order-id>` and invoke cancellation with that ID. Expect the detail API to return `404`, cancellation to fail, and customer B's order status to remain unchanged.
3. **Open redirect:** Sign in with `next=https://attacker.example`, `next=//attacker.example`, and a backslash-based destination such as `next=/\\attacker.example`. Try both credential and Google sign-in. Expect every redirect to remain on an allowed local path.

## Manual verification

1. Visit `/checkout` in a private window and confirm it redirects to sign-in. Complete Google sign-in and confirm the app returns to checkout with an active app session.
2. Sign in with an ordinary Google account and confirm `/orders` loads and shows that account's email.
3. Create a fresh account at `/signup`; confirm it becomes a customer, can submit an order, and can only read its own order history. Duplicate email registration should be rejected.
4. Set `DEMO_STAFF_EMAILS` to two Google accounts you control, restart the app, and confirm both can open `/kitchen` and `/admin`.
5. Sign in as a customer and request `/kitchen`; access must be denied by both the proxy and the server-rendered page.
6. Sign out and request `/api/orders`; it should return `401`. Signed-in order reads must only expose orders owned by that session user.
7. Try `/signin?next=https://example.com`; after sign-in, the app must stay on a local route.

## Demo limitations

Demo credentials and secrets are environment-configured. Registered accounts persist locally in `data/users.json`, but this file-based store is for a single local server only; it will not persist correctly on Vercel/serverless or across multiple server instances. Orders are stored in memory in `src/lib/orders.js` and are lost when the server restarts. Signup does not yet include email verification, password reset, or rate limiting; use persistent production storage and abuse protection before exposing it publicly.
