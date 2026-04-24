import type { Currency, FxRate } from "@/lib/types";
import { FX_AS_OF, FX_AUD_TO_USD, MOCK_LATENCY_MS } from "./persona";

const rates: FxRate[] = [
  { from: "AUD", to: "USD", rate: FX_AUD_TO_USD, asOf: FX_AS_OF },
  { from: "USD", to: "AUD", rate: 1 / FX_AUD_TO_USD, asOf: FX_AS_OF },
  { from: "USD", to: "USD", rate: 1, asOf: FX_AS_OF },
  { from: "AUD", to: "AUD", rate: 1, asOf: FX_AS_OF },
];

async function delay<T>(v: T): Promise<T> {
  await new Promise((r) => setTimeout(r, MOCK_LATENCY_MS));
  return v;
}

export async function fetchFxRates() {
  return delay(rates.slice());
}

export function findRate(
  list: FxRate[],
  from: Currency,
  to: Currency,
): number {
  if (from === to) return 1;
  const match = list.find((r) => r.from === from && r.to === to);
  return match?.rate ?? 1;
}
