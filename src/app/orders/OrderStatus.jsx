"use client";

import { useEffect, useState } from "react";

const STATUS_STYLES = {
  pending: "badge-gold",
  confirmed: "badge-brand",
  preparing: "badge-brand",
  delivered: "badge-success",
  cancelled: "badge-danger",
};

const FINAL_STATUSES = new Set(["delivered", "cancelled"]);

export default function OrderStatus({ order }) {
  const [status, setStatus] = useState(order.status);

  useEffect(() => {
    if (FINAL_STATUSES.has(status)) return;

    const interval = setInterval(() => {
      fetch(`/api/orders/${order.id}`, { cache: "no-store" })
        .then((response) => {
          if (!response.ok) throw new Error("Order status request failed");
          return response.json();
        })
        .then((latestOrder) => setStatus(latestOrder.status))
        .catch(() => {});
    }, 10_000);

    return () => clearInterval(interval);
  }, [order.id, status]);

  return (
    <span className={`badge ${STATUS_STYLES[status] ?? "badge-neutral"}`}>
      {status}
    </span>
  );
}
