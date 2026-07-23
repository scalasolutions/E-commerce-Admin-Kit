"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  /** Optional leading icon element. */
  icon?: React.ReactNode;
}

interface SegmentedProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  /** Fill the container width and split evenly. */
  fullWidth?: boolean;
  size?: "sm" | "md";
  "aria-label"?: string;
  className?: string;
}

/**
 * A segmented control (pill toggle group) — the intuitive replacement for a
 * short <Select> when there are 2–4 mutually-exclusive choices you want visible
 * at once (discount type, view mode, on/off/auto…). Keyboard-navigable with
 * arrow keys; the active segment carries the accent.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  fullWidth,
  size = "md",
  className,
  ...aria
}: SegmentedProps<T>) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (index + dir + options.length) % options.length;
    refs.current[next]?.focus();
    onChange(options[next].value);
  }

  return (
    <div
      role="radiogroup"
      aria-label={aria["aria-label"]}
      className={cn(
        "inline-flex rounded-lg border border-admin-border bg-admin-surface-subdued p-0.5",
        fullWidth && "flex w-full",
        className
      )}
    >
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-[7px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30",
              size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
              fullWidth && "flex-1",
              active
                ? "bg-admin-surface text-admin-text shadow-admin"
                : "text-admin-text-subdued hover:text-admin-text"
            )}
          >
            {opt.icon}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default Segmented;
