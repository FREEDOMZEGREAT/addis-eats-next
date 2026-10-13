import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { safeRedirectPath } from "@/lib/session-token";
import { signUp } from "@/app/auth-actions";

export const metadata = {
  title: "Create account",
  description:
    "Create a customer account to place and track Addis Eats orders.",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES = {
  invalid:
    "Enter your name, a valid email, and a password between 6 and 128 characters.",
  exists: "An account already uses this email. Sign in instead.",
  unavailable: "Account creation is unavailable. Please try again later.",
};

export default async function SignUpPage({ searchParams }) {
  const params = await searchParams;
  const session = await getSession();
  const nextPath =
    typeof params?.next === "string"
      ? safeRedirectPath(params.next)
      : "/orders";

  if (session) redirect(nextPath);

  const errorMessage = ERROR_MESSAGES[params?.error];

  return (
    <section className="mx-auto w-full max-w-md px-5 py-12 sm:px-6 sm:py-20">
      <div className="mb-7">
        <p className="eyebrow">Join us</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">
          Create your account
        </h1>
      </div>

      <form action={signUp} className="card space-y-5 p-5 sm:p-7">
        <input type="hidden" name="next" value={nextPath} />

        {errorMessage && (
          <p
            role="alert"
            className="rounded-field bg-danger-50 p-3 text-sm text-danger-700"
          >
            {errorMessage}
          </p>
        )}

        <div>
          <label
            htmlFor="signup-name"
            className="mb-1.5 block text-sm font-semibold"
          >
            Name
          </label>
          <input
            id="signup-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={100}
            required
            className="field"
          />
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="mb-1.5 block text-sm font-semibold"
          >
            Email
          </label>
          <input
            id="signup-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            className="field"
          />
        </div>

        <div>
          <label
            htmlFor="signup-password"
            className="mb-1.5 block text-sm font-semibold"
          >
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            maxLength={128}
            required
            className="field"
          />
          <p className="field-hint">Use at least 6 characters.</p>
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Create account
        </button>
      </form>

      <p className="mt-5 text-sm text-sand-500">
        Already have an account?{" "}
        <Link
          href={`/signin${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
          className="font-semibold text-brand-700"
        >
          Sign in
        </Link>
      </p>
    </section>
  );
}
