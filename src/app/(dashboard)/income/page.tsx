"use client";

import { useMemo } from "react";
import { useMonthlySummary } from "@/lib/hooks/use-overview-data";
import { IncomeExpenseBars } from "@/components/charts/income-expense-bars";
import { SavingsRateTrend } from "@/components/charts/savings-rate-trend";
import { SankeyFlow } from "@/components/charts/sankey-flow";
import { KpiCard } from "@/components/kpi/kpi-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/calc/fx";
import { averageSavingsRate, savingsRate } from "@/lib/calc/savings-rate";

export default function IncomePage() {
  const { data: summary } = useMonthlySummary();

  const { ytdIncome, ytdExpenses, ytdSaved, avgRate, currentRate } = useMemo(() => {
    if (!summary) {
      return { ytdIncome: 0, ytdExpenses: 0, ytdSaved: 0, avgRate: 0, currentRate: 0 };
    }
    const ytdIncome = summary.reduce((s, m) => s + m.income, 0);
    const ytdExpenses = summary.reduce((s, m) => s + m.expenses, 0);
    const ytdSaved = ytdIncome - ytdExpenses;
    const last = summary[summary.length - 1];
    return {
      ytdIncome,
      ytdExpenses,
      ytdSaved,
      avgRate: averageSavingsRate(summary),
      currentRate: last ? savingsRate(last.income, last.expenses) : 0,
    };
  }, [summary]);

  const bestMonth = useMemo(() => {
    if (!summary) return null;
    return summary.reduce<(typeof summary)[number] | null>((best, m) => {
      if (!best) return m;
      return m.income - m.expenses > best.income - best.expenses ? m : best;
    }, null);
  }, [summary]);

  if (!summary) {
    return (
      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-[var(--radius-card)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" aria-label="Cashflow summary">
        <KpiCard
          label="12-month savings rate"
          value={avgRate * 100}
          suffix="%"
          decimals={1}
          accent
          trend={{ value: currentRate - avgRate, label: "this month vs avg" }}
          footer="Against 40% FIRE target"
        />
        <KpiCard
          label="YTD income"
          value={ytdIncome}
          prefix="$"
          footer={`${summary.length} months · avg ${formatCurrency(ytdIncome / summary.length, "USD", { compact: true })}/mo`}
        />
        <KpiCard
          label="YTD expenses"
          value={ytdExpenses}
          prefix="$"
          footer={`avg ${formatCurrency(ytdExpenses / summary.length, "USD", { compact: true })}/mo`}
        />
        <KpiCard
          label="Total saved"
          value={ytdSaved}
          prefix="$"
          footer={
            bestMonth
              ? `Best month: ${new Date(bestMonth.month + "-01").toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                })} (+${formatCurrency(bestMonth.income - bestMonth.expenses, "USD", { compact: true })})`
              : undefined
          }
        />
      </section>

      <SankeyFlow />

      <IncomeExpenseBars data={summary} />

      <SavingsRateTrend data={summary} />

      <section className="card-base p-5">
        <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          Monthly breakdown
        </h3>
        <div className="scrollbar-slim overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">
                <th className="px-3 py-2 font-medium">Month</th>
                <th className="px-3 py-2 text-right font-medium">Income</th>
                <th className="px-3 py-2 text-right font-medium">Expenses</th>
                <th className="px-3 py-2 text-right font-medium">Saved</th>
                <th className="px-3 py-2 text-right font-medium">Rate</th>
              </tr>
            </thead>
            <tbody>
              {summary
                .slice()
                .reverse()
                .map((m) => {
                  const saved = m.income - m.expenses;
                  const rate = m.income > 0 ? saved / m.income : 0;
                  return (
                    <tr key={m.month} className="border-b border-[var(--color-border)]/40 transition hover:bg-white/[0.02]">
                      <td className="px-3 py-2 font-medium text-[var(--color-text)]">
                        {new Date(m.month + "-01").toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-3 py-2 text-right font-numeric text-[var(--color-positive)]">
                        {formatCurrency(m.income, "USD")}
                      </td>
                      <td className="px-3 py-2 text-right font-numeric text-[var(--color-text-muted)]">
                        {formatCurrency(m.expenses, "USD")}
                      </td>
                      <td className="px-3 py-2 text-right font-numeric text-[var(--color-text)]">
                        {formatCurrency(saved, "USD", { signed: true })}
                      </td>
                      <td className="px-3 py-2 text-right font-numeric">
                        <span
                          className={
                            rate >= 0.4
                              ? "text-[var(--color-positive)]"
                              : rate >= 0.2
                                ? "text-[var(--color-warning)]"
                                : "text-[var(--color-negative)]"
                          }
                        >
                          {(rate * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
