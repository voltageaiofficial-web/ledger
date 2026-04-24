"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useMemo, useState } from "react";
import type { NetWorthPoint } from "@/lib/types";
import { cn } from "@/lib/cn";

type Range = "1M" | "3M" | "6M" | "YTD" | "1Y";
const RANGES: Range[] = ["1M", "3M", "6M", "YTD", "1Y"];

export function PerformanceLine({
  data,
  title,
}: {
  data: NetWorthPoint[];
  title: string;
}) {
  const [range, setRange] = useState<Range>("1Y");

  const filtered = useMemo(() => {
    if (!data.length) return [];
    const last = new Date(data[data.length - 1].date);
    const start = new Date(last);
    if (range === "1M") start.setMonth(start.getMonth() - 1);
    else if (range === "3M") start.setMonth(start.getMonth() - 3);
    else if (range === "6M") start.setMonth(start.getMonth() - 6);
    else if (range === "YTD") start.setMonth(0), start.setDate(1);
    else start.setFullYear(start.getFullYear() - 1);
    return data.filter((d) => new Date(d.date) >= start);
  }, [data, range]);

  const start = filtered[0]?.value ?? 0;
  const end = filtered[filtered.length - 1]?.value ?? 0;
  const returnPct = start > 0 ? (end - start) / start : 0;
  const positive = returnPct >= 0;

  return (
    <div className="card-base flex flex-col p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
            {title}
          </h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={cn(
                "font-numeric text-xl font-semibold",
                positive ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]",
              )}
            >
              {positive ? "▲" : "▼"} {Math.abs(returnPct * 100).toFixed(2)}%
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">{range}</span>
          </div>
        </div>
        <div
          role="radiogroup"
          aria-label="Performance range"
          className="flex gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-0.5"
        >
          {RANGES.map((r) => {
            const active = r === range;
            return (
              <button
                key={r}
                role="radio"
                aria-checked={active}
                onClick={() => setRange(r)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                  active
                    ? "bg-[var(--color-surface-raised)] text-[var(--color-text)] shadow-[inset_0_0_0_1px_var(--color-border-strong)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
                )}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filtered} margin={{ top: 4, right: 12, left: -4, bottom: 0 }}>
            <defs>
              <linearGradient id="perf-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={positive ? "#10B981" : "#EF4444"} stopOpacity={0.85} />
                <stop offset="100%" stopColor={positive ? "#34d399" : "#f87171"} stopOpacity={1} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="2 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6b7387", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(d) =>
                new Date(d).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
              }
              minTickGap={60}
              interval={Math.max(0, Math.floor(filtered.length / 8))}
            />
            <YAxis
              dataKey="value"
              tick={{ fill: "#6b7387", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                new Intl.NumberFormat("en-US", {
                  notation: "compact",
                  maximumFractionDigits: 0,
                }).format(Number(v))
              }
              width={56}
              domain={["dataMin - 1000", "dataMax + 1000"]}
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
              formatter={(v) => [
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                }).format(Number(v)),
                "Value",
              ]}
              labelFormatter={(d) =>
                new Date(d).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              }
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="url(#perf-line)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
