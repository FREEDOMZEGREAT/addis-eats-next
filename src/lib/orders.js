import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { neon } from "@neondatabase/serverless";
import { priceCart } from "./dishes";
import { AREA_FEE } from "./schema";

// Orders fall back to an in-memory store mirrored to a JSON file whenever
// DATABASE_URL is not configured, in every environment. Serverless hosts such
// as Vercel have a read-only or ephemeral filesystem, so there the mirror lives
// in the OS temp directory: orders survive across requests within an instance
// but not across a cold start or a different instance. Set DATABASE_URL for
// durable persistence.
//
// The fallback hangs off globalThis so every route/server component in the
// process shares a single array; a plain module variable is isolated per
// route graph and drops orders between pages.
const globalStore = globalThis;
if (!globalStore.__addisOrders) globalStore.__addisOrders = [];
const orders = globalStore.__addisOrders;

let databaseClient;
let databaseSchemaPromise;

async function getOrderDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  databaseClient ??= neon(connectionString);
  databaseSchemaPromise ??= databaseClient`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      area TEXT NOT NULL,
      address TEXT NOT NULL DEFAULT '',
      note TEXT NOT NULL DEFAULT '',
      items JSONB NOT NULL,
      subtotal INTEGER NOT NULL,
      delivery_fee INTEGER NOT NULL,
      total INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'ETB',
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      cancelled_at TIMESTAMPTZ
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

function getOrdersFilePath() {
  if (process.env.ORDERS_FILE) return process.env.ORDERS_FILE;
  if (process.env.NODE_ENV === "production") {
    return path.join(os.tmpdir(), "addis-eats-orders.json");
  }
  return path.join(process.cwd(), "data", "orders.json");
}

let writeQueue = Promise.resolve();

function serializeWrite(operation) {
  const result = writeQueue.then(operation, operation);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

async function persistOrders() {
  try {
    const ordersFile = getOrdersFilePath();
    await mkdir(path.dirname(ordersFile), { recursive: true, mode: 0o700 });
    const temporaryFile = `${ordersFile}.${randomUUID()}.tmp`;

    try {
      await writeFile(temporaryFile, JSON.stringify(orders), {
        encoding: "utf8",
        mode: 0o600,
      });
      await rename(temporaryFile, ordersFile);
    } finally {
      await unlink(temporaryFile).catch(() => {});
    }
  } catch {
    // Read-only or ephemeral filesystem — keep the in-memory store only.
  }
}

async function loadOrders() {
  if (orders.length > 0) return orders;

  try {
    const contents = await readFile(getOrdersFilePath(), "utf8");
    const savedOrders = JSON.parse(contents);
    if (Array.isArray(savedOrders) && savedOrders.length > 0) {
      orders.push(...savedOrders);
    }
  } catch {
    // Missing, unreadable, or invalid file — start from the in-memory store.
  }

  return orders;
}

function rowToOrder(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    phone: row.phone,
    area: row.area,
    address: row.address,
    note: row.note,
    items: typeof row.items === "string" ? JSON.parse(row.items) : row.items,
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.delivery_fee),
    total: Number(row.total),
    currency: row.currency,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    cancelledAt: row.cancelled_at
      ? new Date(row.cancelled_at).toISOString()
      : undefined,
  };
}

export async function createOrder(data, userId) {
  if (!userId) throw new Error("An authenticated user is required.");

  const subtotal = await priceCart(data.items);
  const deliveryFee = AREA_FEE[data.area] ?? 0;
  const id = `ord_${randomUUID()}`;

  const database = await getOrderDatabase();

  if (database) {
    const rows = await database`
      INSERT INTO orders (
        id, user_id, name, phone, area, address, note, items,
        subtotal, delivery_fee, total
      )
      VALUES (
        ${id}, ${userId}, ${data.name}, ${data.phone}, ${data.area},
        ${data.address ?? ""}, ${data.note ?? ""},
        ${JSON.stringify(data.items)}::jsonb,
        ${subtotal}, ${deliveryFee}, ${subtotal + deliveryFee}
      )
      RETURNING *
    `;
    return rowToOrder(rows[0]);
  }

  const order = {
    id,
    userId,
    name: data.name,
    phone: data.phone,
    area: data.area,
    address: data.address ?? "",
    note: data.note ?? "",
    items: data.items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    currency: "ETB",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  await loadOrders();
  orders.push(order);
  await serializeWrite(() => persistOrders());
  return order;
}

export async function getOrders(userId) {
  if (!userId) return [];

  const database = await getOrderDatabase();

  if (database) {
    const rows = await database`
      SELECT * FROM orders WHERE user_id = ${userId} ORDER BY created_at ASC
    `;
    return rows.map(rowToOrder);
  }

  await loadOrders();
  return orders.filter((order) => order.userId === userId);
}

export async function getAllOrders() {
  const database = await getOrderDatabase();

  if (database) {
    const rows = await database`SELECT * FROM orders ORDER BY created_at ASC`;
    return rows.map(rowToOrder);
  }

  await loadOrders();
  return [...orders];
}

export async function getOrder(id) {
  const database = await getOrderDatabase();

  if (database) {
    const rows = await database`
      SELECT * FROM orders WHERE id = ${id} LIMIT 1
    `;
    return rows[0] ? rowToOrder(rows[0]) : null;
  }

  await loadOrders();
  return orders.find((order) => order.id === id) ?? null;
}

export async function markCancelled(id) {
  const database = await getOrderDatabase();

  if (database) {
    const rows = await database`
      UPDATE orders
      SET status = 'cancelled', cancelled_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    return rows[0] ? rowToOrder(rows[0]) : null;
  }

  await loadOrders();
  const order = orders.find((entry) => entry.id === id);
  if (order) {
    order.status = "cancelled";
    order.cancelledAt = new Date().toISOString();
    await serializeWrite(() => persistOrders());
  }
  return order ?? null;
}