import { orderSchema } from "@/lib/schema";
import { createOrder, getOrders } from "@/lib/orders";
import { getSession } from "@/lib/session";

export async function GET() {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await getOrders(user.id);
  return Response.json(orders);
}

export async function POST(request) {
  const user = await getSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Malformed JSON" }, { status: 400 });
  }
  const result = orderSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      {
        error: "Validation failed",
        fieldErrors: result.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }
  const order = await createOrder(result.data, user.id);
  return Response.json(order, { status: 201 });
}
