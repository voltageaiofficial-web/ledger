"use client";

import CountUp from "react-countup";
import { cn } from "@/lib/cn";
import { Skeleton } from "@/components/ui/skeleton";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";

type Trend = { value: number; label?: string } | null;

export function KpiCard({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  trend,
  loading,
  accent,
  footer,
}: {
  label: string;
  value: number | null;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  trend?: Trend;
  loading?: boolean;
  accent?: boolean;
  footer?: React.ReactNode;
}) {
  const reduce = usePrefersReducedMotion();
  const trendDir = trend && trend.value > 0 ? "up" : trend && trend.value < 0 ? "down" : "flat";

  return (
    <div
      className={cn(
        "relative flex flex-col gap-1 rounded-[var(--radius-card)] border p-5",
        accent
          ? "border-[var(--color-accent)]/25 bg-gradient-to-br from-[var(--color-accent-soft)] via-[var(--color-surface)] to-[var(--color-surface)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)]",
      )}
    >
      <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        {loading || value === null ? (
          <Skeleton className="h-8 w-36 rounded-md" />
        ) : (
          <span className="font-numeric text-[28px] font-semibold tracking-tight text-[var(--color-text)]">
            {prefix}
            <CountUp
              end={value}
              duration={reduce ? 0 : 0.9}
              decimals={decimals}
              separator=","
              preserveValue
            />
            {suffix}
          </span>
        )}
      </div>
      {trend && !loading && (
        <div
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trendDir === "up" && "text-[var(--color-positive)]",
            trendDir === "down" && "text-[var(--color-negative)]",
            trendDir === "flat" && "text-[var(--color-text-muted)]",
          )}
        >
          <span aria-hidden>
            {trendDir === "up" ? "▲" : trendDir === "down" ? "▼" : "—"}
          </span>
          <span>
            {(Math.abs(trend.value) * 100).toFixed(1)}%
            {trend.label ? (
              <span className="ml-1 font-normal text-[var(--color-text-muted)]">
                {trend.label}
              </span>
            ) : null}
          </span>
        </div>
      )}
      {footer && <div className="mt-1 text-xs text-[var(--color-text-muted)]">{footer}</div>}
    </div>
  );
}
