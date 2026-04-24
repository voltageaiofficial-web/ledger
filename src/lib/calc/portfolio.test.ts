import { describe, expect, it } from "vitest";
import { holdingMetrics, portfolioSummary } from "./portfolio";
import type { Holding } from "@/lib/types";

function h(overrides: Partial<Holding> = {}): Holding {
  return {
    id: "test",
    accountId: "a",
    ticker: "TST",
    name: "Test",
    assetClass: "US Equity",
    quantity: 10,
    avgCost: 100,
    currentPrice: 120,
    history30d: [110, 115, 120],
    ...overrides,
  };
}

describe("holdingMetrics", () => {
  it("computes market value, cost basis, gain/loss", () => {
    const m = holdingMetrics(h());
    expect(m.marketValue).toBe(1200);
    expect(m.costBasis).toBe(1000);
    expect(m.gainLoss).toBe(200);
    expect(m.gainLossPercent).toBeCloseTo(0.2, 6);
  });

  it("day change uses first and last history points", () => {
    const m = holdingMetrics(h({ history30d: [100, 102, 110] }));
    expect(m.dayChangePercent).toBeCloseTo(0.1, 6);
  });

  it("handles zero cost basis gracefully", () => {
    const m = holdingMetrics(h({ avgCost: 0, quantity: 5 }));
    expect(m.costBasis).toBe(0);
    expect(m.gainLossPercent).toBe(0);
  });
});

describe("portfolioSummary", () => {
  it("aggregates totals across holdings", () => {
    const s = portfolioSummary([
      h({ id: "a", quantity: 10, avgCost: 100, currentPrice: 120, assetClass: "US Equity" }),
      h({ id: "b", quantity: 5, avgCost: 200, currentPrice: 220, assetClass: "Bond" }),
    ]);
    expect(s.totalValue).toBe(1200 + 1100);
    expect(s.totalCostBasis).toBe(1000 + 1000);
    expect(s.totalGainLoss).toBe(2300 - 2000);
    expect(s.totalGainLossPercent).toBeCloseTo(300 / 2000, 6);
  });

  it("computes allocation as share of total value", () => {
    const s = portfolioSummary([
      h({ quantity: 10, avgCost: 100, currentPrice: 100, assetClass: "US Equity" }),
      h({ quantity: 10, avgCost: 100, currentPrice: 100, assetClass: "Bond" }),
    ]);
    expect(s.allocation["US Equity"]).toBeCloseTo(0.5, 6);
    expect(s.allocation["Bond"]).toBeCloseTo(0.5, 6);
  });

  it("returns zero-state for empty portfolio", () => {
    const s = portfolioSummary([]);
    expect(s.totalValue).toBe(0);
    expect(s.totalGainLossPercent).toBe(0);
  });
});
