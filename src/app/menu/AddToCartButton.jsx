"use client";

import { useState, useTransition } from "react";
import { useCart } from "@/app/providers";

export default function AddToCartButton({ dish, size = "sm" }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [pending, startTransition] = useTransition();

  const compact = size === "sm";

  function handleClick() {
    startTransition(() => {
      addToCart(dish);
      setAdded(true);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-live="polite"
      className={compact ? "btn btn-outline" : "btn btn-accent w-full py-3"}
    >
      {pending ? (
        <>
          <span className="spinner" aria-hidden="true" />
          Adding…
        </>
      ) : added ? (
        <>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m4.5 12.5 5 5 10-11" />
          </svg>
          Added
        </>
      ) : (
        <>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add to cart
        </>
      )}
    </button>
  );
}
