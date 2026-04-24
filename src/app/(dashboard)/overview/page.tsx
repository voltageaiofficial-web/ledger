"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  useAccounts,
  useFxRates,
  useHoldings,
  useMonthlySummary,
  useNetWorthSeries,
  useTransactions,
} from "@/lib/hooks/use-overview-data";
import { KpiCard } from "@/components/kpi/kpi-card";
import { NetWorthTimeline } from "@/components/charts/net-worth-timeline";
import { AccountCard } from "@/components/accounts/account-card";
import { convert, formatCurrency } from "@/lib/calc/fx";
import { usePreferences } from "@/lib/stores/preferences";
import { averageSavingsRate } from "@/lib/calc/savings-rate";
import { portfolioSummary } from "@/lib/calc/portfolio";
import { Card } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

export default function OverviewPage() {
  const displayCurrency = usePreferences((s) => s.displayCurrency);
  const { data: accounts } = useAccounts();
  const { data: fxRates } = useFxRates();
  const { data: series } = useNetWorthSeries();
  const { data: summary } = useMonthlySummary();
  const { data: holdings } = useHoldings();
  const { data: transactions } = useTransactions();

  const netWorth = useMemo(() => {
    if (!accounts || !fxRates) return null;
    return accounts.reduce(
      (s, a) => s + convert(a.balance, a.currency, displayCurrency, fxRates),
      0,
    );
  }, [accounts, fxRates, displayCurrency]);

  const thisMonth = summary?.[summary.length - 1];
  const prevMonth = summary?.[summary.length - 2];
  const avgSavings = summary ? averageSavingsRate(summary) : null;
  const portfolio = holdings ? portfolioSummary(holdings) : null;

  const incomeChange =
    thisMonth && prevMonth ? (thisMonth.income - prevMonth.income) / prevMonth.income : 0;
  const spendChange =
    thisMonth && prevMonth ? (thisMonth.expenses - prevMonth.expenses) / prevMonth.expenses : 0;
  const savingsThisMonth = thisMonth ? (thisMonth.income - thisMonth.expenses) / thisMonth.income : 0;

  const recentTxs = useMemo(() => transactions?.slice(0, 6) ?? [], [transactions]);

  return (
    <div className="flex flex-col gap-6">
      <section
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
        aria-label="Key metrics"
      >
        <KpiCard
          label="Net worth"
          value={netWorth}
          prefix={displayCurrency === "USD" ? "$" : "A$"}
          loading={netWorth === null}
          trend={{ value: 0.083, label: "vs last year" }}
          accent
        />
        <KpiCard
          label="Monthly income"
          value={thisMonth?.income ?? null}
          prefix="$"
          loading={!thisMonth}
          trend={{ value: incomeChange, label: "vs last month" }}
        />
        <KpiCard
          label="Monthly spend"
          value={thisMonth?.expenses ?? null}
          prefix="$"
          loading={!thisMonth}
          trend={{ value: -spendChange, label: "vs last month" }}
        />
        <KpiCard
          label="Savings rate"
          value={avgSavings !== null ? avgSavings * 100 : null}
          suffix="%"
          decimals={1}
          loading={avgSavings === null}
          trend={{ value: savingsThisMonth - (avgSavings ?? 0), label: "this month vs 12M avg" }}
          footer={
            portfolio
              ? `Portfolio ${(portfolio.totalGainLossPercent * 100).toFixed(1)}% total return`
              : undefined
          }
        />
      </section>

      <NetWorthTimeline data={series} loading={!series} />

      <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Accounts
            </h2>
            <Link
              href="/accounts"
              className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              View all <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(accounts ?? []).map((a) => (
              <AccountCard key={a.id} account={a} fxRates={fxRates} />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Recent activity
            </h2>
            <Link
              href="/accounts"
              className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              View all <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <Card className="divide-y divide-[var(--color-border)]">
            {recentTxs.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-3 px-4 py-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-[var(--color-text)]">
                    {t.merchant}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                    <span>{t.category}</span>
                    <span aria-hidden>·</span>
                    <time>{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</time>
                  </div>
                </div>
                <div
                  className={
                    t.amount >= 0
                      ? "font-numeric text-sm font-semibold text-[var(--color-positive)]"
                      : "font-numeric text-sm text-[var(--color-text)]"
                  }
                >
                  {formatCurrency(t.amount, t.currency, { signed: true })}
                </div>
              </div>
            ))}
            {!recentTxs.length && (
              <div className="p-4 text-sm text-[var(--color-text-muted)]">
                Loading transactions…
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  );
}
