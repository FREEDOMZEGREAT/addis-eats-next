"use client";

import { SWRConfig } from "swr";

// Shared in-memory SWR cache for the whole app. Every useSWR key is deduped
// and cached for the session, so revisiting a search or order status does not
// refetch. No persistence: cached data stays in memory and clears on reload.
const swrConfig = {
  revalidateOnFocus: false,
  keepPreviousData: true,
  dedupingInterval: 5_000,
  errorRetryCount: 2,
};

export default function SwrProvider({ children }) {
  return <SWRConfig value={swrConfig}>{children}</SWRConfig>;
}
