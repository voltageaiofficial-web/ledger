import { addDays, format, subMonths } from "date-fns";
import type { NetWorthPoint, MonthlySummary } from "@/lib/types";
import { MOCK_LATENCY_MS, persona } from "./persona";
import { mulberry32, round2 } from "./seed";

function buildNetWorthSeries(): NetWorthPoint[] {
  const rng = mulberry32(99001);
  const today = new Date("2026-04-24");
  const start = subMonths(today, 11);
  const endAssets = 111460;
  const startAssets = 92000;
  const days = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const out: NetWorthPoint[] = [];

  let v = startAssets;
  for (let i = 0; i <= days; i++) {
    const t = i / days;
    const trend = startAssets + (endAssets - startAssets) * t;

    const monthProgress = (t * 12) % 12;
    let shock = 0;
    if (monthProgress > 4.3 && monthProgress < 5.5) {
      const phase = (monthProgress - 4.3) / 1.2;
      shock = -Math.sin(phase * Math.PI) * 5200;
    }
    if (monthProgress > 9.5 && monthProgress < 10.1) {
      shock += 7000;
    }

    const noise = (rng() - 0.5) * 600;
    const drift = (v - trend) * -0.15;
    v = v + drift + noise * 0.4;
    const value = Math.max(0, v + shock);

    const date = addDays(start, i);
    out.push({
      date: format(date, "yyyy-MM-dd"),
      value: round2(value),
      assets: round2(value + 1800),
      liabilities: 1800,
    });
  }

  return out;
}

function buildMonthlySummary(): MonthlySummary[] {
  const rng = mulberry32(42042);
  const out: MonthlySummary[] = [];
  const today = new Date("2026-04-24");
  for (let m = 11; m >= 0; m--) {
    const d = subMonths(today, m);
    const month = format(d, "yyyy-MM");
    const idx = 11 - m;
    const baseIncome = persona.monthlyTakeHomeUSD;
    const bonus = idx === persona.bonusMonthIndex ? persona.bonusAmountUSD : 0;
    const income = round2(baseIncome + bonus + (rng() - 0.5) * 120);
    const expenseBase = persona.monthlySpendUSD + (rng() - 0.5) * 420;
    const expenses = round2(Math.max(2800, expenseBase));
    out.push({
      month,
      income,
      expenses,
      savings: round2(income - expenses),
    });
  }
  return out;
}

const netWorthSeries = buildNetWorthSeries();
const monthlySummary = buildMonthlySummary();

async function delay<T>(v: T): Promise<T> {
  await new Promise((r) => setTimeout(r, MOCK_LATENCY_MS));
  return v;
}

export async function fetchNetWorthSeries() {
  return delay(netWorthSeries.slice());
}

export async function fetchMonthlySummary() {
  return delay(monthlySummary.slice());
}
