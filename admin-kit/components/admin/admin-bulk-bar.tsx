"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdminBulkBarProps {
  /** Number of selected rows. The bar hides itself when this is 0. */
  count: number;
  /** Clears the selection (the "Clear" button + the X). */
  onClear: () => void;
  /** Bulk-action controls (selects, buttons) rendered on the right. */
  children?: React.ReactNode;
  /** Disables the clear button while a bulk action is running. */
  busy?: boolean;
  /** Label template for the count badge; `{count}` is replaced. */
  label?: string;
  className?: string;
}

/**
 * Sticky bulk-action bar shown when one or more table rows are selected. Pair
 * with `useRowSelection`. Pass your bulk-action controls as children — they sit
 * on the right; the count badge + clear sit on the left.
 *
 *   <AdminBulkBar count={sel.count} onClear={sel.clear}>
 *     <Select …>…</Select>
 *     <Button variant="ghost" onClick={bulkDelete}>Delete</Button>
 *   </AdminBulkBar>
 */
export default function AdminBulkBar({
  count,
  onClear,
  children,
  busy,
  label = "{count} selected",
  className,
}: AdminBulkBarProps) {
  if (count === 0) return null;

  return (
    <div
      className={cn(
        "sticky bottom-4 z-20 flex flex-wrap items-center gap-3 rounded-lg border border-admin-border-subtle bg-admin-surface px-4 py-3 shadow-admin-lift animate-fade-in-up",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Badge variant="lime">{label.replace("{count}", String(count))}</Badge>
        <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={onClear} disabled={busy}>
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      </div>

      {children && (
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{children}</div>
      )}
    </div>
  );
}
