"use server";

import { orderSchema, AREA_FEE } from "@/lib/schema";
import { createOrder, getOrder, markCancelled } from "@/lib/orders";
import { priceCart } from "@/lib/dishes";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
export async function placeOrder(prevState, formData) {
  const user = await getSession();
  if (!user) {
    return {
      fieldErrors: {},
      formError: "Your session has expired. Sign in before placing an order.",
    };
  }

  let items = [];
  try {
    const parsed = JSON.parse(formData.get("items") ?? "[]");
    if (Array.isArray(parsed)) items = parsed;
  } catch {
    items = [];
  }

  const raw = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    area: formData.get("area"),
    address: formData.get("address") ?? "",
    note: formData.get("note") ?? "",
    items,
  };

  const parsed = orderSchema.safeParse(raw);

  if (!parsed.success) {
    const { fieldErrors, formErrors } = parsed.error.flatten();
    const itemsError = fieldErrors.items?.[0];
    if (itemsError) delete fieldErrors.items;

    return {
      fieldErrors,
      formError: formErrors[0] ?? itemsError ?? null,
    };
  }

  const order = await createOrder(parsed.data, user.id);
  revalidatePath("/orders");

  return {
    fieldErrors: {},
    formError: null,
    id: order.id,
    items: order.items,
    subtotal: await priceCart(order.items),
    deliveryFee: AREA_FEE[order.area] ?? 0,
    total: order.total,
    currency: order.currency,
  };
}
export async function cancelOrder(orderId) {
  const user = await getSession();
  if (!user) throw new Error("Not signed in");

  const order = await getOrder(orderId);
  if (!order) throw new Error("No such order");
  if (order.userId !== user.id) throw new Error("Not yours");

  await markCancelled(orderId);
  revalidatePath("/orders");
}
