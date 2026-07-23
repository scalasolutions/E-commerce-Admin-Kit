import * as React from "react";
import { cn } from "@/lib/utils";

interface AdminFilterBarProps {
  /** Primary control (usually a search input); pinned left, grows to fill. */
  search?: React.ReactNode;
  /** Filter controls (selects, date ranges) + actions; sit on the right. */
  children?: React.ReactNode;
  className?: string;
}

/**
 * The toolbar row above a table: a search box on the left and filter/action
 * controls on the right, wrapping gracefully on narrow screens. Pure layout —
 * you supply the actual controls.
 *
 *   <AdminFilterBar search={<AdminSearchInput … />}>
 *     <Select …>…</Select>
 *     <Select …>…</Select>
 *   </AdminFilterBar>
 */
export default function AdminFilterBar({ search, children, className }: AdminFilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {search && <div className="w-full min-w-0 sm:w-72">{search}</div>}
      {children && (
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">{children}</div>
      )}
    </div>
  );
}
