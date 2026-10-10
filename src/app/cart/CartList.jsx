"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/providers";

export default function CartList() {
  const { items, count, total, setQty, removeFromCart, clearCart } = useCart();

  if (items.length === 0) {
    return (
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
            <path d="M2.5 3h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5l1.4-7.3H6" />
            <circle cx="9.5" cy="20" r="1.25" />
            <circle cx="17.5" cy="20" r="1.25" />
          </svg>
        </span>
        <h2 className="mt-4 font-display text-xl font-semibold tracking-tight">
          Nothing in the basket yet
        </h2>
        <Link href="/menu" className="btn btn-primary mt-6">
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
      <section className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-sand-200 px-5 py-4 sm:px-6">
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {count} {count === 1 ? "item" : "items"}
          </h2>
          <button
            type="button"
            onClick={clearCart}
            className="btn btn-danger"
          >
            Clear cart
          </button>
        </div>

        <ul className="divide-y divide-sand-100">
          {items.map((item) => (
            <li key={item.id} className="flex gap-4 px-5 py-4 sm:px-6">
              <Link
                href={`/menu/${item.id}`}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-sand-100"
              >
                {item.image && (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="5rem"
                    className="object-cover"
                  />
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  href={`/menu/${item.id}`}
                  className="truncate font-display text-base font-semibold tracking-tight transition-colors hover:text-brand-700"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 text-sm text-sand-500">
                  {item.price} ETB each
                </p>

                <div className="mt-auto flex items-center gap-3 pt-3">
                  <div className="flex items-center rounded-full border border-sand-300 bg-white">
                    <QtyButton
                      label={`Remove one ${item.name}`}
                      onClick={() => setQty(item.id, item.qty - 1)}
                    >
                      <path d="M5 12h14" />
                    </QtyButton>
                    <span
                      className="min-w-8 text-center text-sm font-bold tabular-nums"
                      aria-live="polite"
                    >
                      {item.qty}
                    </span>
                    <QtyButton
                      label={`Add one ${item.name}`}
                      onClick={() => setQty(item.id, item.qty + 1)}
                    >
                      <path d="M12 5v14M5 12h14" />
                    </QtyButton>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="text-xs font-semibold text-sand-400 transition-colors hover:text-danger-600"
                  >
                    Remove
                  </button>

                  <p className="price ml-auto text-base text-sand-900">
                    {item.price * item.qty}
                    <span className="ml-1 text-xs font-medium text-sand-400">
                      ETB
                    </span>
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-5 sm:p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Summary
        </h2>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-sand-500">Subtotal</dt>
            <dd className="price text-sand-800">{total} ETB</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sand-500">Delivery</dt>
            <dd className="text-sand-500">Calculated at checkout</dd>
          </div>
        </dl>

        <div className="divider my-4" />

        <div className="flex items-baseline justify-between">
          <span className="font-semibold text-sand-900">Total</span>
          <p className="price text-2xl text-brand-700">
            {total}
            <span className="ml-1 text-sm font-medium text-sand-400">ETB</span>
          </p>
        </div>

        <Link href="/checkout" className="btn btn-primary mt-5 w-full py-3">
          Go to checkout
        </Link>
        <Link
          href="/menu"
          className="btn btn-outline mt-2 w-full"
        >
          Add more dishes
        </Link>
      </section>
    </div>
  );
}

function QtyButton({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-full text-sand-500 transition-colors hover:bg-sand-100 hover:text-sand-900"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        className="h-3.5 w-3.5"
      >
        {children}
      </svg>
    </button>
  );
}
