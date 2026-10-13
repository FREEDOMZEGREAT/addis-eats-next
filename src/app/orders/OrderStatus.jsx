"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";

const STATUS_STYLES = {
  pending: "badge-gold",
  confirmed: "badge-brand",
  preparing: "badge-brand",
  delivered: "badge-success",
  cancelled: "badge-danger",
};

const FINAL_STATUSES = new Set(["delivered", "cancelled"]);

export default function OrderStatus({ order }) {
  const orderStatusUrl = FINAL_STATUSES.has(order.status)
    ? null
    : `/api/orders/${order.id}`;
  const { data } = useSWR(orderStatusUrl, fetcher, {
    fallbackData: { status: order.status },
    refreshInterval: (latestOrder) =>
      latestOrder && FINAL_STATUSES.has(latestOrder.status) ? 0 : 10_000,
  });
  const status = data?.status ?? order.status;

  return (
    <span className={`badge ${STATUS_STYLES[status] ?? "badge-neutral"}`}>
      {status}
    </span>
  );
}
