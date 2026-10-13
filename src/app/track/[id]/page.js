import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrder } from "@/lib/orders";
import { getSession } from "@/lib/session";
import { getDishName } from "@/lib/dishes";
import { RESTAURANT_LOCATION, areaLocation } from "@/lib/geo";
import { formatCurrency, formatDateTime, formatStatus } from "@/lib/format";
import DeliveryMap from "./deliverymap";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Track order",
  description: "Follow your Addis Eats courier live on the map.",
  robots: { index: false, follow: false },
};

export default async function TrackOrderPage({ params }) {
  const user = await getSession();
  const { id } = await params;

  if (!user) {
    redirect(`/signin?next=${encodeURIComponent(`/track/${id}`)}`);
  }

  const order = await getOrder(id);
  if (!order || (order.userId !== user.id && user.role !== "staff")) {
    redirect("/orders");
  }

  const restaurant = RESTAURANT_LOCATION;
  const delivery = areaLocation(order.area);

  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <header className="mb-6">
        <Link
          href="/orders"
          className="text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          ← Back to orders
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Live tracking</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Tracking{" "}
              <span className="font-mono text-base font-semibold text-sand-500">
                {order.id}
              </span>
            </h1>
            <p className="mt-2 text-sm text-sand-500">
              Placed {formatDateTime(order.createdAt)} ·{" "}
              {formatCurrency(order.total, order.currency)} ·{" "}
              {formatStatus(order.status)}
            </p>
          </div>
        </div>
      </header>

      <DeliveryMap
        orderId={order.id}
        initialStatus={order.status}
        restaurant={restaurant}
        delivery={delivery}
        area={order.area}
        address={order.address ?? ""}
        total={order.total}
      />

      <div className="card mt-5 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Delivery details
        </h2>
        <dl className="mt-3 grid max-w-md gap-2 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-sand-400">Receipt for</dt>
            <dd className="font-medium text-sand-800">{order.name}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-sand-400">Phone</dt>
            <dd className="font-mono text-sand-700">{order.phone}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-sand-400">Deliver to</dt>
            <dd className="text-sand-700">
              {order.area}
              {order.address ? ` — ${order.address}` : ""}
            </dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-20 shrink-0 text-sand-400">Items</dt>
            <dd className="text-sand-700">
              {order.items
                .map((item) => `${item.qty}× ${getDishName(item.id)}`)
                .join(", ")}
            </dd>
          </div>
          {order.note && (
            <div className="flex gap-2">
              <dt className="w-20 shrink-0 text-sand-400">Note</dt>
              <dd className="max-w-xs text-sand-600 italic">{order.note}</dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}