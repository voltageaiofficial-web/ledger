import type { Holding } from "@/lib/types";
import { MOCK_LATENCY_MS } from "./persona";
import { mulberry32 } from "./seed";

function buildSparkline(seed: number, base: number, volatility = 0.015): number[] {
  const rng = mulberry32(seed);
  const out: number[] = [];
  let v = base * (0.94 + rng() * 0.04);
  for (let i = 0; i < 30; i++) {
    v = v * (1 + (rng() - 0.48) * volatility);
    out.push(Math.round(v * 100) / 100);
  }
  out[out.length - 1] = base;
  return out;
}

const holdings: Holding[] = [
  {
    id: "rh-vti",
    accountId: "robinhood",
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    assetClass: "US Equity",
    quantity: 53.2,
    avgCost: 248.15,
    currentPrice: 285.92,
    history30d: buildSparkline(1, 285.92, 0.012),
  },
  {
    id: "rh-vxus",
    accountId: "robinhood",
    ticker: "VXUS",
    name: "Vanguard Total International Stock ETF",
    assetClass: "Intl Equity",
    quantity: 87.6,
    avgCost: 58.42,
    currentPrice: 65.08,
    history30d: buildSparkline(2, 65.08, 0.011),
  },
  {
    id: "rh-aapl",
    accountId: "robinhood",
    ticker: "AAPL",
    name: "Apple Inc.",
    assetClass: "US Equity",
    quantity: 23,
    avgCost: 172.1,
    currentPrice: 198.44,
    history30d: buildSparkline(3, 198.44, 0.02),
  },
  {
    id: "rh-msft",
    accountId: "robinhood",
    ticker: "MSFT",
    name: "Microsoft Corporation",
    assetClass: "US Equity",
    quantity: 9,
    avgCost: 368.2,
    currentPrice: 422.7,
    history30d: buildSparkline(4, 422.7, 0.018),
  },
  {
    id: "rh-bnd",
    accountId: "robinhood",
    ticker: "BND",
    name: "Vanguard Total Bond Market ETF",
    assetClass: "Bond",
    quantity: 41,
    avgCost: 72.04,
    currentPrice: 74.18,
    history30d: buildSparkline(5, 74.18, 0.004),
  },
  {
    id: "rh-amzn",
    accountId: "robinhood",
    ticker: "AMZN",
    name: "Amazon.com, Inc.",
    assetClass: "US Equity",
    quantity: 16,
    avgCost: 154.8,
    currentPrice: 189.92,
    history30d: buildSparkline(6, 189.92, 0.024),
  },
  {
    id: "rh-cash",
    accountId: "robinhood",
    ticker: "CASH",
    name: "Settled Cash",
    assetClass: "Cash",
    quantity: 2660,
    avgCost: 1,
    currentPrice: 1,
    history30d: Array(30).fill(1),
  },
  {
    id: "roth-vti",
    accountId: "roth-ira",
    ticker: "VTI",
    name: "Vanguard Total Stock Market ETF",
    assetClass: "US Equity",
    quantity: 65.1,
    avgCost: 241.9,
    currentPrice: 285.92,
    history30d: buildSparkline(7, 285.92, 0.012),
  },
  {
    id: "roth-vxus",
    accountId: "roth-ira",
    ticker: "VXUS",
    name: "Vanguard Total International Stock ETF",
    assetClass: "Intl Equity",
    quantity: 119.1,
    avgCost: 57.8,
    currentPrice: 65.08,
    history30d: buildSparkline(8, 65.08, 0.011),
  },
  {
    id: "roth-bnd",
    accountId: "roth-ira",
    ticker: "BND",
    name: "Vanguard Total Bond Market ETF",
    assetClass: "Bond",
    quantity: 62.5,
    avgCost: 71.1,
    currentPrice: 74.18,
    history30d: buildSparkline(9, 74.18, 0.004),
  },
];

async function delay<T>(v: T): Promise<T> {
  await new Promise((r) => setTimeout(r, MOCK_LATENCY_MS));
  return v;
}

export async function fetchHoldings(accountId?: string) {
  const list = accountId ? holdings.filter((h) => h.accountId === accountId) : holdings;
  return delay(list.slice());
}

export async function fetchAllHoldings() {
  return delay(holdings.slice());
}
