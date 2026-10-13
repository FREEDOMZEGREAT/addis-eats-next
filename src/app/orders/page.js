import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrders } from "@/lib/orders";
import { getDishName } from "@/lib/dishes";
import { getSession } from "@/lib/session";
import CancelOrderButton from "./CancelOrderButton";
import OrderStatus from "./OrderStatus";
import SignOutButton from "@/app/SignOutButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Orders",
  description: "Every order you have placed with us.",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const user = await getSession();
  if (!user) redirect("/signin?next=%2Forders");

  const orders = await getOrders(user.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
      <header className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">History</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Your orders
            </h1>
            <p className="mt-2 text-sm text-sand-500">
              Signed in as {user.email}
            </p>
          </div>
          <SignOutButton />
        </div>
      </header>

      {orders.length === 0 ? (
        <div className="card grid place-items-center px-6 py-20 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sand-100 text-sand-400">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7"
            >
              <path d="M8 3v3M16 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
            </svg>
          </span>
          <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">
            No orders yet
          </h2>
          <p className="mt-1.5 max-w-xs text-sm text-sand-500">
            Once you place an order it will show up here with its status and
            total.
          </p>
          <Link href="/menu" className="btn btn-primary mt-6">
            Browse the menu
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {orders.map((o) => (
            <li key={o.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center gap-3 border-b border-sand-200 px-5 py-3.5 sm:px-6">
                <span className="font-mono text-sm font-semibold text-sand-800">
                  {o.id}
                </span>
                <OrderStatus order={o} />
                <span className="ml-auto text-xs text-sand-400">
                  {new Date(o.createdAt).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-4 sm:px-6">
                <dl className="space-y-1 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-16 text-sand-400">Name</dt>
                    <dd className="font-medium text-sand-800">{o.name}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 text-sand-400">Phone</dt>
                    <dd className="font-mono text-sand-700">{o.phone}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 text-sand-400">Area</dt>
                    <dd className="text-sand-700">
                      {o.area}
                      {o.address ? ` — ${o.address}` : ""}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 text-sand-400">Items</dt>
                    <dd className="text-sand-700">
                      {o.items
                        .map((i) => `${i.qty}× ${getDishName(i.id)}`)
                        .join(", ")}
                    </dd>
                  </div>
                  {o.note && (
                    <div className="flex gap-2">
                      <dt className="w-16 text-sand-400">Note</dt>
                      <dd className="max-w-xs text-sand-600 italic">
                        {o.note}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="text-right">
                  <p className="price text-2xl text-brand-700">
                    {o.total}
                    <span className="ml-1 text-sm font-medium text-sand-400">
                      {o.currency}
                    </span>
                  </p>
                  {o.status !== "cancelled" && (
                    <CancelOrderButton orderId={o.id} />
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
