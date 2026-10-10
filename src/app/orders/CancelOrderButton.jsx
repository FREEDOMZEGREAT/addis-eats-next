"use client";

import { useTransition } from "react";
import { cancelOrder } from "@/app/actions";

export default function CancelOrderButton({ orderId }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => cancelOrder(orderId))}
      className="btn btn-danger mt-2 px-0 text-xs"
    >
      {pending ? (
        <>
          <span className="spinner h-3! w-3! border-2!" aria-hidden="true" />
          Cancelling…
        </>
      ) : (
        "Cancel order"
      )}
    </button>
  );
}
