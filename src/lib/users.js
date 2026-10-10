import {
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";

const scrypt = promisify(scryptCallback);
const dataDirectory = path.join(process.cwd(), "data");
const usersFile = path.join(dataDirectory, "users.json");
let writeQueue = Promise.resolve();

async function readAccounts() {
  try {
    const contents = await readFile(usersFile, "utf8");
    const accounts = JSON.parse(contents);
    if (!Array.isArray(accounts)) throw new Error("Invalid account store.");
    return accounts;
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

function serializeWrite(operation) {
  const result = writeQueue.then(operation, operation);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function hashPassword(password, salt) {
  const derivedKey = await scrypt(password, salt, 64);
  return derivedKey.toString("hex");
}

async function persistAccounts(accounts) {
  await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
  const temporaryFile = `${usersFile}.${randomUUID()}.tmp`;

  try {
    await writeFile(temporaryFile, JSON.stringify(accounts), {
      encoding: "utf8",
      mode: 0o600,
    });
    await rename(temporaryFile, usersFile);
  } finally {
    await unlink(temporaryFile).catch(() => {});
  }
}

export async function createCustomerAccount(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const salt = randomBytes(16).toString("hex");
  const passwordHash = await hashPassword(password, salt);

  return serializeWrite(async () => {
    const accounts = await readAccounts();
    if (accounts.some((account) => account.email === normalizedEmail)) {
      return null;
    }

    const account = {
      id: randomUUID(),
      email: normalizedEmail,
      passwordHash,
      salt,
      role: "customer",
      createdAt: new Date().toISOString(),
    };

    await persistAccounts([...accounts, account]);
    return { id: account.id, email: account.email, role: account.role };
  });
}

export async function authenticateRegisteredCustomer(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const account = (await readAccounts()).find(
    (candidate) =>
      candidate.email === normalizedEmail && candidate.role === "customer",
  );

  if (!account) return null;

  const actualHash = Buffer.from(
    await hashPassword(password, account.salt),
    "hex",
  );
  const expectedHash = Buffer.from(account.passwordHash, "hex");
  if (
    actualHash.length !== expectedHash.length ||
    !timingSafeEqual(actualHash, expectedHash)
  ) {
    return null;
  }

  return { id: account.id, email: account.email, role: account.role };
}
