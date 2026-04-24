import { describe, expect, it } from "vitest";
import { averageSavingsRate, savingsRate } from "./savings-rate";

describe("savingsRate", () => {
  it("is 0 when income is zero or negative", () => {
    expect(savingsRate(0, 100)).toBe(0);
    expect(savingsRate(-100, 100)).toBe(0);
  });

  it("computes (income - expenses) / income", () => {
    expect(savingsRate(1000, 400)).toBeCloseTo(0.6, 6);
    expect(savingsRate(5000, 5000)).toBe(0);
    expect(savingsRate(5000, 7500)).toBeCloseTo(-0.5, 6);
  });

  it("is clamped to [-1, 1]", () => {
    expect(savingsRate(100, 10000)).toBeGreaterThanOrEqual(-1);
    expect(savingsRate(100, 10000)).toBe(-1);
  });
});

describe("averageSavingsRate", () => {
  it("returns 0 for empty", () => {
    expect(averageSavingsRate([])).toBe(0);
  });

  it("aggregates totals, not averages of ratios", () => {
    // Month A: income 1000, expenses 500 (rate 0.5)
    // Month B: income 2000, expenses 2000 (rate 0.0)
    // Weighted by dollars, not simple mean: total income 3000, total expenses 2500 => 0.1667
    const months = [
      { month: "2026-01", income: 1000, expenses: 500, savings: 500 },
      { month: "2026-02", income: 2000, expenses: 2000, savings: 0 },
    ];
    expect(averageSavingsRate(months)).toBeCloseTo(1 / 6, 4);
  });
});
