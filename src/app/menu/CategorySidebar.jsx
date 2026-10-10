"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { categories, countByCategory, categoryMeta } from "@/lib/dishes";

const counts = countByCategory();

export default function CategorySidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") || "All";

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="card p-5">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Categories
        </h2>

        <ul className="mt-4 space-y-1">
          {categories.map((category) => {
            const isActive = active === category;
            // Preserve the search term when switching category.
            const params = new URLSearchParams(searchParams.toString());
            if (category === "All") params.delete("category");
            else params.set("category", category);
            const qs = params.toString();

            return (
              <li key={category}>
                <Link
                  href={qs ? `${pathname}?${qs}` : pathname}
                  scroll={false}
                  aria-current={isActive ? "true" : undefined}
                  className={
                    "group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors " +
                    (isActive
                      ? "bg-brand-700 text-white shadow-soft"
                      : "text-sand-600 hover:bg-sand-100 hover:text-sand-900")
                  }
                >
                  <span className="flex flex-col">
                    <span className="text-sm font-semibold">{category}</span>
                  </span>
                  <span
                    className={
                      "shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem] font-bold tabular-nums " +
                      (isActive
                        ? "bg-white/20 text-white"
                        : "bg-sand-100 text-sand-500 group-hover:bg-white")
                    }
                  >
                    {counts[category]}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 rounded-xl bg-sand-50 p-4">
          <p className="text-xs font-semibold text-sand-700">Delivery</p>
          <p className="mt-1 text-xs leading-relaxed text-sand-500">
            Bole, Kazanchis, Piassa and Megenagna. 30–45 minutes, cooked to
            order.
          </p>
        </div>
      </div>
    </aside>
  );
}
