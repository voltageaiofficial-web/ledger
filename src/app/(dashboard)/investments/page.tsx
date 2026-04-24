"use client";

import { useMemo } from "react";
import { useAccounts, useHoldings, useNetWorthSeries } from "@/lib/hooks/use-overview-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AllocationDonut, type Slice } from "@/components/charts/allocation-donut";
import { HoldingsTable } from "@/components/investments/holdings-table";
import { PerformanceLine } from "@/components/charts/performance-line";
import { KpiCard } from "@/components/kpi/kpi-card";
import { portfolioSummary } from "@/lib/calc/portfolio";
import { formatCurrency } from "@/lib/calc/fx";
import type { Holding, NetWorthPoint } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const ASSET_COLOURS: Record<string, string> = {
  "US Equity": "var(--color-series-1)",
  "Intl Equity": "var(--color-series-2)",
  Bond: "var(--color-series-3)",
  Cash: "var(--color-series-5)",
};

function buildAccountSeries(
  base: NetWorthPoint[],
  endValue: number,
  seed: number,
): NetWorthPoint[] {
  if (!base.length) return [];
  const endBase = base[base.length - 1].value;
  const scale = endValue / endBase;
  return base.map((p, i) => {
    const jitter = Math.sin((i + seed) * 0.19) * 0.008 * p.value;
    const v = p.value * scale + jitter;
    return { ...p, value: Math.round(v * 100) / 100 };
  });
}

function allocationSlices(holdings: Holding[]): Slice[] {
  const map = new Map<string, number>();
  for (const h of holdings) {
    const v = h.quantity * h.currentPrice;
    map.set(h.assetClass, (map.get(h.assetClass) ?? 0) + v);
  }
  return Array.from(map.entries())
    .map(([label, value]) => ({
      label,
      value,
      colour: ASSET_COLOURS[label] ?? "var(--color-series-6)",
    }))
    .sort((a, b) => b.value - a.value);
}

export default function InvestmentsPage() {
  const { data: accounts } = useAccounts();
  const { data: holdings } = useHoldings();
  const { data: series } = useNetWorthSeries();

  const brokerage = accounts?.find((a) => a.id === "robinhood");
  const roth = accounts?.find((a) => a.id === "roth-ira");
  const brokerageHoldings = useMemo(
    () => holdings?.filter((h) => h.accountId === "robinhood") ?? [],
    [holdings],
  );
  const rothHoldings = useMemo(
    () => holdings?.filter((h) => h.accountId === "roth-ira") ?? [],
    [holdings],
  );

  const combined = useMemo(() => portfolioSummary(holdings ?? []), [holdings]);
  const brokerageSummary = useMemo(
    () => portfolioSummary(brokerageHoldings),
    [brokerageHoldings],
  );
  const rothSummary = useMemo(() => portfolioSummary(rothHoldings), [rothHoldings]);

  const combinedSeries = useMemo(() => {
    if (!series || !accounts) return [];
    const endValue = (brokerage?.balance ?? 0) + (roth?.balance ?? 0);
    return buildAccountSeries(series, endValue, 1);
  }, [series, accounts, brokerage, roth]);

  const brokerageSeries = useMemo(
    () => (series && brokerage ? buildAccountSeries(series, brokerage.balance, 2) : []),
    [series, brokerage],
  );
  const rothSeries = useMemo(
    () => (series && roth ? buildAccountSeries(series, roth.balance, 5) : []),
    [series, roth],
  );

  if (!accounts || !holdings) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[132px] rounded-[var(--radius-card)]" />
        ))}
      </div>
    );
  }

  const totalValue = combined.totalValue;

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Portfolio summary" className="grid gap-3 md:grid-cols-3">
        <KpiCard
          label="Portfolio value"
          value={totalValue}
          prefix="$"
          accent
          trend={{ value: combined.totalGainLossPercent, label: "total return" }}
          footer={`${holdings.length} holdings across 2 accounts`}
        />
        <KpiCard
          label="Brokerage"
          value={brokerageSummary.totalValue}
          prefix="$"
          trend={{ value: brokerageSummary.totalGainLossPercent, label: "total return" }}
          footer={formatCurrency(brokerageSummary.totalGainLoss, "USD", { signed: true }) + " realised + unrealised"}
        />
        <KpiCard
          label="Roth IRA"
          value={rothSummary.totalValue}
          prefix="$"
          trend={{ value: rothSummary.totalGainLossPercent, label: "total return" }}
          footer={formatCurrency(rothSummary.totalGainLoss, "USD", { signed: true }) + " lifetime"}
        />
      </section>

      <PerformanceLine data={combinedSeries} title="Combined performance" />

      <Tabs defaultValue="brokerage" className="flex flex-col gap-4">
        <TabsList aria-label="Investment account">
          <TabsTrigger value="brokerage">Brokerage</TabsTrigger>
          <TabsTrigger value="roth">Roth IRA</TabsTrigger>
        </TabsList>

        <TabsContent value="brokerage" className="flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <AllocationDonut
              slices={allocationSlices(brokerageHoldings)}
              title="Brokerage allocation"
              centerLabel="Holdings value"
              centerValue={formatCurrency(brokerageSummary.totalValue, "USD", { compact: true })}
            />
            <HoldingsTable holdings={brokerageHoldings} />
          </div>
          <PerformanceLine data={brokerageSeries} title="Brokerage — value over time" />
        </TabsContent>

        <TabsContent value="roth" className="flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
            <AllocationDonut
              slices={allocationSlices(rothHoldings)}
              title="Roth IRA allocation"
              centerLabel="Holdings value"
              centerValue={formatCurrency(rothSummary.totalValue, "USD", { compact: true })}
            />
            <HoldingsTable holdings={rothHoldings} />
          </div>
          <PerformanceLine data={rothSeries} title="Roth IRA — value over time" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
