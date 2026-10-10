import { Suspense } from "react";
import { getDishesByCategory, categories } from "@/lib/dishes";
import CategoryBar from "./CategoryBar";
import LiveDishSearch from "./SearchBox";
import { SITE_URL, SOCIAL_IMAGE, serializeJsonLd } from "@/lib/site";
export const revalidate = 3600;

export const metadata = {
  title: "Menu",
  description: "Every dish we serve — mains, sides and drinks.",
  alternates: {
    canonical: "/menu",
  },
  openGraph: {
    title: "Addis Eats Menu",
    description: "Explore Ethiopian dishes, sides, and drinks from Addis Eats.",
    url: "/menu",
    images: [SOCIAL_IMAGE],
  },
};

export default async function MenuPage({ searchParams }) {
  const params = await searchParams;
  const raw = params?.category;
  const category = categories.includes(raw) ? raw : "All";
  const query = typeof params?.q === "string" ? params.q.trim() : "";
  const dishes = await getDishesByCategory(category, query);
  const menuJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category === "All" ? "Addis Eats Menu" : `${category} Menu`,
    itemListElement: dishes.map((dish, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/menu/${dish.id}`,
      name: dish.name,
    })),
  };

  return (
    <div className="space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(menuJsonLd) }}
      />
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Kitchen</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Our menu
          </h1>
          <p className="mt-2 text-sm text-sand-500">
            {category === "All" ? "Every dish we serve" : category}
          </p>
        </div>
        <Suspense fallback={<CategoryBarFallback />}>
          <CategoryBar showSearch={false} />
        </Suspense>
      </header>

      <LiveDishSearch
        key={`${category}:${query}`}
        initialCategory={category}
        initialQuery={query}
        initialDishes={dishes}
      />
    </div>
  );
}

function CategoryBarFallback() {
  return (
    <div className="space-y-4">
      <div className="h-11 w-full max-w-sm skeleton" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9.5 w-24 rounded-full skeleton" />
        ))}
      </div>
    </div>
  );
}
