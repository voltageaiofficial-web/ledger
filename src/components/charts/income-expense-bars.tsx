"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { MonthlySummary } from "@/lib/types";

export function IncomeExpenseBars({ data }: { data: MonthlySummary[] }) {
  const avgSavings = data.length
    ? data.reduce((s, d) => s + (d.income - d.expenses), 0) / data.length
    : 0;

  return (
    <div className="card-base p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          Income vs expenses · past 12 months
        </h3>
        <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#10b981]" aria-hidden /> Income
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#ef4444]" aria-hidden /> Expenses
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0 w-4 border-t border-dashed border-[#7c5cff]" aria-hidden /> Avg savings
          </span>
        </div>
      </div>
      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, left: -4, bottom: 0 }} barCategoryGap="30%">
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
            <ReferenceLine
              y={avgSavings}
              stroke="#7c5cff"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Bar
              dataKey="income"
              name="Income"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
              activeBar={false}
            />
            <Bar
              dataKey="expenses"
              name="Expenses"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
              activeBar={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
