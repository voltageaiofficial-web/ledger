"use client";

import { useMemo, useState } from "react";
import { useDimensions } from "@/lib/hooks/use-dimensions";

const LINKS = [
  { label: "Saved", value: 3545, color: "#10b981" },
  { label: "Housing", value: 1650, color: "#f472b6" },
  { label: "Dining", value: 420, color: "#f59e0b" },
  { label: "Groceries", value: 345, color: "#22c55e" },
  { label: "Transport", value: 245, color: "#60a5fa" },
  { label: "Utilities", value: 230, color: "#14b8a6" },
  { label: "Shopping", value: 195, color: "#84cc16" },
  { label: "Entertainment", value: 142, color: "#ec4899" },
  { label: "Subscriptions", value: 108, color: "#a78bfa" },
  { label: "Other", value: 120, color: "#6b7280" },
] as const;

const TOTAL = LINKS.reduce((s, l) => s + l.value, 0);
const NODE_W = 10;
const NODE_GAP = 5;
const SVG_H = 370;
const MT = 20;
const MB = 20;
const ML = 72;
const MR = 128;

function fmt(v: number) {
  return v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`;
}

export function SankeyFlow() {
  const [wrapperRef, { width }] = useDimensions<HTMLDivElement>();
  const [hovered, setHovered] = useState<string | null>(null);

  const layout = useMemo(() => {
    if (width === 0) return null;
    const innerH = SVG_H - MT - MB;
    const totalGaps = (LINKS.length - 1) * NODE_GAP;
    const availH = innerH - totalGaps;

    const srcX = ML;
    const tgtX = width - MR - NODE_W;
    const midX = (srcX + NODE_W + tgtX) / 2;

    let curY = MT;
    const nodes = LINKS.map((link) => {
      const h = Math.max(8, (link.value / TOTAL) * availH);
      const node = { ...link, x: tgtX, y: curY, h };
      curY += h + NODE_GAP;
      return node;
    });

    let srcCurY = MT;
    const ribbons = nodes.map((node) => {
      const h = node.h;
      const srcY0 = srcCurY;
      const srcY1 = srcCurY + h;
      srcCurY += h + NODE_GAP;
      const tgtY0 = node.y;
      const tgtY1 = node.y + node.h;
      const path = [
        `M ${srcX + NODE_W} ${srcY0}`,
        `C ${midX} ${srcY0} ${midX} ${tgtY0} ${tgtX} ${tgtY0}`,
        `L ${tgtX} ${tgtY1}`,
        `C ${midX} ${tgtY1} ${midX} ${srcY1} ${srcX + NODE_W} ${srcY1}`,
        "Z",
      ].join(" ");
      return { ...node, path, srcY0, srcY1 };
    });

    return { srcX, srcY: MT, srcH: innerH, nodes, ribbons };
  }, [width]);

  return (
    <div className="card-base p-5" aria-label="Monthly cashflow breakdown">
      <h3 className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
        Monthly cashflow
      </h3>
      <p className="mb-4 text-[11px] text-[var(--color-text-dim)]">
        Where the average monthly income goes · hover to highlight
      </p>
      <div ref={wrapperRef}>
        {layout && width > 0 ? (
          <svg
            width={width}
            height={SVG_H}
            role="img"
            aria-label="Sankey diagram showing monthly income flowing to spending categories and savings"
          >
            <defs>
              {layout.ribbons.map((r) => {
                const id = `sg-${r.label.replace(/[^a-z]/gi, "-")}`;
                return (
                  <linearGradient key={id} id={id} x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#7C5CFF" stopOpacity={0.55} />
                    <stop offset="100%" stopColor={r.color} stopOpacity={0.7} />
                  </linearGradient>
                );
              })}
            </defs>

            {layout.ribbons.map((r) => {
              const id = `sg-${r.label.replace(/[^a-z]/gi, "-")}`;
              const active = hovered === r.label;
              return (
                <path
                  key={r.label}
                  d={r.path}
                  fill={`url(#${id})`}
                  opacity={hovered ? (active ? 0.82 : 0.22) : 0.48}
                  style={{ transition: "opacity 120ms", cursor: "default" }}
                  onMouseEnter={() => setHovered(r.label)}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })}

            {/* Source node */}
            <rect
              x={layout.srcX}
              y={layout.srcY}
              width={NODE_W}
              height={layout.srcH}
              rx={4}
              fill="#7C5CFF"
              opacity={0.9}
            />
            <text
              x={layout.srcX - 8}
              y={layout.srcY + layout.srcH / 2 - 10}
              textAnchor="end"
              fill="var(--color-text)"
              style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono, monospace)" }}
            >
              {fmt(TOTAL)}
            </text>
            <text
              x={layout.srcX - 8}
              y={layout.srcY + layout.srcH / 2 + 6}
              textAnchor="end"
              fill="var(--color-text-dim)"
              style={{ fontSize: 10 }}
            >
              per month
            </text>

            {/* Target nodes + labels */}
            {layout.nodes.map((n) => {
              const active = hovered === n.label;
              const mid = n.y + n.h / 2;
              const showValue = n.h >= 18;
              return (
                <g
                  key={n.label}
                  onMouseEnter={() => setHovered(n.label)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "default" }}
                >
                  <rect
                    x={n.x}
                    y={n.y}
                    width={NODE_W}
                    height={n.h}
                    rx={3}
                    fill={n.color}
                    opacity={hovered ? (active ? 1 : 0.4) : 0.85}
                    style={{ transition: "opacity 120ms" }}
                  />
                  <text
                    x={n.x + NODE_W + 8}
                    y={showValue ? mid - 6 : mid}
                    dy="0.32em"
                    fill={hovered && !active ? "var(--color-text-dim)" : "var(--color-text-muted)"}
                    style={{ fontSize: 11, transition: "fill 120ms" }}
                  >
                    {n.label}
                  </text>
                  {showValue && (
                    <text
                      x={n.x + NODE_W + 8}
                      y={mid + 8}
                      dy="0.32em"
                      fill="var(--color-text-dim)"
                      style={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)" }}
                    >
                      {fmt(n.value)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        ) : (
          <div className="h-[370px] animate-pulse rounded-lg bg-white/[0.02]" />
        )}
      </div>
    </div>
  );
}
