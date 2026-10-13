import { getDishName } from "./dishes";
import { formatDateTime, formatStatus } from "./format";

export function csvCell(value) {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function jsonToCsv(headers, rows) {
  const lines = [headers.map(csvCell).join(",")];
  for (const row of rows) lines.push(row.map(csvCell).join(","));
  return lines.join("\r\n");
}

export function ordersToCsv(orders = []) {
  const headers = [
    "Order",
    "Placed",
    "Customer",
    "Phone",
    "Area",
    "Address",
    "Items",
    "Subtotal",
    "Delivery fee",
    "Total",
    "Currency",
    "Status",
  ];

  const rows = orders.map((order) => [
    order.id,
    formatDateTime(order.createdAt),
    order.name,
    order.phone,
    order.area,
    order.address ?? "",
    order.items
      .map((item) => `${item.qty} x ${getDishName(item.id)}`)
      .join("; "),
    order.subtotal,
    order.deliveryFee,
    order.total,
    order.currency ?? "ETB",
    formatStatus(order.status),
  ]);

  return jsonToCsv(headers, rows);
}

export function downloadCsv(filename, csv) {
  if (typeof document === "undefined") {
    throw new Error("downloadCsv can only run in the browser.");
  }

  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}