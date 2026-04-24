"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/cn";

export type Slice = { label: string; value: number; colour: string };

export function AllocationDonut({
  slices,
  title,
  centerLabel,
  centerValue,
  height = 220,
}: {
  slices: Slice[];
  title: string;
  centerLabel: string;
  centerValue: string;
  height?: number;
}) {
  const total = slices.reduce((s, v) => s + v.value, 0);

  return (
    <div className="card-base flex h-full flex-col p-5">
      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
        {title}
      </h3>
      <div className="relative" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="88%"
              stroke="rgba(11,13,18,0.9)"
              strokeWidth={2}
              paddingAngle={1.5}
              startAngle={90}
              endAngle={-270}
            >
              {slices.map((s, i) => (
                <Cell key={i} fill={s.colour} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-dim)]">
            {centerLabel}
          </span>
          <span className="font-numeric text-xl font-semibold text-[var(--color-text)]">
            {centerValue}
          </span>
        </div>
      </div>
      <ul className="mt-3 flex flex-col gap-1.5">
        {slices.map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ background: s.colour }}
            />
            <span className="text-[var(--color-text-muted)]">{s.label}</span>
            <span className="ml-auto font-numeric text-[var(--color-text)]">
              {total > 0 ? ((s.value / total) * 100).toFixed(1) : "0.0"}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
