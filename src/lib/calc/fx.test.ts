import { describe, expect, it } from "vitest";
import { convert, formatCurrency, formatPercent } from "./fx";
import type { FxRate } from "@/lib/types";

const rates: FxRate[] = [
  { from: "AUD", to: "USD", rate: 0.64, asOf: "2026-04-24" },
  { from: "USD", to: "AUD", rate: 1 / 0.64, asOf: "2026-04-24" },
];

describe("convert", () => {
  it("is identity when currencies match", () => {
    expect(convert(100, "USD", "USD", rates)).toBe(100);
    expect(convert(99.99, "AUD", "AUD", rates)).toBe(99.99);
  });

  it("applies direct rate AUD → USD", () => {
    expect(convert(100, "AUD", "USD", rates)).toBeCloseTo(64, 6);
  });

  it("applies direct rate USD → AUD", () => {
    expect(convert(64, "USD", "AUD", rates)).toBeCloseTo(100, 6);
  });

  it("falls back to inverse rate when direct missing", () => {
    const partial: FxRate[] = [
      { from: "AUD", to: "USD", rate: 0.5, asOf: "2026-04-24" },
    ];
    // Inverse path: 50 USD / 0.5 = 100 AUD
    expect(convert(50, "USD", "AUD", partial)).toBeCloseTo(100, 6);
  });

  it("returns input amount when no rate exists at all", () => {
    expect(convert(100, "AUD", "USD", [])).toBe(100);
  });
});

describe("formatCurrency", () => {
  it("formats positive USD", () => {
    expect(formatCurrency(1234.5, "USD")).toBe("$1,234.50");
  });

  it("prefixes negative values with minus sign", () => {
    expect(formatCurrency(-42, "USD")).toBe("−$42.00");
  });

  it("prefixes positive signed values with +", () => {
    expect(formatCurrency(42, "USD", { signed: true })).toBe("+$42.00");
  });

  it("renders AUD with A$ prefix", () => {
    expect(formatCurrency(500, "AUD")).toBe("A$500.00");
  });

  it("compact mode drops cents and compacts", () => {
    expect(formatCurrency(15000, "USD", { compact: true })).toBe("$15K");
  });
});

describe("formatPercent", () => {
  it("positive with plus", () => {
    expect(formatPercent(0.1234)).toBe("+12.3%");
  });

  it("negative with minus sign", () => {
    expect(formatPercent(-0.05)).toBe("−5.0%");
  });

  it("zero is flat", () => {
    expect(formatPercent(0)).toBe("0.0%");
  });
});
