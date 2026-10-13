const ETB_CURRENCY = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0,
});

const INTEGER_NUMBER = new Intl.NumberFormat("en-ET", {
  maximumFractionDigits: 0,
});

export const ORDER_STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function formatCurrency(value, currency = "ETB") {
  const amount = Number(value) || 0;
  if (currency && currency !== "ETB") {
    try {
      return new Intl.NumberFormat("en-ET", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `${INTEGER_NUMBER.format(amount)} ${currency}`;
    }
  }
  return ETB_CURRENCY.format(amount);
}

export function formatInteger(value) {
  return INTEGER_NUMBER.format(Number(value) || 0);
}

export function formatStatus(status) {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function formatDateTime(iso, options = {}) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  }).format(date);
}

export function formatDate(iso, options = {}) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    ...options,
  }).format(date);
}

export function formatDistance(meters) {
  const value = Number(meters) || 0;
  if (value < 1000) return `${Math.round(value)} m`;
  return `${(value / 1000).toFixed(1)} km`;
}

export function formatMinutes(totalMinutes) {
  const minutes = Math.max(0, Math.round(Number(totalMinutes) || 0));
  if (minutes === 0) return "just now";
  if (minutes === 1) return "about 1 min";
  return `about ${minutes} mins`;
}