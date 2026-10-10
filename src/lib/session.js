import { cookies } from "next/headers";
import { createSessionToken, verifySessionToken } from "./session-token";
import { authenticateRegisteredCustomer } from "./users";

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getAdditionalDemoUsers() {
  const serializedUsers = process.env.DEMO_USERS_JSON;
  if (!serializedUsers) return [];

  try {
    const configuredUsers = JSON.parse(serializedUsers);
    if (!Array.isArray(configuredUsers)) throw new Error("Expected an array");

    return configuredUsers.flatMap((candidate) => {
      if (!candidate || typeof candidate !== "object") return [];

      const email =
        typeof candidate.email === "string"
          ? candidate.email.trim().toLowerCase()
          : "";
      const password = candidate.password;
      const role = candidate.role;

      if (
        !email ||
        typeof password !== "string" ||
        !password ||
        !["customer", "staff"].includes(role)
      ) {
        return [];
      }

      return [{ id: `demo-${email}`, email, password, role }];
    });
  } catch {
    console.error(
      "DEMO_USERS_JSON must be a JSON array; additional demo accounts were ignored.",
    );
    return [];
  }
}

export function isReservedAccountEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  const configuredEmails = [
    process.env.DEMO_CUSTOMER_EMAIL,
    process.env.DEMO_STAFF_EMAIL,
    ...(process.env.DEMO_STAFF_EMAILS?.split(",") ?? []),
    ...getAdditionalDemoUsers().map((user) => user.email),
  ];

  return configuredEmails.some(
    (configuredEmail) =>
      configuredEmail?.trim().toLowerCase() === normalizedEmail,
  );
}

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
    ...getAdditionalDemoUsers(),
  ];

  const user = users.find(
    (candidate) =>
      candidate.email &&
      candidate.password &&
      candidate.email === normalizedEmail &&
      candidate.password === password,
  );

  if (user) return { id: user.id, email: user.email, role: user.role };
  return authenticateRegisteredCustomer(normalizedEmail, password);
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
