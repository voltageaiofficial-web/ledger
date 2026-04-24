"use client";

import { useEffect } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Banknote,
  LayoutDashboard,
  LineChart,
  PieChart,
  Wallet,
  CircleDollarSign,
} from "lucide-react";
import { usePreferences } from "@/lib/stores/preferences";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CommandPalette({ open, onOpenChange }: Props) {
  const router = useRouter();
  const toggleCurrency = usePreferences((s) => s.toggleCurrency);
  const displayCurrency = usePreferences((s) => s.displayCurrency);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-[6px]"
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <div
        className="glass w-full max-w-xl overflow-hidden rounded-[var(--radius-card)] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.9)] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <Command
          label="Quick actions"
          className="flex flex-col"
          loop
          shouldFilter
        >
          <Command.Input
            autoFocus
            placeholder="Jump to… or type a command"
            className="h-12 w-full border-b border-[var(--color-border)] bg-transparent px-4 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none"
          />
          <Command.List className="scrollbar-slim max-h-[360px] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-6 text-center text-sm text-[var(--color-text-muted)]">
              No results.
            </Command.Empty>

            <Command.Group
              heading="Navigate"
              className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)]"
            >
              <Item icon={LayoutDashboard} label="Overview" onSelect={() => go("/overview")} />
              <Item icon={Wallet} label="Accounts" onSelect={() => go("/accounts")} />
              <Item icon={LineChart} label="Investments" onSelect={() => go("/investments")} />
              <Item icon={PieChart} label="Spending" onSelect={() => go("/spending")} />
              <Item icon={BarChart3} label="Income" onSelect={() => go("/income")} />
            </Command.Group>

            <Command.Group
              heading="Actions"
              className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-dim)]"
            >
              <Item
                icon={CircleDollarSign}
                label={`Switch display currency to ${displayCurrency === "USD" ? "AUD" : "USD"}`}
                shortcut={displayCurrency}
                onSelect={() => {
                  toggleCurrency();
                  onOpenChange(false);
                }}
              />
              <Item
                icon={Banknote}
                label="Add transaction"
                onSelect={() => go("/accounts?new=1")}
              />
            </Command.Group>
          </Command.List>
          <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-black/20 px-4 py-2 text-[11px] text-[var(--color-text-dim)]">
            <span>
              <kbd className="mr-1 rounded border border-[var(--color-border)] bg-black/40 px-1.5 py-0.5 font-mono">↑↓</kbd>
              navigate
              <kbd className="mx-1 ml-3 rounded border border-[var(--color-border)] bg-black/40 px-1.5 py-0.5 font-mono">↵</kbd>
              select
              <kbd className="mx-1 ml-3 rounded border border-[var(--color-border)] bg-black/40 px-1.5 py-0.5 font-mono">esc</kbd>
              close
            </span>
            <span className="hidden sm:inline">Ledger</span>
          </div>
        </Command>
      </div>
    </div>
  );
}

function Item({
  icon: Icon,
  label,
  onSelect,
  shortcut,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onSelect: () => void;
  shortcut?: string;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--color-text-muted)] transition",
        "data-[selected=true]:bg-white/[0.06] data-[selected=true]:text-[var(--color-text)]",
        "cursor-pointer",
      )}
    >
      <Icon className="size-4 text-[var(--color-text-dim)]" />
      <span className="flex-1">{label}</span>
      {shortcut && (
        <kbd className="rounded border border-[var(--color-border)] bg-black/30 px-1.5 py-0.5 font-mono text-[10px]">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}
