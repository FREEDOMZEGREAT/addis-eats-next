"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { categories, countByCategory } from "@/lib/dishes";

const counts = countByCategory();

export default function CategoryBar({ showSearch = true }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const active = searchParams.get("category") || "All";
  const queryParam = searchParams.get("q") || "";
  const [draft, setDraft] = useState(queryParam);
  const [syncedQuery, setSyncedQuery] = useState(queryParam);
  if (queryParam !== syncedQuery) {
    setSyncedQuery(queryParam);
    setDraft(queryParam);
  }

  function push(overrides) {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(overrides)) {
      if (!value || value === "All") params.delete(key);
      else params.set(key, value);
    }

    const qs = params.toString();
    // Reset scroll so the grid does not jump when the list swaps out.
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  }

  function onSubmitSearch(event) {
    event.preventDefault();
    push({ q: draft });
  }

  return (
    <div className="space-y-4">
      {showSearch && (
        <form
          onSubmit={onSubmitSearch}
          role="search"
          className="relative max-w-sm"
        >
          <label htmlFor="menu-search" className="sr-only">
            Search the menu
          </label>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-400"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            id="menu-search"
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Search dishes — kitfo, shiro, coffee…"
            className="field pl-10"
          />
        </form>
      )}

      <div
        role="group"
        aria-label="Filter by category"
        className="-mx-5 flex flex-wrap gap-2 px-5 sm:mx-0 sm:px-0"
      >
        {categories.map((category) => {
          const isActive = active === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => push({ category })}
              disabled={pending}
              aria-pressed={isActive}
              className="chip"
            >
              {category}
              <span className="chip-count">{counts[category]}</span>
            </button>
          );
        })}

        {queryParam && (
          <button
            type="button"
            onClick={() => {
              setDraft("");
              push({ q: "" });
            }}
            disabled={pending}
            className="chip"
          >
            <span className="text-sand-500">&ldquo;{queryParam}&rdquo;</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-3.5 w-3.5"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
            <span className="sr-only">Clear search</span>
          </button>
        )}
      </div>
    </div>
  );
}
