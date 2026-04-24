import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none",
  {
    variants: {
      variant: {
        neutral:
          "bg-white/5 text-[var(--color-text-muted)] border border-white/5",
        positive:
          "bg-[var(--color-positive-soft)] text-[var(--color-positive)] border border-[var(--color-positive)]/25",
        negative:
          "bg-[var(--color-negative-soft)] text-[var(--color-negative)] border border-[var(--color-negative)]/25",
        accent:
          "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)] border border-[var(--color-accent)]/30",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
