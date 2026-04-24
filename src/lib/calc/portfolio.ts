import type { Holding } from "@/lib/types";

export type HoldingMetrics = {
  marketValue: number;
  costBasis: number;
  gainLoss: number;
  gainLossPercent: number;
  dayChangePercent: number;
};

export function holdingMetrics(h: Holding): HoldingMetrics {
  const marketValue = h.quantity * h.currentPrice;
  const costBasis = h.quantity * h.avgCost;
  const gainLoss = marketValue - costBasis;
  const gainLossPercent = costBasis === 0 ? 0 : gainLoss / costBasis;
  const first = h.history30d[0] ?? h.currentPrice;
  const last = h.history30d[h.history30d.length - 1] ?? h.currentPrice;
  const dayChangePercent = first === 0 ? 0 : (last - first) / first;
  return { marketValue, costBasis, gainLoss, gainLossPercent, dayChangePercent };
}

export type PortfolioSummary = {
  totalValue: number;
  totalCostBasis: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  allocation: Record<string, number>;
};

export function portfolioSummary(holdings: Holding[]): PortfolioSummary {
  const enriched = holdings.map((h) => ({ h, m: holdingMetrics(h) }));
  const totalValue = enriched.reduce((s, e) => s + e.m.marketValue, 0);
  const totalCostBasis = enriched.reduce((s, e) => s + e.m.costBasis, 0);
  const totalGainLoss = totalValue - totalCostBasis;
  const totalGainLossPercent = totalCostBasis === 0 ? 0 : totalGainLoss / totalCostBasis;

  const allocation: Record<string, number> = {};
  for (const { h, m } of enriched) {
    allocation[h.assetClass] = (allocation[h.assetClass] ?? 0) + m.marketValue;
  }
  for (const k of Object.keys(allocation)) {
    allocation[k] = totalValue === 0 ? 0 : allocation[k] / totalValue;
  }

  return { totalValue, totalCostBasis, totalGainLoss, totalGainLossPercent, allocation };
}
