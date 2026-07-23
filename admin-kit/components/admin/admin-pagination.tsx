"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface AdminPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  start: number;
  end: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  /** Border side: "bottom" (default) sits under a table; "top" sits above it. */
  position?: "top" | "bottom";
  className?: string;
}

export default function AdminPagination({
  page,
  totalPages,
  total,
  start,
  end,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  position = "bottom",
  className,
}: AdminPaginationProps) {
  // Hide only when there is nothing to show and no controls matter.
  if (total === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 px-4 py-3 text-xs text-admin-text-subdued sm:flex-row sm:items-center sm:justify-between",
        position === "top"
          ? "border-b border-admin-border-subtle"
          : "border-t border-admin-border-subtle",
        className
      )}
    >
      <p>
        Showing <span className="font-medium text-admin-text">{start}</span>–
        <span className="font-medium text-admin-text">{end}</span> of{" "}
        <span className="font-medium text-admin-text">{total}</span>
      </p>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap">Rows:</span>
          <Select
            aria-label="Rows per page"
            value={String(pageSize)}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 w-[68px]"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={String(size)}>
                {size}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="whitespace-nowrap">
            Page <span className="font-medium text-admin-text">{page}</span> of{" "}
            <span className="font-medium text-admin-text">{totalPages}</span>
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-8 w-8 p-0"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
