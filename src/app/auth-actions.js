"use server";

import { redirect } from "next/navigation";
import {
  createSession,
  authenticateCredentials,
  destroySession,
} from "@/lib/session";
import { safeRedirectPath } from "@/lib/session-token";

export async function signIn(formData) {
  const requestedNext = formData.get("next");
  const user = await authenticateCredentials(
    formData.get("email"),
    formData.get("password"),
  );

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

export async function signOut() {
  await destroySession();
  redirect("/signin");
}
