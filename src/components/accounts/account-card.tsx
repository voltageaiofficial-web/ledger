"use client";

import type { Account, FxRate } from "@/lib/types";
import { convert, formatCurrency } from "@/lib/calc/fx";
import { usePreferences } from "@/lib/stores/preferences";
import { cn } from "@/lib/cn";

export function AccountCard({
  account,
  fxRates,
}: {
  account: Account;
  fxRates: FxRate[] | undefined;
}) {
  const displayCurrency = usePreferences((s) => s.displayCurrency);
  const converted = fxRates
    ? convert(account.balance, account.currency, displayCurrency, fxRates)
    : account.balance;

  const isForeign = account.currency !== displayCurrency;
  const kindLabel =
    account.kind === "checking"
      ? "Checking"
      : account.kind === "savings"
        ? "Savings"
        : account.kind === "brokerage"
          ? "Brokerage"
          : "Retirement";

  return (
    <div
      className={cn(
        "card-base group relative flex flex-col gap-3 overflow-hidden p-5 transition hover:border-[var(--color-border-strong)]",
      )}
    >
      <div
        aria-hidden
        className="absolute -right-12 -top-12 size-40 rounded-full opacity-[0.09] blur-2xl transition group-hover:opacity-[0.16]"
        style={{ background: account.colour ?? "#7C5CFF" }}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
            {kindLabel}
          </div>
          <div className="mt-0.5 truncate text-sm font-semibold">
            {account.institution}
            <span className="ml-1.5 font-normal text-[var(--color-text-muted)]">
              · {account.name}
            </span>
          </div>
        </div>
        {account.last4 && (
          <span className="font-mono text-[10px] text-[var(--color-text-dim)]">
            •• {account.last4}
          </span>
        )}
      </div>

      <div>
        <div className="font-numeric text-2xl font-semibold tracking-tight text-[var(--color-text)]">
          {formatCurrency(account.balance, account.currency)}
        </div>
        {isForeign && (
          <div className="mt-0.5 font-numeric text-xs text-[var(--color-text-muted)]">
            ≈ {formatCurrency(converted, displayCurrency)}
          </div>
        )}
      </div>
    </div>
  );
}
