"use client";

import { useMemo } from "react";

export function Sparkline({
  data,
  width = 72,
  height = 24,
  className,
}: {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
}) {
  const { path, fillPath, positive } = useMemo(() => {
    if (!data.length) return { path: "", fillPath: "", positive: true };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1 || 1);

    const pts = data.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * (height - 2) - 1;
      return [x, y] as const;
    });
    const path = pts.map(([x, y], i) => (i ? `L${x.toFixed(1)},${y.toFixed(1)}` : `M${x.toFixed(1)},${y.toFixed(1)}`)).join(" ");
    const fillPath = `${path} L${width},${height} L0,${height} Z`;
    const positive = data[data.length - 1] >= data[0];
    return { path, fillPath, positive };
  }, [data, width, height]);

  const stroke = positive ? "var(--color-positive)" : "var(--color-negative)";
  const id = `sp-${positive ? "p" : "n"}-${width}-${height}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={fillPath} fill={`url(#${id})`} />
      <path d={path} stroke={stroke} strokeWidth={1.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
