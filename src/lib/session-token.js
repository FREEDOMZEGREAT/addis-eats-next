const encoder = new TextEncoder();
const decoder = new TextDecoder();
const SESSION_LIFETIME_SECONDS = 60 * 60 * 8;

function encodeBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

export function isSessionConfigured() {
  const secret = process.env.SESSION_SECRET;
  return Boolean(secret) && encoder.encode(secret).length >= 32;
}

async function getSigningKey() {
  if (!isSessionConfigured()) return null;
  const secret = process.env.SESSION_SECRET;

  return globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createSessionToken(user) {
  const key = await getSigningKey();
  if (!key) {
    throw new Error("SESSION_SECRET must be at least 32 characters long.");
  }

  const payload = encodeBase64Url(
    encoder.encode(
      JSON.stringify({
        sub: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS,
      }),
    ),
  );
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );

  return `${payload}.${encodeBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(token) {
  if (typeof token !== "string") return null;

  const [payload, encodedSignature, extra] = token.split(".");
  if (!payload || !encodedSignature || extra !== undefined) return null;

  try {
    const key = await getSigningKey();
    if (!key) return null;

    const valid = await globalThis.crypto.subtle.verify(
      "HMAC",
      key,
      decodeBase64Url(encodedSignature),
      encoder.encode(payload),
    );
    if (!valid) return null;

    const claims = JSON.parse(decoder.decode(decodeBase64Url(payload)));
    if (
      typeof claims.sub !== "string" ||
      typeof claims.email !== "string" ||
      !["customer", "staff"].includes(claims.role) ||
      !Number.isInteger(claims.exp) ||
      claims.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return {
      id: claims.sub,
      email: claims.email,
      role: claims.role,
      expiresAt: claims.exp * 1000,
    };
  } catch {
    return null;
  }
}

export function safeRedirectPath(value, fallback = "/orders") {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return fallback;
  }

  try {
    const base = new URL("https://addis-eats.invalid");
    const target = new URL(value, base);
    if (target.origin !== base.origin) return fallback;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}
