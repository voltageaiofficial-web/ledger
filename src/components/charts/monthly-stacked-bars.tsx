"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

export type MonthlyBarRow = {
  month: string;
  [category: string]: number | string;
};

const CATEGORY_COLOURS: Record<string, string> = {
  Rent: "#f472b6",
  Groceries: "#22c55e",
  Dining: "#f59e0b",
  Transport: "#60a5fa",
  Subscriptions: "#a78bfa",
  Utilities: "#14b8a6",
  Healthcare: "#ef4444",
  Entertainment: "#ec4899",
  Travel: "#f97316",
  Shopping: "#84cc16",
  Other: "#64748b",
};

export function MonthlyStackedBars({
  data,
  categories,
  title,
}: {
  data: MonthlyBarRow[];
  categories: string[];
  title: string;
}) {
  return (
    <div className="card-base p-5">
      <h3 className="mb-4 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
        {title}
      </h3>
      <div style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -4, bottom: 0 }} barCategoryGap="20%">
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="2 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7387", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                new Date(v + "-01").toLocaleDateString("en-US", { month: "short" })
              }
            />
            <YAxis
              tick={{ fill: "#6b7387", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                new Intl.NumberFormat("en-US", {
                  notation: "compact",
                  maximumFractionDigits: 0,
                }).format(Number(v))
              }
              width={52}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "#121520",
                border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 8,
                fontSize: 12,
                padding: "8px 10px",
              }}
              labelStyle={{ color: "#6b7387", fontSize: 10, marginBottom: 2 }}
              itemStyle={{ color: "#f5f7fa" }}
              labelFormatter={(v) =>
                new Date(v + "-01").toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              }
              formatter={(v, name) => [
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(Number(v)),
                String(name),
              ]}
            />
            <Legend
              wrapperStyle={{ paddingTop: 8, fontSize: 11 }}
              iconSize={8}
              iconType="circle"
            />
            {categories.map((c, i) => (
              <Bar
                key={c}
                dataKey={c}
                stackId="a"
                fill={CATEGORY_COLOURS[c] ?? "#64748b"}
                radius={i === categories.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                isAnimationActive={false}
                activeBar={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
