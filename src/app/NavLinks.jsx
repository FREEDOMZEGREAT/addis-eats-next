"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks({ items }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="ml-2 hidden md:block">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors " +
                  (active
                    ? "bg-brand-50 text-brand-800"
                    : "text-sand-600 hover:bg-sand-100 hover:text-sand-900")
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
