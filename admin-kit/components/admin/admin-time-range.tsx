"use client";

import { cn } from "@/lib/utils";

export type TimeRange = "today" | "7d" | "30d" | "90d";

export const TIME_RANGES: { value: TimeRange; label: string; days: number }[] = [
  { value: "today", label: "Today", days: 1 },
  { value: "7d", label: "7 Days", days: 7 },
  { value: "30d", label: "30 Days", days: 30 },
  { value: "90d", label: "90 Days", days: 90 },
];

interface AdminTimeRangeProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

/**
 * Segmented control for scoping dashboard metrics to a time window.
 * The conventional dashboard pattern (Shopify / Stripe / Vercel).
 */
export default function AdminTimeRange({ value, onChange }: AdminTimeRangeProps) {
  return (
    <div
      role="tablist"
      aria-label="Time range"
      className="inline-flex items-center gap-0.5 rounded-lg border border-admin-border bg-admin-surface-subdued p-0.5"
    >
      {TIME_RANGES.map((range) => {
        const active = range.value === value;
        return (
          <button
            key={range.value}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(range.value)}
            className={cn(
              "rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all duration-150",
              active
                ? "bg-admin-surface text-admin-text shadow-admin"
                : "text-admin-text-subdued hover:text-admin-text"
            )}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
}
