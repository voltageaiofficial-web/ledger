"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTransactions } from "@/lib/hooks/use-overview-data";
import { AllocationDonut, type Slice } from "@/components/charts/allocation-donut";
import { MonthlyStackedBars } from "@/components/charts/monthly-stacked-bars";
import { KpiCard } from "@/components/kpi/kpi-card";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/calc/fx";
import {
  EXPENSE_CATEGORIES,
  spendByCategory,
  topMerchants,
} from "@/lib/calc/spending";
import { ArrowUpRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CAT_COLOURS: Record<string, string> = {
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

export default function SpendingPage() {
  const { data: transactions } = useTransactions();

  const {
    currentMonthTotal,
    prevMonthTotal,
    topCategorySlices,
    monthlyRows,
    topMerchantsList,
    activeCategories,
    thisMonthLabel,
  } = useMemo(() => {
    if (!transactions) {
      return {
        currentMonthTotal: 0,
        prevMonthTotal: 0,
        topCategorySlices: [],
        monthlyRows: [],
        topMerchantsList: [],
        activeCategories: [],
        thisMonthLabel: "",
      };
    }

    const byMonth = new Map<string, typeof transactions>();
    for (const t of transactions) {
      const ym = t.date.slice(0, 7);
      if (!byMonth.has(ym)) byMonth.set(ym, []);
      byMonth.get(ym)!.push(t);
    }
    const months = Array.from(byMonth.keys()).sort();
    const currentKey = months[months.length - 1];
    const prevKey = months[months.length - 2];

    const current = byMonth.get(currentKey) ?? [];
    const prev = byMonth.get(prevKey) ?? [];

    const categories = spendByCategory(current);
    const totalCurrent = categories.reduce((s, c) => s + c.amount, 0);
    const totalPrev = spendByCategory(prev).reduce((s, c) => s + c.amount, 0);

    const top = categories.slice(0, 5);
    const rest = categories.slice(5);
    const restTotal = rest.reduce((s, c) => s + c.amount, 0);
    const slices: Slice[] = [
      ...top.map((c) => ({
        label: c.category,
        value: c.amount,
        colour: CAT_COLOURS[c.category] ?? "#64748b",
      })),
    ];
    if (restTotal > 0) {
      slices.push({ label: "Other", value: restTotal, colour: "#64748b" });
    }

    const last12 = months.slice(-12);
    const activeCats = EXPENSE_CATEGORIES.filter((cat) =>
      last12.some((m) =>
        (byMonth.get(m) ?? []).some(
          (t) => t.category === cat && t.amount < 0,
        ),
      ),
    );

    const rows = last12.map((m) => {
      const txs = byMonth.get(m) ?? [];
      const row: Record<string, number | string> = { month: m };
      for (const cat of activeCats) {
        row[cat] = 0;
      }
      for (const t of txs) {
        if (t.amount >= 0) continue;
        if (t.category === "Transfer") continue;
        const cat = (row[t.category] ?? 0) as number;
        row[t.category] = cat + Math.abs(t.amount);
      }
      return row as { month: string; [k: string]: number | string };
    });

    return {
      currentMonthTotal: totalCurrent,
      prevMonthTotal: totalPrev,
      topCategorySlices: slices,
      monthlyRows: rows,
      topMerchantsList: topMerchants(current, 5),
      activeCategories: activeCats,
      thisMonthLabel: new Date(currentKey + "-01").toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    };
  }, [transactions]);

  const mom = prevMonthTotal > 0 ? (currentMonthTotal - prevMonthTotal) / prevMonthTotal : 0;
  const topMerchantMax = Math.max(1, ...topMerchantsList.map((m) => m.amount));

  if (!transactions) {
    return (
      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[120px] rounded-[var(--radius-card)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-3 md:grid-cols-3" aria-label="Spending summary">
        <KpiCard
          label={`${thisMonthLabel} spend`}
          value={currentMonthTotal}
          prefix="$"
          trend={{ value: -mom, label: "vs last month" }}
          accent
        />
        <KpiCard
          label="Daily average"
          value={currentMonthTotal / Math.max(1, new Date().getDate())}
          prefix="$"
          footer="month-to-date"
        />
        <KpiCard
          label="Categories active"
          value={topCategorySlices.length}
          suffix=" of 11"
          footer={`Top: ${topCategorySlices[0]?.label ?? "—"}`}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <AllocationDonut
          slices={topCategorySlices}
          title={`Spending by category · ${thisMonthLabel}`}
          centerLabel="This month"
          centerValue={formatCurrency(currentMonthTotal, "USD", { compact: true })}
        />
        <div className="card-base flex flex-col p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              Top merchants · this month
            </h3>
            <Link
              href="/accounts"
              className="inline-flex items-center gap-1 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              All transactions <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <ul className="flex flex-1 flex-col gap-4">
            {topMerchantsList.map((m, i) => (
              <li key={m.merchant}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="font-numeric text-xs text-[var(--color-text-dim)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-medium text-[var(--color-text)]">
                      {m.merchant}
                    </span>
                  </span>
                  <span className="font-numeric font-semibold text-[var(--color-text)]">
                    {formatCurrency(m.amount, "USD")}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[#9A7FFF]"
                    style={{ width: `${(m.amount / topMerchantMax) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[var(--color-text-dim)]">
            Tap a category in the donut legend to drill into transactions — or
            use <kbd className="rounded border border-[var(--color-border)] bg-black/30 px-1 py-0.5 font-mono text-[10px]">⌘K</kbd>.
          </p>
        </div>
      </section>

      <MonthlyStackedBars
        data={monthlyRows}
        categories={activeCategories}
        title="Monthly spending breakdown · past 12 months"
      />

      <Card className="divide-y divide-[var(--color-border)]">
        <div className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          Category rundown — this month
        </div>
        {topCategorySlices.map((s) => (
          <Link
            key={s.label}
            href={`/accounts?cat=${encodeURIComponent(s.label === "Other" ? "" : s.label)}`}
            className="flex items-center gap-3 px-5 py-3 text-sm transition hover:bg-white/[0.02]"
          >
            <span
              aria-hidden
              className="size-2.5 rounded-full"
              style={{ background: s.colour }}
            />
            <span className="flex-1 font-medium">{s.label}</span>
            <span className="font-numeric text-[var(--color-text-muted)]">
              {((s.value / currentMonthTotal) * 100).toFixed(1)}%
            </span>
            <span className="w-28 text-right font-numeric font-medium text-[var(--color-text)]">
              {formatCurrency(s.value, "USD")}
            </span>
            <ArrowUpRight className="size-3 text-[var(--color-text-dim)]" />
          </Link>
        ))}
      </Card>
    </div>
  );
}
