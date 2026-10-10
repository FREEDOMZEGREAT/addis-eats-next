import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllOrders } from "@/lib/orders";
import { getSession } from "@/lib/session";
import SignOutButton from "@/app/SignOutButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kitchen",
  description: "Staff order queue for Addis Eats.",
  robots: { index: false, follow: false },
};

export default async function KitchenPage() {
  const user = await getSession();
  if (!user) notFound();
  if (user.role !== "staff") notFound();

  const orders = await getAllOrders();

  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Staff · {user.email}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Kitchen orders
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin" className="btn btn-outline">
            Admin dashboard
          </Link>
          <SignOutButton />
        </div>
      </header>

      {orders.length === 0 ? (
        <p className="card p-6 text-sm text-sand-500">No orders are waiting.</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order.id}
              className="card flex flex-wrap items-center gap-4 p-5"
            >
              <div className="min-w-32">
                <p className="font-mono text-sm font-semibold">{order.id}</p>
                <p className="mt-1 text-sm text-sand-500">{order.name}</p>
              </div>
              <p className="min-w-36 flex-1 text-sm text-sand-600">
                {order.items
                  .map((item) => `${item.qty}× ${item.id}`)
                  .join(", ")}
              </p>
              <span className="badge badge-gold">{order.status}</span>
              <p className="price text-brand-700">{order.total} ETB</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
