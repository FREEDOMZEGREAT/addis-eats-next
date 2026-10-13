"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  authenticateCredentials,
  destroySession,
} from "@/lib/session";
import { safeRedirectPath } from "@/lib/session-token";
import { isReservedAccountEmail } from "@/lib/session";
import { createCustomerAccount } from "@/lib/users";

export async function signIn(formData) {
  const requestedNext = formData.get("next");
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

  await createSession(user);
  redirect(
    safeRedirectPath(
      requestedNext,
      user.role === "staff" ? "/kitchen" : "/orders",
    ),
  );
}

export async function signUp(formData) {
  const nextPath = safeRedirectPath(formData.get("next"));
  const nameValue = formData.get("name");
  const emailValue = formData.get("email");
  const password = formData.get("password");
  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const email =
    typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";

  if (
    !name ||
    name.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.length > 254 ||
    typeof password !== "string" ||
    password.length < 6 ||
    password.length > 128
  ) {
    redirect(`/signup?error=invalid&next=${encodeURIComponent(nextPath)}`);
  }

  if (isReservedAccountEmail(email)) {
    redirect(`/signup?error=exists&next=${encodeURIComponent(nextPath)}`);
  }

  let user;
  try {
    user = await createCustomerAccount(name, email, password);
  } catch (error) {
    console.error("Account registration failed:", error);
    redirect(`/signup?error=unavailable&next=${encodeURIComponent(nextPath)}`);
  }

  if (!user) {
    redirect(`/signup?error=exists&next=${encodeURIComponent(nextPath)}`);
  }

  await createSession(user);
  redirect(nextPath);
}

export async function signOut() {
  await destroySession();
  redirect("/signin");
}
