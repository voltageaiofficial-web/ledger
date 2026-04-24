"use client";

import { usePreferences } from "@/lib/stores/preferences";
import type { Currency } from "@/lib/types";
import { cn } from "@/lib/cn";

const OPTIONS: Currency[] = ["USD", "AUD"];

export function CurrencyToggle() {
  const currency = usePreferences((s) => s.displayCurrency);
  const setCurrency = usePreferences((s) => s.setDisplayCurrency);

  return (
    <div
      role="radiogroup"
      aria-label="Display currency"
      className="flex items-center gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-0.5"
    >
      {OPTIONS.map((c) => {
        const active = c === currency;
        return (
          <button
            key={c}
            role="radio"
            aria-checked={active}
            onClick={() => setCurrency(c)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition",
              active
                ? "bg-[var(--color-surface-raised)] text-[var(--color-text)] shadow-[inset_0_0_0_1px_var(--color-border-strong)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
            )}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
