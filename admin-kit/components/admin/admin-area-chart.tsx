"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface ChartPoint {
  label: string;
  value: number;
}

interface AdminAreaChartProps {
  data: ChartPoint[];
  /** Stroke/fill color. Defaults to the admin accent (re-themed via CSS var). */
  color?: string;
  height?: number;
  /** Formats the value shown in the hover tooltip. */
  formatValue?: (value: number) => string;
  className?: string;
}

const PAD_X = 8;
const PAD_Y = 12;
const VIEW_W = 640;

/**
 * Dependency-free responsive area chart drawn as inline SVG. Handles hover
 * tooltips and an empty state. Kept generic so any metric can render through it.
 */
export default function AdminAreaChart({
  data,
  color = "var(--admin-accent)",
  height = 200,
  formatValue = (v) => v.toLocaleString(),
  className,
}: AdminAreaChartProps) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);

  const { linePath, areaPath, points, max } = useMemo(() => {
    const values = data.map((d) => d.value);
    const maxVal = Math.max(1, ...values);
    const innerW = VIEW_W - PAD_X * 2;
    const innerH = height - PAD_Y * 2;
    const step = data.length > 1 ? innerW / (data.length - 1) : 0;

    const pts = data.map((d, i) => {
      const x = PAD_X + step * i;
      const y = PAD_Y + innerH - (d.value / maxVal) * innerH;
      return { x, y, ...d };
    });

    const line = pts
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(" ");
    const area =
      pts.length > 0
        ? `${line} L ${pts[pts.length - 1].x.toFixed(2)} ${height - PAD_Y} L ${pts[0].x.toFixed(
            2
          )} ${height - PAD_Y} Z`
        : "";

    return { linePath: line, areaPath: area, points: pts, max: maxVal };
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-xs text-admin-text-subdued",
          className
        )}
        style={{ height }}
      >
        No data for this period.
      </div>
    );
  }

  const active = hover != null ? points[hover] : null;

  return (
    <div className={cn("relative w-full", className)} style={{ height }}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${height}`}
        preserveAspectRatio="none"
        className="h-full w-full overflow-visible"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizontal gridlines */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={PAD_X}
            x2={VIEW_W - PAD_X}
            y1={PAD_Y + (height - PAD_Y * 2) * f}
            y2={PAD_Y + (height - PAD_Y * 2) * f}
            stroke="#E3E3E3"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {active && (
          <line
            x1={active.x}
            x2={active.x}
            y1={PAD_Y}
            y2={height - PAD_Y}
            stroke={color}
            strokeWidth="1"
            strokeOpacity="0.35"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {active && (
          <circle cx={active.x} cy={active.y} r="4" fill={color} stroke="#fff" strokeWidth="2" />
        )}

        {/* invisible hover targets */}
        {points.map((p, i) => (
          <rect
            key={i}
            x={p.x - (VIEW_W - PAD_X * 2) / (points.length * 2 || 1)}
            y={0}
            width={(VIEW_W - PAD_X * 2) / (points.length || 1)}
            height={height}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-admin-border bg-admin-surface px-2.5 py-1.5 shadow-admin-lift"
          style={{ left: `${(active.x / VIEW_W) * 100}%`, top: `${(active.y / height) * 100}%` }}
        >
          <p className="text-[10px] font-medium text-admin-text-subdued">{active.label}</p>
          <p className="text-xs font-semibold text-admin-text">{formatValue(active.value)}</p>
        </div>
      )}

      {/* x-axis labels (first · middle · last) */}
      <div className="mt-1 flex justify-between text-[10px] text-admin-text-disabled">
        <span>{data[0]?.label}</span>
        {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.label}</span>}
        <span>{data[data.length - 1]?.label}</span>
      </div>

      <span className="sr-only">Peak value {formatValue(max)}</span>
    </div>
  );
}
