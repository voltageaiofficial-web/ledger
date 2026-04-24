"use client";

import { usePathname } from "next/navigation";
import { Command, Search } from "lucide-react";
import { CurrencyToggle } from "@/components/accounts/currency-toggle";

const TITLES: Record<string, { title: string; subtitle: string }> = {
  "/overview": {
    title: "Overview",
    subtitle: "Your financial snapshot, at a glance.",
  },
  "/accounts": {
    title: "Accounts",
    subtitle: "All balances and transactions.",
  },
  "/investments": {
    title: "Investments",
    subtitle: "Brokerage and retirement holdings.",
  },
  "/spending": {
    title: "Spending",
    subtitle: "Where your money is going this month.",
  },
  "/income": {
    title: "Income & cashflow",
    subtitle: "What's coming in, what's going out.",
  },
};

export function Header({ onCommand }: { onCommand: () => void }) {
  const pathname = usePathname() ?? "/overview";
  const match =
    Object.entries(TITLES).find(([k]) => pathname.startsWith(k))?.[1] ??
    TITLES["/overview"];

  return (
    <header className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 px-4 py-4 backdrop-blur-xl lg:px-8">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-semibold tracking-tight lg:text-xl">
          {match.title}
        </h1>
        <p className="hidden truncate text-sm text-[var(--color-text-muted)] lg:block">
          {match.subtitle}
        </p>
      </div>
      <button
        onClick={onCommand}
        className="flex h-9 items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] lg:hidden"
        aria-label="Search"
      >
        <Search className="size-4" />
      </button>
      <CurrencyToggle />
    </header>
  );
}
