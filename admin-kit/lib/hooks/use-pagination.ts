"use client";

import { useEffect, useMemo, useState } from "react";

export interface UsePaginationOptions {
  initialPageSize?: number;
}

export interface UsePaginationResult<T> {
  pageItems: T[];
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  totalPages: number;
  total: number;
  /** 1-based index of the first item on the current page (0 when empty). */
  start: number;
  /** 1-based index of the last item on the current page (0 when empty). */
  end: number;
}

/**
 * Client-side pagination over an in-memory (already filtered) array.
 * Resets to page 1 when the item count or page size changes.
 */
export function usePagination<T>(
  items: T[],
  opts: UsePaginationOptions = {}
): UsePaginationResult<T> {
  const { initialPageSize = 10 } = opts;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Reset to first page when the dataset size or page size changes.
  useEffect(() => {
    setPage(1);
  }, [total, pageSize]);

  // Clamp page if it ever exceeds available pages.
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const startIdx = (safePage - 1) * pageSize;
    return items.slice(startIdx, startIdx + pageSize);
  }, [items, safePage, pageSize]);

  const start = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const end = Math.min(safePage * pageSize, total);

  return {
    pageItems,
    page: safePage,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    total,
    start,
    end,
  };
}

export default usePagination;
