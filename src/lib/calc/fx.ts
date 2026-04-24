import type { Currency, FxRate } from "@/lib/types";

export function convert(
  amount: number,
  from: Currency,
  to: Currency,
  rates: FxRate[],
): number {
  if (from === to) return amount;
  const direct = rates.find((r) => r.from === from && r.to === to);
  if (direct) return amount * direct.rate;
  const inverse = rates.find((r) => r.from === to && r.to === from);
  if (inverse) return amount / inverse.rate;
  return amount;
}

export function formatCurrency(
  amount: number,
  currency: Currency,
  opts: { signed?: boolean; compact?: boolean } = {},
): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: opts.compact ? 0 : 2,
    minimumFractionDigits: opts.compact ? 0 : 2,
    notation: opts.compact ? "compact" : "standard",
  });
  const out = formatter.format(Math.abs(amount));
  if (opts.signed && amount > 0) return "+" + out;
  if (amount < 0) return "−" + out;
  return out;
}

export function formatPercent(n: number, digits = 1): string {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${Math.abs(n * 100).toFixed(digits)}%`;
}
