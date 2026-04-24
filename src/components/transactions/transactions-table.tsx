"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Search,
  X,
} from "lucide-react";
import type { Transaction, TransactionCategory } from "@/lib/types";
import { formatCurrency } from "@/lib/calc/fx";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const CATEGORY_COLOURS: Record<string, string> = {
  Income: "var(--color-positive)",
  Rent: "#f472b6",
  Groceries: "#22c55e",
  Dining: "#f59e0b",
  Transport: "#60a5fa",
  Subscriptions: "#a78bfa",
  Utilities: "#14b8a6",
  Healthcare: "#ef4444",
  Entertainment: "#ec4899",
  Travel: "#f97316",
  Shopping: "#84cc16",
  Transfer: "#94a3b8",
  Other: "#64748b",
};

type SortKey = "date" | "amount" | "merchant" | "category";

export function TransactionsTable({
  transactions,
  accounts,
}: {
  transactions: Transaction[] | undefined;
  accounts: Array<{ id: string; name: string; institution: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const search = params?.get("q") ?? "";
  const category = params?.get("cat") ?? "";
  const accountId = params?.get("acct") ?? "";
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "date",
    dir: "desc",
  });

  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params?.toString() ?? "");
    if (v) next.set(k, v);
    else next.delete(k);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const categories = useMemo<TransactionCategory[]>(
    () => [
      "Income",
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
      "Transfer",
      "Other",
    ],
    [],
  );

  const rows = useMemo(() => {
    if (!transactions) return [];
    const q = search.trim().toLowerCase();
    const filtered = transactions.filter((t) => {
      if (q && !t.merchant.toLowerCase().includes(q)) return false;
      if (category && t.category !== category) return false;
      if (accountId && t.accountId !== accountId) return false;
      return true;
    });
    const sorted = filtered.slice().sort((a, b) => {
      let cmp = 0;
      if (sort.key === "date") cmp = a.date < b.date ? -1 : 1;
      else if (sort.key === "amount") cmp = a.amount - b.amount;
      else if (sort.key === "merchant") cmp = a.merchant.localeCompare(b.merchant);
      else cmp = a.category.localeCompare(b.category);
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return sorted;
  }, [transactions, search, category, accountId, sort]);

  const accountLabel = (id: string) => {
    const a = accounts.find((x) => x.id === id);
    return a ? `${a.institution}` : id;
  };

  const sortIcon = (key: SortKey) =>
    sort.key !== key ? (
      <ArrowUpDown className="size-3 text-[var(--color-text-dim)]" />
    ) : sort.dir === "asc" ? (
      <ArrowUp className="size-3 text-[var(--color-text)]" />
    ) : (
      <ArrowDown className="size-3 text-[var(--color-text)]" />
    );

  const toggleSort = (key: SortKey) =>
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "desc" },
    );

  return (
    <div className="card-base overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--color-border)] p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[var(--color-text-dim)]" />
          <input
            value={search}
            onChange={(e) => setParam("q", e.target.value || null)}
            placeholder="Search merchant…"
            className="h-8 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] pl-8 pr-8 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/25"
          />
          {search && (
            <button
              onClick={() => setParam("q", null)}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        <select
          value={category}
          onChange={(e) => setParam("cat", e.target.value || null)}
          aria-label="Filter by category"
          className="h-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={accountId}
          onChange={(e) => setParam("acct", e.target.value || null)}
          aria-label="Filter by account"
          className="h-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2 text-xs text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none"
        >
          <option value="">All accounts</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.institution}
            </option>
          ))}
        </select>

        <span className="ml-auto text-xs font-medium text-[var(--color-text-muted)]">
          {rows.length} {rows.length === 1 ? "result" : "results"}
        </span>
      </div>

      <div className="scrollbar-slim max-h-[560px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-[var(--color-surface)]/95 backdrop-blur-md">
            <tr className="border-b border-[var(--color-border)] text-left text-[11px] uppercase tracking-wider text-[var(--color-text-muted)]">
              <Th sortable active={sort.key === "date"} onClick={() => toggleSort("date")} icon={sortIcon("date")}>
                Date
              </Th>
              <Th sortable active={sort.key === "merchant"} onClick={() => toggleSort("merchant")} icon={sortIcon("merchant")}>
                Merchant
              </Th>
              <Th sortable active={sort.key === "category"} onClick={() => toggleSort("category")} icon={sortIcon("category")}>
                Category
              </Th>
              <th className="px-4 py-2.5 font-medium">Account</th>
              <Th
                sortable
                active={sort.key === "amount"}
                onClick={() => toggleSort("amount")}
                icon={sortIcon("amount")}
                className="text-right"
              >
                Amount
              </Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const isIncome = t.amount > 0;
              const colour = CATEGORY_COLOURS[t.category] ?? "#94a3b8";
              return (
                <tr
                  key={t.id}
                  className="group border-b border-[var(--color-border)]/40 transition hover:bg-white/[0.02]"
                >
                  <td className="whitespace-nowrap px-4 py-2.5 font-numeric text-xs text-[var(--color-text-muted)]">
                    {new Date(t.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-[var(--color-text)]">
                    {t.merchant}
                    {t.description && (
                      <span className="ml-2 text-xs font-normal text-[var(--color-text-muted)]">
                        {t.description}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center gap-2 text-xs">
                      <span
                        aria-hidden
                        className="size-1.5 rounded-full"
                        style={{ background: colour }}
                      />
                      <span className="text-[var(--color-text-muted)]">{t.category}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-[var(--color-text-muted)]">
                    {accountLabel(t.accountId)}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2.5 text-right font-numeric",
                      isIncome ? "text-[var(--color-positive)]" : "text-[var(--color-text)]",
                    )}
                  >
                    {formatCurrency(t.amount, t.currency, { signed: true })}
                  </td>
                </tr>
              );
            })}
            {!rows.length && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-[var(--color-text-muted)]">
                  {transactions ? "No transactions match your filters." : "Loading…"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  sortable,
  active,
  onClick,
  icon,
  children,
  className,
}: {
  sortable?: boolean;
  active?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th className={cn("px-4 py-2.5 font-medium", className)}>
      {sortable ? (
        <button
          onClick={onClick}
          className={cn(
            "inline-flex items-center gap-1 transition hover:text-[var(--color-text)]",
            active && "text-[var(--color-text)]",
          )}
        >
          {children}
          {icon}
        </button>
      ) : (
        children
      )}
    </th>
  );
}
