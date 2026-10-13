import bcrypt from "bcryptjs";
import {
  randomBytes,
  randomUUID,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
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

export async function createCustomerAccount(name, email, password) {
  const normalizedName = name.trim();
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
      name: normalizedName,
      email: normalizedEmail,
      passwordHash,
      salt,
      role: "customer",
      createdAt: new Date().toISOString(),
    };

    await persistAccounts([...accounts, account]);
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
