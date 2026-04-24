import type { MonthlySummary } from "@/lib/types";

export function savingsRate(income: number, expenses: number): number {
  if (income <= 0) return 0;
  return Math.max(-1, Math.min(1, (income - expenses) / income));
}

export function averageSavingsRate(months: MonthlySummary[]): number {
  if (!months.length) return 0;
  const totalIncome = months.reduce((s, m) => s + m.income, 0);
  const totalExpenses = months.reduce((s, m) => s + m.expenses, 0);
  return savingsRate(totalIncome, totalExpenses);
}
