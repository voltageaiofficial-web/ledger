"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import type { MonthlySummary } from "@/lib/types";

const TARGET_RATE = 0.4;

export function SavingsRateTrend({ data }: { data: MonthlySummary[] }) {
  const rows = data.map((d) => ({
    month: d.month,
    rate: d.income > 0 ? (d.income - d.expenses) / d.income : 0,
  }));

  return (
    <div className="card-base p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          Savings rate trend · past 12 months
        </h3>
        <div className="flex items-center gap-4 text-xs text-[var(--color-text-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#7c5cff]" aria-hidden /> Monthly
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0 w-4 border-t border-dashed border-[#f59e0b]" aria-hidden /> Target 40%
          </span>
        </div>
      </div>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 16, left: -4, bottom: 0 }}>
            <defs>
              <linearGradient id="sv-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.38} />
                <stop offset="100%" stopColor="#7c5cff" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(v) => `${Math.round(Number(v) * 100)}%`}
              width={44}
              domain={[0, 1]}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.18)", strokeDasharray: "3 3" }}
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
              formatter={(v) => [`${(Number(v) * 100).toFixed(1)}%`, "Savings rate"]}
            />
            <ReferenceLine
              y={TARGET_RATE}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#9a7fff"
              strokeWidth={2}
              fill="url(#sv-area)"
              isAnimationActive={false}
              activeDot={{ r: 4, fill: "#0b0d12", stroke: "#9a7fff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
