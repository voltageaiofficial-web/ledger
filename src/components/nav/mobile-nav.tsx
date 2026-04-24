"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  LineChart,
  PieChart,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/investments", label: "Invest", icon: LineChart },
  { href: "/spending", label: "Spend", icon: PieChart },
  { href: "/income", label: "Income", icon: BarChart3 },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-xl lg:hidden"
      aria-label="Primary navigation"
    >
      <ul className="grid grid-cols-5 items-stretch">
        {NAV.map((item) => {
          const active = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium",
                  active
                    ? "text-[var(--color-accent-strong)]"
                    : "text-[var(--color-text-muted)]",
                )}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
