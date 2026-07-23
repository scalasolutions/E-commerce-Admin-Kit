import * as React from "react";
import AdminPagination from "@/components/admin/admin-pagination";
import type { UsePaginationResult } from "@/lib/hooks/use-pagination";

/** The slice of a usePagination result AdminTableShell needs to render controls. */
type PaginationController = Pick<
  UsePaginationResult<unknown>,
  "page" | "totalPages" | "total" | "start" | "end" | "pageSize" | "setPage" | "setPageSize"
>;

interface AdminTableShellProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  /**
   * When provided, pagination controls are rendered both above and below the
   * table (the top bar is the primary control; the bottom mirrors it). Pass
   * `undefined` while loading or when there is nothing to page.
   */
  pagination?: PaginationController | null;
  children: React.ReactNode;
}

export default function AdminTableShell({
  title,
  description,
  actions,
  pagination,
  children,
}: AdminTableShellProps) {
  const controls = pagination
    ? {
        page: pagination.page,
        totalPages: pagination.totalPages,
        total: pagination.total,
        start: pagination.start,
        end: pagination.end,
        pageSize: pagination.pageSize,
        onPageChange: pagination.setPage,
        onPageSizeChange: pagination.setPageSize,
      }
    : null;

  return (
    <div className="rounded-xl border border-admin-border bg-admin-surface shadow-admin overflow-hidden">
      {(title || description || actions) && (
        <div className="p-6 border-b border-admin-border-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-admin-text">{title}</h3>}
            {description && <p className="text-xs text-admin-text-subdued mt-0.5">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      {controls && <AdminPagination position="top" {...controls} />}
      <div className="w-full overflow-x-auto">{children}</div>
      {controls && <AdminPagination position="bottom" {...controls} />}
    </div>
  );
}
