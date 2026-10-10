import { cookies } from "next/headers";
import { createSessionToken, verifySessionToken } from "./session-token";

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function getSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function authenticateCredentials(email, password) {
  if (typeof email !== "string" || typeof password !== "string") return null;

  const normalizedEmail = email.trim().toLowerCase();
  const users = [
    {
      id: "customer-1",
      email: process.env.DEMO_CUSTOMER_EMAIL?.trim().toLowerCase(),
      password: process.env.DEMO_CUSTOMER_PASSWORD,
      role: "customer",
    },
    {
      id: "staff-1",
      email: process.env.DEMO_STAFF_EMAIL?.trim().toLowerCase(),
      password: process.env.DEMO_STAFF_PASSWORD,
      role: "staff",
    },
  ];

  const user = users.find(
    (candidate) =>
      candidate.email &&
      candidate.password &&
      candidate.email === normalizedEmail &&
      candidate.password === password,
  );

  if (!user) return null;
  return { id: user.id, email: user.email, role: user.role };
}

export async function createSession(user) {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
