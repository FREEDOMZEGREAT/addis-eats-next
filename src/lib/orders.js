import { priceCart } from "./dishes";
import { AREA_FEE } from "./schema";

// In-memory store — Module 4 replaces this with a real database.
let orders = [];
let nextId = 1;

export async function createOrder(data, userId) {
  if (!userId) throw new Error("An authenticated user is required.");

  const subtotal = await priceCart(data.items);
  const deliveryFee = AREA_FEE[data.area] ?? 0;

  const order = {
    id: `ord_${nextId++}`,
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

  orders.push(order);
  return order;
}

export async function getOrders(userId) {
  if (!userId) return [];
  return orders.filter((o) => o.userId === userId);
}

export async function getAllOrders() {
  return [...orders];
}

export async function getOrder(id) {
  return orders.find((o) => o.id === id) ?? null;
}

export async function markCancelled(id) {
  const order = orders.find((o) => o.id === id);
  if (order) {
    order.status = "cancelled";
    order.cancelledAt = new Date().toISOString();
  }
  return order;
}
