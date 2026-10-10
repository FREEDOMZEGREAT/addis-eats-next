"use client";

import { useEffect, useState } from "react";
import DishList from "./DishList";

export default function LiveDishSearch({
  initialCategory,
  initialQuery,
  initialDishes,
}) {
  const [search, setSearch] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);
  const [results, setResults] = useState(initialDishes);
  const [completedQuery, setCompletedQuery] = useState(initialQuery);
  const [errorQuery, setErrorQuery] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const query = debouncedSearch;

  useEffect(() => {
    if (query === initialQuery) return;

    const controller = new AbortController();
    const params = new URLSearchParams({
      category: initialCategory === "All" ? "" : initialCategory,
      q: query,
    });

    fetch(`/api/dishes?${params}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Menu request failed");
        return response.json();
      })
      .then((data) => {
        setResults(data);
        setCompletedQuery(query);
        setErrorQuery(null);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setErrorQuery(query);
      });

    return () => controller.abort();
  }, [initialCategory, initialQuery, query]);

  const dishes = query === initialQuery ? initialDishes : results;
  const isFetching =
    query !== initialQuery && completedQuery !== query && errorQuery !== query;
  const error = errorQuery === query;
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
