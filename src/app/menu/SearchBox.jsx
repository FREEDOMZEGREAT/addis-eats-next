"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import DishList from "./DishList";

export default function LiveDishSearch({
  initialCategory,
  initialQuery,
  initialDishes,
}) {
  const [search, setSearch] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const query = debouncedSearch;
  const params = new URLSearchParams({
    category: initialCategory === "All" ? "" : initialCategory,
    q: query,
  });
  const searchKey =
    query === initialQuery ? null : `/api/dishes?${params.toString()}`;
  const { data, error, isLoading, isValidating } = useSWR(searchKey, fetcher, {
    keepPreviousData: true,
  });

  const dishes = query === initialQuery ? initialDishes : (data ?? []);
  const isFetching = query !== initialQuery && (isLoading || isValidating);
  const itemCount = dishes.length;

  return (
    <section className="space-y-5" aria-label="Live menu search">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <label htmlFor="live-menu-search" className="sr-only">
            Search dishes
          </label>
          <input
            id="live-menu-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search dishes, ingredients, or tags…"
            className="field w-full sm:max-w-md"
          />
        </div>
        <div className="text-sm text-sand-500" aria-live="polite">
          {isFetching
            ? "Updating results…"
            : `${itemCount} ${itemCount === 1 ? "dish" : "dishes"}`}
        </div>
      </div>

      {error ? (
        <p className="text-sm text-danger-700">
          Could not load the menu right now.
        </p>
      ) : null}

      <DishList dishes={dishes} />
    </section>
  );
}
