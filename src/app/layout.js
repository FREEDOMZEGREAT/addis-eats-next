import "./globals.css";
import Link from "next/link";
import { Inter, Fraunces } from "next/font/google";
import { Providers } from "./providers";
import SwrProvider from "./swr-provider";
import NavLinks from "./NavLinks";
import CartButton from "./CartButton";
import { SITE_URL, SOCIAL_IMAGE } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans-body",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-face",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Addis Eats | Ethiopian Food Delivery in Addis Ababa",
    template: "%s · Addis Eats",
  },
  description:
    "Order traditional Ethiopian food in Addis Ababa. Enjoy injera, doro wat, kitfo, shiro, and freshly brewed coffee, delivered from Addis Eats.",
  openGraph: {
    title: "Addis Eats | Ethiopian Food Delivery in Addis Ababa",
    description:
      "Traditional Ethiopian dishes, injera, and coffee delivered across Addis Ababa.",
    siteName: "Addis Eats",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: SOCIAL_IMAGE,
        alt: "Ethiopian food from Addis Eats in Addis Ababa",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Addis Eats | Ethiopian Food Delivery in Addis Ababa",
    description:
      "Traditional Ethiopian dishes, injera, and coffee delivered across Addis Ababa.",
    images: [SOCIAL_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

const navItems = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
  { href: "/orders", label: "Orders" },
  { href: "/signin", label: "Sign in" },
];

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-sand-50 font-sans text-sand-900 antialiased">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-field focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
          >
            Skip to content
          </a>

          <header className="sticky top-0 z-40 border-b border-sand-200 bg-white/85 shadow-nav backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-3.5 sm:px-6">
              <Link
                href="/"
                className="group flex shrink-0 items-center gap-2.5"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 font-display text-lg font-semibold leading-none text-gold-300 shadow-soft transition-colors group-hover:bg-brand-800">
                  A
                </span>
                <span className="flex flex-col leading-none">
                  <span className="font-display text-lg font-semibold tracking-tight text-sand-900">
                    Addis <span className="text-orange-300">Eats</span>
                  </span>
                  <span className="mt-0.5 hidden text-[0.6875rem] font-medium tracking-wide text-sand-500 sm:block">
                    Bole Road · Addis Ababa
                  </span>
                </span>
              </Link>

              <NavLinks items={navItems} />

              <div className="ml-auto flex shrink-0 items-center gap-2">
                <CartButton />
              </div>
            </div>
          </header>

          <main id="main" className="flex-1">
            <SwrProvider>{children}</SwrProvider>
          </main>

          <footer className="mt-16 border-t border-sand-200 bg-white">
            <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-12 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr]">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-700 font-display text-lg font-semibold leading-none text-orange-300">
                    A
                  </span>
                  <span className="font-display text-lg font-semibold tracking-tight">
                    Addis <span className="text-orange-300">Eats</span>
                  </span>
                </div>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-sand-500">
                  Home cooking from Addis Ababa. Since 2025 we&rsquo;ve served
                  traditional Ethiopian dishes cooked the way our grandmothers
                  taught us.
                </p>
              </div>

              <div>
                <h2 className="font-display text-sm font-semibold tracking-wide text-sand-900">
                  Explore
                </h2>
                <ul className="mt-3 space-y-2">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm text-sand-500 transition-colors hover:text-brand-700"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="font-display text-sm font-semibold tracking-wide text-sand-900">
                  Visit
                </h2>
                <address className="mt-3 space-y-2 text-sm not-italic text-sand-500">
                  <p>Bole Road, Addis Ababa</p>
                  <p>Every day · 11:00 – 22:00</p>
                  <p>
                    <a
                      href="tel:+251115550123"
                      className="transition-colors hover:text-brand-700"
                    >
                      +251 918072093
                    </a>
                  </p>
                </address>
              </div>
            </div>

            <div className="border-t border-sand-200">
              <p className="mx-auto w-full max-w-6xl px-5 py-5 text-xs text-sand-400 sm:px-6">
                © {new Date().getFullYear()} Addis Eats. prepared by Netsanet
                Degu.
              </p>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
