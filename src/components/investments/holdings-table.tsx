"use client";

import type { Holding } from "@/lib/types";
import { holdingMetrics } from "@/lib/calc/portfolio";
import { formatCurrency } from "@/lib/calc/fx";
import { Sparkline } from "@/components/charts/sparkline";
import { cn } from "@/lib/cn";

export function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  const enriched = holdings.map((h) => ({ h, m: holdingMetrics(h) }));
  const totalValue = enriched.reduce((s, e) => s + e.m.marketValue, 0);
  const sorted = enriched.sort((a, b) => b.m.marketValue - a.m.marketValue);

  return (
    <div className="card-base overflow-hidden">
      <div className="scrollbar-slim max-h-[480px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[var(--color-surface)]/95 backdrop-blur">
            <tr className="border-b border-[var(--color-border)] text-left text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">
              <th className="px-4 py-2.5 font-medium">Ticker</th>
              <th className="px-4 py-2.5 font-medium">Shares</th>
              <th className="px-4 py-2.5 font-medium text-right">Price</th>
              <th className="px-4 py-2.5 font-medium text-right">Value</th>
              <th className="px-4 py-2.5 font-medium text-right">Weight</th>
              <th className="px-4 py-2.5 font-medium text-right">Gain / loss</th>
              <th className="px-4 py-2.5 font-medium text-right">30 d</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ h, m }) => {
              const positive = m.gainLoss >= 0;
              const weight = totalValue > 0 ? m.marketValue / totalValue : 0;
              return (
                <tr
                  key={h.id}
                  className="border-b border-[var(--color-border)]/40 transition hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm font-semibold text-[var(--color-text)]">
                        {h.ticker}
                      </span>
                      <span className="text-[11px] text-[var(--color-text-muted)]">
                        {h.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-numeric text-xs text-[var(--color-text-muted)]">
                    {h.quantity.toFixed(h.ticker === "CASH" ? 0 : 2)}
                  </td>
                  <td className="px-4 py-3 text-right font-numeric text-xs text-[var(--color-text-muted)]">
                    {formatCurrency(h.currentPrice, "USD")}
                  </td>
                  <td className="px-4 py-3 text-right font-numeric font-medium text-[var(--color-text)]">
                    {formatCurrency(m.marketValue, "USD")}
                  </td>
                  <td className="px-4 py-3 text-right font-numeric text-xs text-[var(--color-text-muted)]">
                    {(weight * 100).toFixed(1)}%
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right font-numeric",
                      positive ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]",
                    )}
                  >
                    <div>{formatCurrency(m.gainLoss, "USD", { signed: true })}</div>
                    <div className="text-[11px] opacity-80">
                      {positive ? "+" : "−"}
                      {Math.abs(m.gainLossPercent * 100).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Sparkline data={h.history30d} width={68} height={22} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
