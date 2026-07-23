"use client";

import * as React from "react";
import { HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/media";
import { useOptionalStorage } from "@/lib/adapters/storage";

/**
 * Compact meter showing total storage usage against quota. Reads from the host
 * `StorageAdapter.usage()`; renders nothing until (and unless) a value comes
 * back, or when no adapter / no `usage()` is provided.
 */
export default function AdminStorageUsage({ className }: { className?: string }) {
  const storage = useOptionalStorage();
  const [usage, setUsage] = React.useState<{ usedBytes: number; quotaBytes: number } | null>(null);

  React.useEffect(() => {
    if (!storage?.usage) return;
    let active = true;
    storage
      .usage()
      .then((u) => {
        if (active) setUsage(u);
      })
      .catch(() => {
        /* leave hidden on error */
      });
    return () => {
      active = false;
    };
  }, [storage]);

  if (!usage) return null;

  const { usedBytes, quotaBytes } = usage;
  const quotaGb = Math.round(quotaBytes / 1024 ** 3);
  const ratio = quotaBytes > 0 ? Math.min(1, usedBytes / quotaBytes) : 0;
  const nearFull = ratio >= 0.8;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-admin-text">
          <HardDrive className="h-3.5 w-3.5 text-admin-text-disabled" />
          Storage used
        </span>
        <span
          className={cn(
            "text-[11px] font-semibold",
            nearFull ? "text-admin-critical-text" : "text-admin-text-subdued"
          )}
        >
          {formatBytes(usedBytes)} of {quotaGb} GB
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-admin-surface-subdued">
        <div
          className={cn("h-full rounded-full", nearFull ? "bg-admin-critical-text" : "bg-admin-accent")}
          style={{ width: `${Math.max(ratio * 100, usedBytes > 0 ? 1 : 0)}%` }}
        />
      </div>
    </div>
  );
}
