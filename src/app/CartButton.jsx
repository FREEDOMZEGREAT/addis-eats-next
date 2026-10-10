"use client";

import Link from "next/link";
import { useCart } from "./providers";

export default function CartButton() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      className="btn btn-primary"
      aria-label={
        count > 0 ? `Cart, ${count} item${count === 1 ? "" : "s"}` : "Cart, empty"
      }
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M2.5 3h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5l1.4-7.3H6" />
        <circle cx="9.5" cy="20" r="1.25" />
        <circle cx="17.5" cy="20" r="1.25" />
      </svg>
      <span className="hidden sm:inline">Cart</span>
      <span
        className={
          "grid h-5 min-w-5 place-items-center rounded-full px-1 text-[0.6875rem] font-bold tabular-nums " +
          (count > 0 ? "bg-gold-400 text-sand-950" : "bg-white/15 text-white/70")
        }
      >
        {count}
      </span>
    </Link>
  );
}
