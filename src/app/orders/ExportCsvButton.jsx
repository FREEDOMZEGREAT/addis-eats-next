"use client";

import { downloadCsv, ordersToCsv } from "@/lib/csv";

export default function ExportCsvButton({ orders, label = "Export CSV" }) {
  function exportHistory() {
    const filename = `addis-eats-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(filename, ordersToCsv(orders ?? []));
  }

  return (
    <button type="button" onClick={exportHistory} className="btn btn-outline">
      {label}
    </button>
  );
}