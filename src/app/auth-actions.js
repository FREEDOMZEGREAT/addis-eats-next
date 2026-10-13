"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  authenticateCredentials,
  destroySession,
} from "@/lib/session";
import { isSessionConfigured, safeRedirectPath } from "@/lib/session-token";
import { isReservedAccountEmail } from "@/lib/session";
import { createCustomerAccount, usernameToEmail } from "@/lib/users";

export async function signIn(formData) {
  const requestedNext = formData.get("next");

  if (!isSessionConfigured()) {
    console.error(
      "Sign-in is unavailable: SESSION_SECRET must be set to at least 32 characters.",
    );
    redirect("/signin?error=config");
  }

  let user;
  try {
    user = await authenticateCredentials(
      formData.get("identifier"),
      formData.get("password"),
    );
  } catch (error) {
    console.error("Account sign-in lookup failed:", error);
    redirect("/signin?error=unavailable");
  }

  if (!user) {
    const nextPath = safeRedirectPath(requestedNext);
    redirect(`/signin?error=invalid&next=${encodeURIComponent(nextPath)}`);
  }

  try {
    await createSession(user);
  } catch (error) {
    console.error("Session creation failed:", error);
    redirect("/signin?error=config");
  }
  redirect(
    safeRedirectPath(
      requestedNext,
      user.role === "staff" ? "/kitchen" : "/orders",
    ),
  );
}

export async function signUp(formData) {
  const nextPath = safeRedirectPath(formData.get("next"));

  if (!isSessionConfigured()) {
    console.error(
      "Sign-up is unavailable: SESSION_SECRET must be set to at least 32 characters.",
    );
    redirect(`/signup?error=config&next=${encodeURIComponent(nextPath)}`);
  }

  const nameValue = formData.get("name");
  const password = formData.get("password");
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const username = name.toLowerCase();

  if (
    !name ||
    name.length > 100 ||
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 128
  ) {
    redirect(`/signup?error=invalid&next=${encodeURIComponent(nextPath)}`);
  }

  if (username === "admin" || isReservedAccountEmail(usernameToEmail(name))) {
    redirect(`/signup?error=exists&next=${encodeURIComponent(nextPath)}`);
  }

  let user;
  try {
    user = await createCustomerAccount(name, usernameToEmail(name), password);
  } catch (error) {
    console.error("Account registration failed:", error);
    redirect(`/signup?error=unavailable&next=${encodeURIComponent(nextPath)}`);
  }

  if (!user) {
    redirect(`/signup?error=exists&next=${encodeURIComponent(nextPath)}`);
  }

  try {
    await createSession(user);
  } catch (error) {
    console.error("Session creation failed:", error);
    redirect(`/signup?error=config&next=${encodeURIComponent(nextPath)}`);
  }
  redirect(nextPath);
}

export async function signOut() {
  await destroySession();
  redirect("/signin");
}
