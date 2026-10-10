import Link from "next/link";
import { redirect } from "next/navigation";
import { dishes } from "@/lib/dishes";
import { DELIVERY_AREAS } from "@/lib/schema";
import { getAllOrders } from "@/lib/orders";
import { getSession } from "@/lib/session";
import SignOutButton from "@/app/SignOutButton";
import RevenueCharts from "./RevenueCharts";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin dashboard",
  description: "Order activity and sales summaries for Addis Eats staff.",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 10;
const CURRENCY = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0,
});
const DATE_TIME = new Intl.DateTimeFormat("en-ET", {
  dateStyle: "medium",
  timeStyle: "short",
});
const STATUS_STYLES = {
  pending: "badge-gold",
  confirmed: "badge-brand",
  preparing: "badge-brand",
  delivered: "badge-success",
  cancelled: "badge-danger",
};
const SORT_KEYS = ["date", "customer", "area", "status", "total"];

export default async function AdminPage({ searchParams }) {
  const user = await getSession();
  if (!user) redirect("/signin?next=%2Fadmin");
  if (user.role !== "staff") redirect("/orders");

  const params = (await searchParams) ?? {};
  const sort = SORT_KEYS.includes(params.sort) ? params.sort : "date";
  const direction = params.dir === "asc" ? "asc" : "desc";
  const parsedPage = Number.parseInt(params.page ?? "1", 10);
  const requestedPage = Number.isNaN(parsedPage) ? 1 : Math.max(1, parsedPage);
  const orders = await getAllOrders();
  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const activeValue = activeOrders.reduce((sum, order) => sum + order.total, 0);
  const openOrders = orders.filter((order) =>
    ["pending", "confirmed", "preparing"].includes(order.status),
  ).length;
  const areaData = DELIVERY_AREAS.map((area) => ({
    area,
    total: activeOrders
      .filter((order) => order.area === area)
      .reduce((sum, order) => sum + order.total, 0),
  })).sort((first, second) => second.total - first.total);
  const orderTrend = getOrderTrend(orders);

  const sortedOrders = [...orders].sort((first, second) => {
    const comparison = compareOrders(first, second, sort);
    return direction === "asc" ? comparison : -comparison;
  });
  const pageCount = Math.max(1, Math.ceil(sortedOrders.length / PAGE_SIZE));
  const page = Math.min(requestedPage, pageCount);
  const pageOrders = sortedOrders.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const firstRow = sortedOrders.length ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastRow = Math.min(page * PAGE_SIZE, sortedOrders.length);

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Staff · {user.email}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Admin dashboard
          </h1>
          <p className="mt-2 text-sm text-sand-500">
            Order activity and value across Addis Eats.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/kitchen" className="btn btn-outline">
            Kitchen queue
          </Link>
          <SignOutButton />
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <p className="eyebrow mb-3">Workspace</p>
          <nav
            aria-label="Admin sections"
            className="flex gap-2 overflow-x-auto border-b border-sand-200 pb-2 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-l lg:pb-0"
          >
            <Link
              href="#dashboard"
              className="shrink-0 border-b-2 border-brand-700 px-3 py-2.5 text-sm font-semibold text-brand-800 lg:-ml-px lg:border-b-0 lg:border-l-2"
            >
              Admin Dashboard
            </Link>
            <Link
              href="#orders-heading"
              className="shrink-0 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-sand-600 transition-colors hover:border-sand-400 hover:text-sand-900 lg:-ml-px lg:border-b-0 lg:border-l-2"
            >
              Order Management
            </Link>
            <Link
              href="#menu-management"
              className="shrink-0 border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-sand-600 transition-colors hover:border-sand-400 hover:text-sand-900 lg:-ml-px lg:border-b-0 lg:border-l-2"
            >
              Menu Management
            </Link>
          </nav>
        </aside>

        <div className="min-w-0 space-y-10">
          <div id="dashboard" className="scroll-mt-28 space-y-8">
            <section
              aria-label="Order summary"
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            >
              <SummaryMetric
                label="All orders"
                value={orders.length}
                detail="Including cancelled"
              />
              <SummaryMetric
                label="Open orders"
                value={openOrders}
                detail="Pending, confirmed, or preparing"
              />
              <SummaryMetric
                label="Active order value"
                value={CURRENCY.format(activeValue)}
                detail="Excludes cancelled orders"
              />
              <SummaryMetric
                label="Average order value"
                value={CURRENCY.format(
                  activeOrders.length ? activeValue / activeOrders.length : 0,
                )}
                detail="Across non-cancelled orders"
              />
            </section>

            <RevenueCharts areaData={areaData} orderTrend={orderTrend} />
          </div>

          <section aria-labelledby="orders-heading" className="scroll-mt-28">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Order records</p>
                <h2
                  id="orders-heading"
                  className="mt-1 font-display text-2xl font-semibold tracking-tight"
                >
                  All orders
                </h2>
              </div>
              <p
                className="text-sm tabular-nums text-sand-500"
                aria-live="polite"
              >
                Showing {firstRow}–{lastRow} of {sortedOrders.length}
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="card px-6 py-12 text-center">
                <h3 className="font-display text-xl font-semibold">
                  No orders yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-sand-500">
                  Orders will appear here with their status, delivery area, and
                  value once customers start placing them.
                </p>
              </div>
            ) : (
              <>
                <div className="card overflow-hidden">
                  <div
                    className="overflow-x-auto"
                    aria-label="Scrollable order table"
                    role="region"
                    tabIndex={0}
                  >
                    <table className="w-full min-w-190 border-collapse text-left text-sm">
                      <caption className="sr-only">
                        Addis Eats orders, sorted by {sort} in {direction}ending
                        order
                      </caption>
                      <thead className="bg-sand-100 text-xs uppercase text-sand-600">
                        <tr>
                          <SortableHeader
                            label="Order"
                            sortKey="date"
                            sort={sort}
                            direction={direction}
                          />
                          <SortableHeader
                            label="Customer"
                            sortKey="customer"
                            sort={sort}
                            direction={direction}
                          />
                          <SortableHeader
                            label="Area"
                            sortKey="area"
                            sort={sort}
                            direction={direction}
                          />
                          <SortableHeader
                            label="Status"
                            sortKey="status"
                            sort={sort}
                            direction={direction}
                          />
                          <SortableHeader
                            label="Total"
                            sortKey="total"
                            sort={sort}
                            direction={direction}
                            numeric
                          />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-sand-200">
                        {pageOrders.map((order) => (
                          <tr
                            key={order.id}
                            className="bg-white hover:bg-sand-50"
                          >
                            <td className="px-4 py-3.5">
                              <span className="block font-mono text-xs font-semibold text-sand-800">
                                {order.id}
                              </span>
                              <time
                                className="mt-1 block text-xs text-sand-500"
                                dateTime={order.createdAt}
                              >
                                {DATE_TIME.format(new Date(order.createdAt))}
                              </time>
                            </td>
                            <td className="px-4 py-3.5 font-medium text-sand-800">
                              {order.name}
                            </td>
                            <td className="px-4 py-3.5 text-sand-600">
                              {order.area}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`badge ${STATUS_STYLES[order.status] ?? "badge-neutral"}`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right font-mono tabular-nums text-sand-800">
                              {CURRENCY.format(order.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {pageCount > 1 && (
                  <nav
                    aria-label="Order table pages"
                    className="mt-4 flex items-center justify-between gap-3"
                  >
                    <p className="text-sm text-sand-500">
                      Page {page} of {pageCount}
                    </p>
                    <div className="flex gap-2">
                      <PageLink
                        page={page - 1}
                        disabled={page === 1}
                        sort={sort}
                        direction={direction}
                      >
                        Previous
                      </PageLink>
                      <PageLink
                        page={page + 1}
                        disabled={page === pageCount}
                        sort={sort}
                        direction={direction}
                      >
                        Next
                      </PageLink>
                    </div>
                  </nav>
                )}
              </>
            )}
          </section>

          <section
            id="menu-management"
            aria-labelledby="menu-management-heading"
            className="scroll-mt-28"
          >
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Catalog</p>
                <h2
                  id="menu-management-heading"
                  className="mt-1 font-display text-2xl font-semibold tracking-tight"
                >
                  Menu Management
                </h2>
              </div>
              <p className="text-sm text-sand-500">
                {dishes.length} menu items
              </p>
            </div>

            <div className="card overflow-hidden">
              <div
                className="overflow-x-auto"
                aria-label="Scrollable menu catalog"
                role="region"
                tabIndex={0}
              >
                <table className="w-full min-w-160 border-collapse text-left text-sm">
                  <caption className="sr-only">
                    Menu items with categories, preparation time, and price
                  </caption>
                  <thead className="bg-sand-100 text-xs uppercase text-sand-600">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Item
                      </th>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Category
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right font-semibold"
                      >
                        Prep time
                      </th>
                      <th
                        scope="col"
                        className="px-4 py-3 text-right font-semibold"
                      >
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200">
                    {dishes.map((dish) => (
                      <tr key={dish.id} className="bg-white hover:bg-sand-50">
                        <th
                          scope="row"
                          className="px-4 py-3.5 text-left font-medium text-sand-800"
                        >
                          {dish.name}
                        </th>
                        <td className="px-4 py-3.5 capitalize text-sand-600">
                          {dish.category}
                        </td>
                        <td className="px-4 py-3.5 text-right tabular-nums text-sand-600">
                          {dish.prepMinutes} min
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono tabular-nums text-sand-800">
                          {CURRENCY.format(dish.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

function SummaryMetric({ label, value, detail }) {
  return (
    <div className="card min-w-0 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-sand-500">
        {label}
      </p>
      <p className="mt-2 truncate font-display text-2xl font-semibold tabular-nums text-sand-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-sand-500">{detail}</p>
    </div>
  );
}

function SortableHeader({ label, sortKey, sort, direction, numeric = false }) {
  const active = sort === sortKey;
  const nextDirection = active && direction === "asc" ? "desc" : "asc";
  const query = new URLSearchParams({ sort: sortKey, dir: nextDirection });

  return (
    <th
      scope="col"
      aria-sort={
        active ? (direction === "asc" ? "ascending" : "descending") : undefined
      }
      className={`px-4 py-3 font-semibold ${numeric ? "text-right" : "text-left"}`}
    >
      <Link
        href={`/admin?${query.toString()}`}
        className="inline-flex items-center gap-1.5 hover:text-brand-700"
      >
        {label}
        <span aria-hidden="true" className="text-brand-700">
          {active ? (direction === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </Link>
    </th>
  );
}

function PageLink({ page, disabled, sort, direction, children }) {
  const query = new URLSearchParams({
    page: String(page),
    sort,
    dir: direction,
  });

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="btn btn-outline cursor-not-allowed opacity-50"
      >
        {children}
      </span>
    );
  }

  return (
    <Link href={`/admin?${query.toString()}`} className="btn btn-outline">
      {children}
    </Link>
  );
}

function compareOrders(first, second, key) {
  if (key === "total") return first.total - second.total;
  if (key === "status") return first.status.localeCompare(second.status);
  if (key === "customer") return first.name.localeCompare(second.name);
  if (key === "area") return first.area.localeCompare(second.area);
  return (
    new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime()
  );
}

function getOrderTrend(orders) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setUTCDate(today.getUTCDate() - 6 + index);
    const key = date.toISOString().slice(0, 10);
    return {
      date: new Intl.DateTimeFormat("en-ET", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(date),
      orders: orders.filter((order) => order.createdAt.slice(0, 10) === key)
        .length,
    };
  });
}
