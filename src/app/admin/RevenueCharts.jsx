"use client";

import {Bar,BarChart,CartesianGrid,Line,LineChart,ResponsiveContainer,Tooltip,XAxis,YAxis,} from "recharts";

const ETB = new Intl.NumberFormat("en-ET", {
  style: "currency",
  currency: "ETB",
  maximumFractionDigits: 0,
});

export default function RevenueCharts({ areaData, orderTrend }) {
  return (
    <section aria-label="Order charts" className="grid gap-5 lg:grid-cols-2">
      <figure className="card min-w-0 p-5 sm:p-6">
        <figcaption className="mb-5">
          <h2 className="font-display text-xl font-semibold">
            Order value by neighbourhood
          </h2>
          <p className="mt-1 text-sm text-sand-500">
            Non-cancelled orders · ETB
          </p>
        </figcaption>
        <div
          className="h-64 w-full"
          role="img"
          aria-label="Bar chart comparing total order value in Ethiopian birr across delivery neighbourhoods"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={areaData}
              margin={{ top: 4, right: 8, bottom: 2, left: 8 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#e9e5e1"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="area"
                tick={{ fontSize: 11, fill: "#70665d" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                width={82}
                tickFormatter={(value) => ETB.format(value)}
                tick={{ fontSize: 10, fill: "#70665d" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value) => [ETB.format(value), "Order value"]}
              />
              <Bar
                dataKey="total"
                name="Order value"
                fill="#8d293c"
                radius={[3, 3, 0, 0]}
                maxBarSize={42}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </figure>

      <figure className="card min-w-0 p-5 sm:p-6">
        <figcaption className="mb-5">
          <h2 className="font-display text-xl font-semibold">Orders per day</h2>
          <p className="mt-1 text-sm text-sand-500">
            Last 7 days · orders placed
          </p>
        </figcaption>
        <div
          className="h-64 w-full"
          role="img"
          aria-label="Line chart showing the number of orders placed on each of the last seven days"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={orderTrend}
              margin={{ top: 4, right: 12, bottom: 2, left: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="#e9e5e1"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#70665d" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                width={36}
                tick={{ fontSize: 11, fill: "#70665d" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip formatter={(value) => [value, "Orders"]} />
              <Line
                type="monotone"
                dataKey="orders"
                name="Orders"
                stroke="#1f6b58"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#1f6b58" }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </figure>
    </section>
  );
}
