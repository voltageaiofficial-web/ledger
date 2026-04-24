import type { Transaction, CategorySpend, TransactionCategory } from "@/lib/types";

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  "Rent",
  "Groceries",
  "Dining",
  "Transport",
  "Subscriptions",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Travel",
  "Shopping",
  "Other",
];

export function spendByCategory(txs: Transaction[]): CategorySpend[] {
  const map = new Map<TransactionCategory, number>();
  for (const t of txs) {
    if (t.amount >= 0) continue;
    if (t.category === "Transfer" || t.category === "Income") continue;
    map.set(t.category, (map.get(t.category) ?? 0) + Math.abs(t.amount));
  }
  return Array.from(map.entries())
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function topN<T extends { amount: number }>(
  list: T[],
  n: number,
  otherLabel = "Other",
): (T | { amount: number; [k: string]: unknown })[] {
  if (list.length <= n) return list.slice();
  const top = list.slice(0, n);
  const rest = list.slice(n);
  const restTotal = rest.reduce((s, r) => s + r.amount, 0);
  return [...top, { category: otherLabel, amount: restTotal }];
}

export function topMerchants(txs: Transaction[], n = 5) {
  const map = new Map<string, number>();
  for (const t of txs) {
    if (t.amount >= 0) continue;
    if (t.category === "Transfer") continue;
    map.set(t.merchant, (map.get(t.merchant) ?? 0) + Math.abs(t.amount));
  }
  return Array.from(map.entries())
    .map(([merchant, amount]) => ({ merchant, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, n);
}
