"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CircleDollarSign,
  LineChart,
  PieChart,
  Wallet,
  LayoutDashboard,
  Settings,
  Command,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/investments", label: "Investments", icon: LineChart },
  { href: "/spending", label: "Spending", icon: PieChart },
  { href: "/income", label: "Income", icon: BarChart3 },
] as const;

export function Sidebar({ onCommand }: { onCommand: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className="sticky top-0 hidden h-screen w-[256px] shrink-0 flex-col border-r border-[var(--color-border)] bg-black/20 p-4 lg:flex"
      aria-label="Primary navigation"
    >
      <Link
        href="/overview"
        className="mb-7 flex items-center gap-2.5 px-2 py-2"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-[var(--color-accent)] text-white shadow-[0_8px_20px_-6px_rgba(124,92,255,0.7)]">
          <CircleDollarSign className="size-4.5" />
        </span>
        <span className="text-base font-semibold tracking-tight">Ledger</span>
        <Badge variant="accent" className="ml-auto">
          demo
        </Badge>
      </Link>

      <button
        onClick={onCommand}
        className="mb-6 flex h-9 items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 text-xs text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]"
        aria-label="Open command palette"
      >
        <span className="flex items-center gap-2">
          <Command className="size-3.5" />
          Quick actions
        </span>
        <kbd className="rounded border border-[var(--color-border)] bg-black/30 px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text-muted)]">
          ⌘K
        </kbd>
      </button>

      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm transition",
                active
                  ? "bg-[var(--color-surface-raised)] text-[var(--color-text)] shadow-[inset_0_0_0_1px_var(--color-border-strong)]"
                  : "text-[var(--color-text-muted)] hover:bg-white/[0.03] hover:text-[var(--color-text)]",
              )}
            >
              <Icon
                className={cn(
                  "size-4",
                  active
                    ? "text-[var(--color-accent-strong)]"
                    : "text-[var(--color-text-dim)] group-hover:text-[var(--color-text-muted)]",
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[var(--color-border)] pt-4">
        <p className="px-2 text-[11px] text-[var(--color-text-dim)]">
          Matthew Carrion · Melbourne, AU
        </p>
      </div>
    </aside>
  );
}
