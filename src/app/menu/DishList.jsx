import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import { getMenuSection } from "@/lib/dishes";

export default function DishList({ dishes }) {
  if (!dishes || dishes.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {dishes.map((dish, index) => (
        <DishCard key={dish.id} dish={dish} preload={index === 0} />
      ))}
    </ul>
  );
}

function DishCard({ dish, preload }) {
  return (
    <li className="group card flex flex-col overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:border-sand-300 hover:shadow-lift">
      <Link
        href={`/menu/${dish.id}`}
        className="relative block aspect-4/3 overflow-hidden bg-sand-100"
      >
        <Image
          src={dish.image}
          alt={dish.imageAlt || dish.name}
          fill
          sizes="(min-width: 1280px) 22rem, (min-width: 640px) 45vw, 92vw"
          quality={35}
          preload={preload}
          fetchPriority={preload ? "high" : "auto"}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <span className="absolute left-3 top-3">
          <span className="badge bg-white/90 text-sand-700 shadow-soft backdrop-blur-sm">
            {getMenuSection(dish)}
          </span>
        </span>
        {dish.tags?.length > 0 && (
          <span className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
            {dish.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className={
                  "badge backdrop-blur-sm " +
                  (tag === "Vegan"
                    ? "bg-success-100/95 text-success-700"
                    : tag === "Spicy"
                      ? "bg-brand-700/95 text-white"
                      : "bg-gold-100/95 text-gold-800")
                }
              >
                {tag}
              </span>
            ))}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-xl font-semibold tracking-tight text-sand-900">
            <Link
              href={`/menu/${dish.id}`}
              className="transition-colors hover:text-brand-700"
            >
              {dish.name}
            </Link>
          </h3>
          <p className="price shrink-0 text-lg text-brand-700">
            {dish.price}
            <span className="ml-1 text-xs font-medium text-sand-400">ETB</span>
          </p>
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-sand-100 pt-4">
          <AddToCartButton dish={dish} />
          <Link
            href={`/menu/${dish.id}`}
            className="ml-auto text-sm font-semibold text-sand-500 transition-colors hover:text-brand-700"
          >
            Details
          </Link>
        </div>
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="card grid place-items-center px-6 py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sand-100 text-sand-400">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-7 w-7"
        >
          <path d="M3 2v8a3 3 0 0 0 3 3h1.5a2.5 2.5 0 0 1 0 5H4" />
          <path d="M7 2v20M16 2v7a3 3 0 0 0 3 3h2V2h-5Z" />
        </svg>
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold">
        Nothing on this shelf
      </h3>
      <p className="mt-1 max-w-xs text-sm text-sand-500">
        Try another category, or clear the search to see the whole table.
      </p>
    </div>
  );
}
