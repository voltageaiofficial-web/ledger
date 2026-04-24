"use client";

import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import type { NetWorthPoint } from "@/lib/types";
import { useDimensions } from "@/lib/hooks/use-dimensions";
import { usePrefersReducedMotion } from "@/lib/hooks/use-prefers-reduced-motion";
import { cn } from "@/lib/cn";

type Range = "1M" | "3M" | "6M" | "YTD" | "1Y";
const RANGES: Range[] = ["1M", "3M", "6M", "YTD", "1Y"];

const MARGIN = { top: 24, right: 24, bottom: 28, left: 56 };

export function NetWorthTimeline({
  data,
  loading,
}: {
  data: NetWorthPoint[] | undefined;
  loading?: boolean;
}) {
  const [wrapperRef, { width }] = useDimensions<HTMLDivElement>();
  const reduceMotion = usePrefersReducedMotion();
  const [range, setRange] = useState<Range>("1Y");
  const [hover, setHover] = useState<{ x: number; p: NetWorthPoint } | null>(null);
  const height = 320;

  const filtered = useMemo(() => {
    if (!data?.length) return [];
    const last = new Date(data[data.length - 1].date);
    const start = new Date(last);
    if (range === "1M") start.setMonth(start.getMonth() - 1);
    else if (range === "3M") start.setMonth(start.getMonth() - 3);
    else if (range === "6M") start.setMonth(start.getMonth() - 6);
    else if (range === "YTD") start.setMonth(0), start.setDate(1);
    else start.setFullYear(start.getFullYear() - 1);
    return data.filter((d) => new Date(d.date) >= start);
  }, [data, range]);

  const projectionData = useMemo(() => {
    if (range !== "1Y" || !data?.length) return [];
    const recent = data.slice(-90);
    if (recent.length < 2) return [];
    const avgDailyGain = (recent[recent.length - 1].value - recent[0].value) / (recent.length - 1);
    const last = data[data.length - 1];
    const lastDate = new Date(last.date);
    const pts: Array<{ date: string; value: number }> = [{ date: last.date, value: last.value }];
    for (let i = 7; i <= 182; i += 7) {
      const d = new Date(lastDate);
      d.setDate(d.getDate() + i);
      pts.push({ date: d.toISOString().slice(0, 10), value: Math.round(last.value + avgDailyGain * i) });
    }
    return pts;
  }, [data, range]);

  const scales = useMemo(() => {
    if (!filtered.length || width === 0) return null;
    const allDates = [...filtered.map((d) => new Date(d.date)), ...projectionData.map((d) => new Date(d.date))];
    const allValues = [...filtered.map((d) => d.value), ...projectionData.map((d) => d.value)];
    const xDomain = d3.extent(allDates) as [Date, Date];
    const yMin = Math.min(...allValues);
    const yMax = Math.max(...allValues);
    const pad = (yMax - yMin) * 0.18 || yMax * 0.05;
    const x = d3
      .scaleTime()
      .domain(xDomain)
      .range([MARGIN.left, width - MARGIN.right]);
    const y = d3
      .scaleLinear()
      .domain([Math.max(0, yMin - pad), yMax + pad])
      .range([height - MARGIN.bottom, MARGIN.top])
      .nice();
    return { x, y };
  }, [filtered, projectionData, width]);

  const linePath = useMemo(() => {
    if (!scales || !filtered.length) return "";
    const line = d3
      .line<NetWorthPoint>()
      .x((d) => scales.x(new Date(d.date)))
      .y((d) => scales.y(d.value))
      .curve(d3.curveMonotoneX);
    return line(filtered) ?? "";
  }, [filtered, scales]);

  const areaPath = useMemo(() => {
    if (!scales || !filtered.length) return "";
    const area = d3
      .area<NetWorthPoint>()
      .x((d) => scales.x(new Date(d.date)))
      .y0(height - MARGIN.bottom)
      .y1((d) => scales.y(d.value))
      .curve(d3.curveMonotoneX);
    return area(filtered) ?? "";
  }, [filtered, scales]);

  const projectionPath = useMemo(() => {
    if (!scales || projectionData.length < 2) return "";
    const line = d3
      .line<{ date: string; value: number }>()
      .x((d) => scales.x(new Date(d.date)))
      .y((d) => scales.y(d.value))
      .curve(d3.curveMonotoneX);
    return line(projectionData) ?? "";
  }, [projectionData, scales]);

  const pathRef = useRef<SVGPathElement | null>(null);
  useEffect(() => {
    if (!pathRef.current || reduceMotion) return;
    const len = pathRef.current.getTotalLength();
    pathRef.current.style.strokeDasharray = `${len}`;
    pathRef.current.style.strokeDashoffset = `${len}`;
    pathRef.current.getBoundingClientRect();
    pathRef.current.style.transition = "stroke-dashoffset 1100ms cubic-bezier(0.16, 1, 0.3, 1)";
    pathRef.current.style.strokeDashoffset = "0";
  }, [linePath, reduceMotion]);

  const endPoint = filtered[filtered.length - 1];
  const startPoint = filtered[0];
  const delta = endPoint && startPoint ? endPoint.value - startPoint.value : 0;
  const deltaPct = startPoint && startPoint.value > 0 ? delta / startPoint.value : 0;
  const positive = delta >= 0;

  const handleMove = (e: React.PointerEvent<SVGRectElement>) => {
    if (!scales || !filtered.length) return;
    const svg = (e.currentTarget.ownerSVGElement ?? e.currentTarget) as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const bisect = d3.bisector<NetWorthPoint, Date>((d) => new Date(d.date)).center;
    const xDate = scales.x.invert(mx);
    const idx = bisect(filtered, xDate);
    const p = filtered[Math.max(0, Math.min(filtered.length - 1, idx))];
    setHover({ x: scales.x(new Date(p.date)), p });
  };

  const ticks = scales ? scales.y.ticks(4) : [];
  const xTicks = scales ? scales.x.ticks(Math.max(3, Math.floor((width - MARGIN.left) / 110))) : [];

  return (
    <div
      ref={wrapperRef}
      className="card-base relative overflow-hidden p-5"
      aria-label="Net worth over time"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
            Net worth
          </p>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="font-numeric text-3xl font-semibold tracking-tight text-[var(--color-text)]">
              {endPoint
                ? endPoint.value.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  })
                : "—"}
            </span>
            <span
              className={cn(
                "text-xs font-medium",
                positive ? "text-[var(--color-positive)]" : "text-[var(--color-negative)]",
              )}
              aria-label={`${positive ? "Up" : "Down"} ${Math.abs(deltaPct * 100).toFixed(1)} percent this period`}
            >
              {positive ? "▲" : "▼"} {Math.abs(deltaPct * 100).toFixed(1)}%
              <span className="ml-1 font-normal text-[var(--color-text-muted)]">
                {deltaSign(delta)}
              </span>
            </span>
          </div>
        </div>
        <div
          role="radiogroup"
          aria-label="Chart range"
          className="flex gap-0.5 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-0.5"
        >
          {RANGES.map((r) => {
            const active = range === r;
            return (
              <button
                key={r}
                role="radio"
                aria-checked={active}
                onClick={() => setRange(r)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-semibold transition",
                  active
                    ? "bg-[var(--color-surface-raised)] text-[var(--color-text)] shadow-[inset_0_0_0_1px_var(--color-border-strong)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]",
                )}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative">
        {loading || !scales ? (
          <div className="flex h-[320px] items-center justify-center">
            <div className="h-full w-full animate-pulse rounded-lg bg-white/[0.03]" />
          </div>
        ) : (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label="Line chart showing net worth over time"
            className="overflow-visible"
          >
            <defs>
              <linearGradient id="nw-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#7C5CFF" stopOpacity={0.42} />
                <stop offset="60%" stopColor="#7C5CFF" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#7C5CFF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="nw-line" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#9A7FFF" />
                <stop offset="100%" stopColor="#7C5CFF" />
              </linearGradient>
            </defs>

            {ticks.map((t) => {
              const yy = scales.y(t);
              return (
                <g key={t} className="text-[10px]">
                  <line
                    x1={MARGIN.left}
                    x2={width - MARGIN.right}
                    y1={yy}
                    y2={yy}
                    stroke="rgba(255,255,255,0.05)"
                  />
                  <text
                    x={MARGIN.left - 10}
                    y={yy}
                    dy="0.32em"
                    textAnchor="end"
                    className="fill-[var(--color-text-dim)] font-[var(--font-mono)]"
                  >
                    {d3.format("$~s")(t)}
                  </text>
                </g>
              );
            })}

            {xTicks.map((t) => {
              const xx = scales.x(t);
              return (
                <text
                  key={+t}
                  x={xx}
                  y={height - 8}
                  textAnchor="middle"
                  className="fill-[var(--color-text-dim)] text-[10px]"
                >
                  {d3.timeFormat("%b '%y")(t)}
                </text>
              );
            })}

            <path d={areaPath} fill="url(#nw-area)" />
            <path
              ref={pathRef}
              d={linePath}
              fill="none"
              stroke="url(#nw-line)"
              strokeWidth={2}
              strokeLinecap="round"
            />
            {projectionPath && (
              <path
                d={projectionPath}
                fill="none"
                stroke="#9A7FFF"
                strokeWidth={1.5}
                strokeDasharray="5 4"
                strokeOpacity={0.38}
                strokeLinecap="round"
              />
            )}

            {hover && (
              <g>
                <line
                  x1={hover.x}
                  x2={hover.x}
                  y1={MARGIN.top}
                  y2={height - MARGIN.bottom}
                  stroke="rgba(255,255,255,0.22)"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={hover.x}
                  cy={scales.y(hover.p.value)}
                  r={5}
                  fill="#0B0D12"
                  stroke="#9A7FFF"
                  strokeWidth={2}
                />
              </g>
            )}

            <rect
              x={MARGIN.left}
              y={MARGIN.top}
              width={width - MARGIN.left - MARGIN.right}
              height={height - MARGIN.top - MARGIN.bottom}
              fill="transparent"
              onPointerMove={handleMove}
              onPointerLeave={() => setHover(null)}
              aria-hidden
            />
          </svg>
        )}

        {range === "1Y" && projectionData.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[var(--color-text-dim)]">
            <svg width={18} height={8} aria-hidden>
              <line x1={0} y1={4} x2={18} y2={4} stroke="#9A7FFF" strokeWidth={1.5} strokeDasharray="4 3" strokeOpacity={0.55} />
            </svg>
            6-month projection based on 90-day trend
          </div>
        )}

        {hover && scales && (
          <div
            className="pointer-events-none absolute z-10 rounded-md border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)]/95 px-3 py-2 text-xs shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)] backdrop-blur"
            style={{
              left: clamp(hover.x + 14, MARGIN.left, width - 160),
              top: clamp(scales.y(hover.p.value) - 48, 0, height - 72),
            }}
          >
            <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">
              {new Date(hover.p.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
            <div className="mt-0.5 font-numeric text-sm font-semibold text-[var(--color-text)]">
              {hover.p.value.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function deltaSign(n: number) {
  const s = Math.abs(n).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  return (n >= 0 ? "+" : "−") + s;
}
