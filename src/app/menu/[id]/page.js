import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDishes, getDish, getMenuSection } from "@/lib/dishes";
import { SITE_URL, serializeJsonLd } from "@/lib/site";
import AddToCartButton from "../AddToCartButton";

export async function generateStaticParams() {
  const dishes = await getDishes();
  return dishes.map((d) => ({ id: String(d.id) }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const dish = await getDish(id);
  if (!dish) return { title: "Dish not found" };
  return {
    title: dish.name,
    description: dish.description,
    alternates: {
      canonical: `/menu/${dish.id}`,
    },
    openGraph: {
      title: dish.name,
      description: dish.description,
      url: `/menu/${dish.id}`,
      images: [dish.image],
    },
    twitter: {
      card: "summary_large_image",
      title: dish.name,
      description: dish.description,
      images: [dish.image],
    },
  };
}

export default async function DishPage({ params }) {
  const { id } = await params;
  const dish = await getDish(id);
  if (!dish) notFound();
  const menuSection = getMenuSection(dish);

  return (
    <article className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-6 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd({
            "@context": "https://schema.org",
            "@type": "Product",
            name: dish.name,
            description: dish.description,
            image: new URL(dish.image, SITE_URL).toString(),
            category: menuSection,
            offers: {
              "@type": "Offer",
              url: `${SITE_URL}/menu/${dish.id}`,
              priceCurrency: "ETB",
              price: String(dish.price),
              availability: "https://schema.org/InStock",
            },
          }),
        }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-sand-500">
          <li>
            <Link href="/" className="transition-colors hover:text-brand-700">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-sand-300">
            /
          </li>
          <li>
            <Link
              href="/menu"
              className="transition-colors hover:text-brand-700"
            >
              Menu
            </Link>
          </li>
          <li aria-hidden="true" className="text-sand-300">
            /
          </li>
          <li>
            <Link
              href={`/menu?category=${encodeURIComponent(menuSection)}`}
              className="transition-colors hover:text-brand-700"
            >
              {menuSection}
            </Link>
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-4/3 overflow-hidden rounded-card bg-sand-100 shadow-card lg:aspect-square">
          <Image
            src={dish.image}
            alt={dish.imageAlt || dish.name}
            fill
            priority
            sizes="(min-width: 1024px) 32rem, 92vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/menu?category=${encodeURIComponent(menuSection)}`}
              className="badge badge-brand hover:bg-brand-200"
            >
              {menuSection}
            </Link>
            {dish.tags?.map((tag) => (
              <span
                key={tag}
                className={
                  "badge " +
                  (tag === "Vegan"
                    ? "badge-success"
                    : tag === "Spicy"
                      ? "badge-danger"
                      : "badge-gold")
                }
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {dish.name}
          </h1>

          <p className="mt-3 text-lg text-sand-500">{dish.description}</p>

          <p className="mt-6 text-3xl font-bold tracking-tight text-brand-700">
            {dish.price}
            <span className="ml-1.5 text-base font-medium text-sand-400">
              ETB
            </span>
          </p>

          {dish.longDescription && (
            <p className="mt-6 border-t border-sand-200 pt-6 text-sm leading-relaxed text-sand-500">
              {dish.longDescription}
            </p>
          )}

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Ready in</dt>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-sand-400"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <dd className="text-sand-600">
                Ready in ~{dish.prepMinutes} min
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <dt className="sr-only">Delivery</dt>
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 text-sand-400"
              >
                <path d="M3 16V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v9M15 9h3.5a1 1 0 0 1 .8.4l2.2 3.1a1 1 0 0 1 .2.6V16h-2.5" />
                <circle cx="7" cy="17.5" r="1.75" />
                <circle cx="17.5" cy="17.5" r="1.75" />
              </svg>
              <dd className="text-sand-600">Delivery across Addis Ababa</dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-sand-200 pt-6">
            <div className="w-full sm:w-auto">
              <AddToCartButton dish={dish} size="lg" />
            </div>
            <Link
              href={`/menu?category=${encodeURIComponent(menuSection)}`}
              className="btn btn-outline"
            >
              More {menuSection.toLowerCase()}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
