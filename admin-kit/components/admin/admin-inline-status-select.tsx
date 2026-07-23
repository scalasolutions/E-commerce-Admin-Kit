"use client";

import * as React from "react";
import { ChevronDown, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { statusTint, statusLabel, TINT_CLASSES } from "@/lib/constants/status";

export interface InlineStatusOption {
  value: string;
  label?: string;
}

interface AdminInlineStatusSelectProps {
  value: string;
  options: InlineStatusOption[];
  /** Persist the new status. May be async; the pill shows a spinner until it settles. */
  onChange: (value: string) => Promise<void> | void;
  disabled?: boolean;
  /** Menu alignment relative to the trigger. Defaults to "left". */
  align?: "left" | "right";
  className?: string;
}

/**
 * A compact, badge-styled status control for use inside table rows. Renders the
 * current status as a colored pill; clicking it opens a small menu to switch
 * status without leaving the list. While `onChange` resolves the pill shows a
 * spinner and is disabled, and it optimistically reflects the picked value.
 */
export default function AdminInlineStatusSelect({
  value,
  options,
  onChange,
  disabled,
  align = "left",
  className,
}: AdminInlineStatusSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  // Show the chosen value immediately; the parent reconciles on success.
  const [optimistic, setOptimistic] = React.useState<string | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);

  const shown = optimistic ?? value;
  const tint = statusTint(shown);

  React.useEffect(() => {
    // Clear the optimistic value once the parent confirms it.
    if (optimistic !== null && value === optimistic) setOptimistic(null);
  }, [value, optimistic]);

  React.useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function pick(next: string) {
    setOpen(false);
    if (next === shown) return;
    setOptimistic(next);
    setSaving(true);
    try {
      await onChange(next);
    } catch {
      // Roll back the optimistic value if the save failed.
      setOptimistic(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div ref={rootRef} className={cn("relative inline-block", className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled || saving}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group inline-flex items-center gap-1.5 rounded-full border border-transparent pl-2 pr-1.5 py-0.5 text-[11px] font-medium leading-5 transition-[background-color,box-shadow] hover:shadow-admin focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30 disabled:cursor-not-allowed disabled:opacity-60",
          TINT_CLASSES[tint]
        )}
      >
        {saving ? (
          <Loader2 className="h-2.5 w-2.5 animate-spin" aria-hidden="true" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
        )}
        <span>{statusLabel(shown)}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 opacity-60 transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          className={cn(
            "absolute top-full z-[70] mt-1.5 min-w-[10rem] overflow-hidden rounded-xl border border-admin-border bg-admin-surface p-1 shadow-admin-lift",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {options.map((opt) => {
            const selected = opt.value === shown;
            const optTint = statusTint(opt.value);
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={selected}
                onClick={() => pick(opt.value)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-xs text-admin-text transition-colors hover:bg-admin-surface-subdued",
                  selected && "bg-admin-surface-subdued font-medium"
                )}
              >
                <span className={cn("flex items-center gap-2", TINT_CLASSES[optTint].split(" ")[1])}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                  <span>{opt.label ?? statusLabel(opt.value)}</span>
                </span>
                {selected && <Check className="h-3.5 w-3.5 shrink-0 text-admin-accent" strokeWidth={2.5} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
