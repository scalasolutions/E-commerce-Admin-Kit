import { Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminDateRangeProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  className?: string;
}

/**
 * A compact from–to calendar filter. The two native date inputs sit inside one
 * bordered pill (with a leading calendar icon and a clear button) so the pair
 * reads as a single control rather than two loose fields.
 */
export default function AdminDateRange({
  from,
  to,
  onFromChange,
  onToChange,
  className,
}: AdminDateRangeProps) {
  const hasValue = Boolean(from || to);

  return (
    <div
      className={cn(
        "flex h-10 items-center gap-1.5 rounded-lg border border-admin-border bg-admin-surface px-3 shadow-admin transition-colors focus-within:border-admin-accent focus-within:ring-2 focus-within:ring-admin-accent/30",
        className
      )}
    >
      <Calendar className="h-4 w-4 shrink-0 text-admin-text-disabled" />
      <input
        type="date"
        aria-label="From date"
        value={from}
        max={to || undefined}
        onChange={(e) => onFromChange(e.target.value)}
        className="w-[7.5rem] bg-transparent text-xs text-admin-text outline-none [color-scheme:light]"
      />
      <span className="text-xs text-admin-text-disabled">–</span>
      <input
        type="date"
        aria-label="To date"
        value={to}
        min={from || undefined}
        onChange={(e) => onToChange(e.target.value)}
        className="w-[7.5rem] bg-transparent text-xs text-admin-text outline-none [color-scheme:light]"
      />
      {hasValue && (
        <button
          type="button"
          aria-label="Clear date range"
          onClick={() => {
            onFromChange("");
            onToChange("");
          }}
          className="ml-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-admin-text-subdued transition-colors hover:bg-admin-surface-hover hover:text-admin-text"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
