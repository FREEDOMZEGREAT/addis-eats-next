import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isSessionConfigured, safeRedirectPath } from "@/lib/session-token";
import { signIn as loginWithCredentials } from "@/app/auth-actions";

export const metadata = {
  title: "Sign in",
  description: "Sign in to manage your Addis Eats orders.",
  robots: { index: false, follow: false },
};

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const session = await getSession();
  const configured = isSessionConfigured();
  const nextPath =
    typeof params?.next === "string" ? safeRedirectPath(params.next) : "";

  if (session) {
    redirect(
      safeRedirectPath(
        params?.next,
        session.role === "staff" ? "/kitchen" : "/orders",
      ),
    );
  }

  return (
    <section className="mx-auto w-full max-w-md px-5 py-12 sm:px-6 sm:py-20">
      <div className="mb-7">
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Sign in to Addis Eats
        </h1>
      </div>

      <div className="card space-y-5 p-5 sm:p-7">
        <form action={loginWithCredentials} className="space-y-5">
          <input type="hidden" name="next" value={nextPath} />

          {(!configured || params?.error === "config") && (
            <p
              role="alert"
              className="rounded-field bg-danger-50 p-3 text-sm text-danger-700"
            >
              Sign-in is not configured on this server yet. An administrator
              must set a SESSION_SECRET of at least 32 characters.
            </p>
          )}

          {configured && params?.error === "invalid" && (
            <p
              role="alert"
              className="rounded-field bg-danger-50 p-3 text-sm text-danger-700"
            >
              Name or password is incorrect.
            </p>
          )}

          <div>
            <label
              htmlFor="identifier"
              className="mb-1.5 block text-sm font-semibold"
            >
              Name
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              autoComplete="username"
              required
              className="field"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-semibold"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="field"
            />
          </div>

          <button type="submit" className="btn btn-primary w-full">
            Sign in
          </button>
        </form>
      </div>

      <p className="mt-5 text-sm text-sand-500">
        New to Addis Eats?{" "}
        <Link
          href={`/signup${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
          className="font-semibold text-brand-700"
        >
          Create an account
        </Link>
      </p>

      <p className="mt-3 text-sm text-sand-500">
        Return to the{" "}
        <Link href="/" className="font-semibold text-brand-700">
          menu
        </Link>
        .
      </p>
    </section>
  );
}
