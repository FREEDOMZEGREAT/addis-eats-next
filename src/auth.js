import { cookies } from "next/headers";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createSessionToken } from "@/lib/session-token";

async function createGoogleAppSession(user) {
  const email = user?.email?.trim().toLowerCase();
  if (!email) return false;

  const staffEmails = new Set(
    [
      process.env.DEMO_STAFF_EMAIL,
      ...(process.env.DEMO_STAFF_EMAILS?.split(",") ?? []),
    ]
      .filter(Boolean)
      .map((staffEmail) => staffEmail.trim().toLowerCase()),
  );
  const appUser = {
    id: user.id || `google-${email.replace(/[^a-z0-9]+/gi, "-")}`,
    email,
    role: staffEmails.has(email) ? "staff" : "customer",
  };

  const cookieStore = await cookies();
  const token = await createSessionToken(appUser);

  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return true;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      if (!user?.email) return false;

      await createGoogleAppSession(user);
      return true;
    },
  },
});
