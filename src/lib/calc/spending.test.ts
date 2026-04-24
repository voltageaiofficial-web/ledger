import { describe, expect, it } from "vitest";
import { spendByCategory, topMerchants, topN } from "./spending";
import type { Transaction } from "@/lib/types";

function tx(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: Math.random().toString(),
    accountId: "a",
    date: "2026-04-01",
    merchant: "Test",
    category: "Groceries",
    amount: -50,
    currency: "USD",
    ...overrides,
  };
}

describe("spendByCategory", () => {
  it("aggregates only negative amounts, excluding transfers and income", () => {
    const rows = spendByCategory([
      tx({ category: "Groceries", amount: -30 }),
      tx({ category: "Groceries", amount: -20 }),
      tx({ category: "Dining", amount: -80 }),
      tx({ category: "Income", amount: 5000 }),
      tx({ category: "Transfer", amount: -500 }),
    ]);
    expect(rows).toEqual([
      { category: "Dining", amount: 80 },
      { category: "Groceries", amount: 50 },
    ]);
  });

  it("returns empty for no matching transactions", () => {
    expect(spendByCategory([])).toEqual([]);
    expect(spendByCategory([tx({ amount: 100, category: "Income" })])).toEqual([]);
  });
});

describe("topN", () => {
  it("returns list unchanged when shorter than n", () => {
    const r = topN([{ amount: 10 }, { amount: 20 }], 3);
    expect(r).toHaveLength(2);
  });

  it("groups remaining into Other with summed amount", () => {
    const r = topN(
      [
        { category: "A", amount: 30 },
        { category: "B", amount: 20 },
        { category: "C", amount: 10 },
        { category: "D", amount: 5 },
      ],
      2,
    );
    expect(r).toHaveLength(3);
    expect(r[2]).toEqual({ category: "Other", amount: 15 });
  });
});

describe("topMerchants", () => {
  it("ranks by total absolute spend, skipping transfers", () => {
    const r = topMerchants([
      tx({ merchant: "A", amount: -100 }),
      tx({ merchant: "A", amount: -50 }),
      tx({ merchant: "B", amount: -80 }),
      tx({ merchant: "Transfer", amount: -500, category: "Transfer" }),
    ]);
    expect(r).toEqual([
      { merchant: "A", amount: 150 },
      { merchant: "B", amount: 80 },
    ]);
  });
});
