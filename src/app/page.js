import Link from "next/link";
import { getDishes, getRestaurantInfo } from "@/lib/dishes";
import { SITE_URL, SOCIAL_IMAGE, serializeJsonLd } from "@/lib/site";
import DishList from "./menu/DishList";

export const revalidate = 3600;

export const metadata = {
  title: "Ethiopian Food Delivery in Addis Ababa",
  description:
    "Traditional Ethiopian dishes cooked the way our grandmothers taught us. Injera, kitfo, shiro and coffee, delivered across Addis Ababa.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Ethiopian Food Delivery in Addis Ababa | Addis Eats",
    description:
      "Traditional Ethiopian dishes cooked the way our grandmothers taught us. Injera, kitfo, shiro and coffee, delivered across Addis Ababa.",
    url: "/",
    images: [SOCIAL_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ethiopian Food Delivery in Addis Ababa | Addis Eats",
    description:
      "Traditional Ethiopian dishes cooked the way our grandmothers taught us. Injera, kitfo, shiro and coffee, delivered across Addis Ababa.",
    images: [SOCIAL_IMAGE],
  },
};

export default async function HomePage() {
  const [info, allDishes] = await Promise.all([
    getRestaurantInfo(),
    getDishes(),
  ]);
  const specialIds = new Set([1, 2, 14]);
  const specials = allDishes.filter((dish) => specialIds.has(dish.id));
  const restaurantJsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: info.name,
    description: info.tagline,
    url: SITE_URL,
    image: new URL(SOCIAL_IMAGE, SITE_URL).toString(),
    servesCuisine: "Ethiopian",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bole Road",
      addressLocality: "Addis Ababa",
      addressCountry: "ET",
    },
    openingHours: "Mo-Su 11:00-22:00",
    menu: `${SITE_URL}/menu`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(restaurantJsonLd) }}
      />
      <Hero info={info} />

      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6 sm:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">From our kitchen</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Today&apos;s Specials
            </h2>
          </div>
          <Link
            href="/menu"
            className="text-sm font-semibold text-brand-700 hover:underline"
          >
            View full menu
          </Link>
        </div>
        <DishList dishes={specials} />
      </section>
    </>
  );
}

function Hero({ info }) {
  return (
    <section className="relative overflow-hidden bg-brand-950">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(60%_60%_at_75%_20%,rgba(223,169,61,0.22),transparent_60%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(45%_55%_at_10%_90%,rgba(171,51,73,0.35),transparent_60%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-5 py-20 sm:px-6 sm:py-24">
        <p className="eyebrow text-gold-300">
          <span className="h-px w-8 bg-gold-400/60" />
          {info.address}
        </p>

        <h1 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-6xl">
          {info.tagline}
        </h1>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-brand-100/80">
          Injera fermented for three days, berbere ground in-house, and every
          wat simmered low until it tastes like it should. Order for delivery
          across Addis Ababa.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/menu" className="btn btn-accent px-5 py-3 text-base">
            Browse the menu
          </Link>
          <Link
            href="/orders"
            className="btn px-5 py-3 text-base border-white/25 bg-white/5 text-white hover:bg-white/10 hover:border-white/40"
          >
            Your orders
          </Link>
        </div>
      </div>
    </section>
  );
}
