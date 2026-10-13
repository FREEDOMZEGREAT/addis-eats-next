import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";
import {
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import os from "node:os";
import path from "node:path";

const g = globalThis;

if (!g.__users) {
  g.__users = [
    {
      id: "usr_1",
      name: "Almaz",
      phone: "0912345678",
      role: "customer",
      passwordHash: bcrypt.hashSync("customer123", 10),
    },
    {
      id: "usr_2",
      name: "Kitchen Staff",
      phone: "0911000000",
      role: "staff",
      passwordHash: bcrypt.hashSync("staff123", 10),
    },
  ];
}

export const users = g.__users;

export function findUserByPhone(phone) {
  return users.find((user) => user.phone === phone);
}

export function createUser({ name, phone, password }) {
  const user = {
    id: `usr_${Date.now()}`,
    name,
    phone,
    role: "customer",
    passwordHash: bcrypt.hashSync(password, 10),
  };
  users.push(user);
  return user;
}

export function authenticatePhoneUser(phone, password) {
  const user = findUserByPhone(phone.trim());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) return null;

  return { id: user.id, email: user.phone, role: user.role };
}

const scrypt = promisify(scryptCallback);

// Registered accounts live in an in-memory store shared across the process
// (globalThis keeps every route graph on the same array) and are mirrored to a
// JSON file when the filesystem is writable. Serverless hosts such as Vercel
// have a read-only or ephemeral filesystem, so there they degrade to the
// in-memory store: signup and sign-in work for the session, but accounts do not
// survive a restart or a different instance. Set DATABASE_URL for persistence.
if (!g.__addisAccounts) g.__addisAccounts = [];
const accountStore = g.__addisAccounts;

function getAccountsFilePath() {
  if (process.env.ACCOUNTS_FILE) return process.env.ACCOUNTS_FILE;
  if (process.env.NODE_ENV === "production") {
    return path.join(os.tmpdir(), "addis-eats-users.json");
  }
  return path.join(process.cwd(), "data", "users.json");
}

let writeQueue = Promise.resolve();
let databaseClient;
let databaseSchemaPromise;

async function getAccountDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  databaseClient ??= neon(connectionString);
  databaseSchemaPromise ??= databaseClient`
    CREATE TABLE IF NOT EXISTS customer_accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
    .then(() => undefined)
    .catch((error) => {
      databaseSchemaPromise = undefined;
      throw error;
    });
  await databaseSchemaPromise;
  return databaseClient;
}

async function loadAccounts() {
  if (accountStore.length > 0) return accountStore;

  try {
    const contents = await readFile(getAccountsFilePath(), "utf8");
    const accounts = JSON.parse(contents);
    if (Array.isArray(accounts) && accounts.length > 0) {
      accountStore.push(...accounts);
    }
  } catch {
    // Missing, unreadable, or invalid file — start from the in-memory store.
  }

  return accountStore;
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
  try {
    const accountsFile = getAccountsFilePath();
    await mkdir(path.dirname(accountsFile), { recursive: true, mode: 0o700 });
    const temporaryFile = `${accountsFile}.${randomUUID()}.tmp`;

    try {
      await writeFile(temporaryFile, JSON.stringify(accounts), {
        encoding: "utf8",
        mode: 0o600,
      });
      await rename(temporaryFile, accountsFile);
    } finally {
      await unlink(temporaryFile).catch(() => {});
    }
  } catch {
    // Read-only or ephemeral filesystem — keep the in-memory store only.
  }
}

export async function createCustomerAccount(name, email, password) {
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const salt = randomBytes(16).toString("hex");
  const passwordHash = await hashPassword(password, salt);
  const database = await getAccountDatabase();

  if (database) {
    const accounts = await database`
      INSERT INTO customer_accounts (id, name, email, password_hash, salt)
      VALUES (${randomUUID()}, ${normalizedName}, ${normalizedEmail}, ${passwordHash}, ${salt})
      ON CONFLICT (email) DO NOTHING
      RETURNING id, name, email, role
    `;
    return accounts[0] ?? null;
  }

  return serializeWrite(async () => {
    const accounts = await loadAccounts();
    if (accounts.some((account) => account.email === normalizedEmail)) {
      return null;
    }

    const account = {
      id: randomUUID(),
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      salt,
      role: "customer",
      createdAt: new Date().toISOString(),
    };

    accounts.push(account);
    await persistAccounts([...accounts]);
    return {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
    };
  });
}

export async function authenticateRegisteredCustomer(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const database = await getAccountDatabase();
  let account;

  if (database) {
    [account] = await database`
      SELECT id, email, password_hash, salt, role
      FROM customer_accounts
      WHERE email = ${normalizedEmail} AND role = 'customer'
      LIMIT 1
    `;
  } else {
    account = (await loadAccounts()).find(
      (candidate) =>
        candidate.email === normalizedEmail && candidate.role === "customer",
    );
  }

  if (!account) return null;

  const actualHash = Buffer.from(
    await hashPassword(password, account.salt),
    "hex",
  );
  const expectedHash = Buffer.from(
    account.password_hash ?? account.passwordHash,
    "hex",
  );
  if (
    actualHash.length !== expectedHash.length ||
    !timingSafeEqual(actualHash, expectedHash)
  ) {
    return null;
  }

  return { id: account.id, email: account.email, role: account.role };
}
