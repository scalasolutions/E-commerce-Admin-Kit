"use client";

import { useCallback, useMemo, useState } from "react";

export interface UseRowSelectionResult {
  /** The set of selected ids. */
  selected: Set<string>;
  /** Number of selected rows. */
  count: number;
  /** True if `id` is selected. */
  isSelected: (id: string) => boolean;
  /** Toggle a single row. */
  toggle: (id: string) => void;
  /** Select or deselect one row explicitly. */
  set: (id: string, value: boolean) => void;
  /** True when every id in `pageIds` is selected (and there is at least one). */
  allSelected: boolean;
  /** True when some — but not all — of `pageIds` are selected (for the indeterminate box). */
  someSelected: boolean;
  /** Select-all toggle for the current page/filtered set. */
  toggleAll: (value: boolean) => void;
  /** Clear the whole selection. */
  clear: () => void;
}

/**
 * Backend-agnostic multi-row selection for tables. Pass the ids currently
 * shown (the filtered / current-page ids) so select-all and the
 * indeterminate state track what the user can actually see.
 *
 *   const ids = pageItems.map((r) => r.id);
 *   const sel = useRowSelection(ids);
 *   // header:  <Checkbox checked={sel.allSelected} indeterminate={sel.someSelected} onCheckedChange={sel.toggleAll} />
 *   // row:     <Checkbox checked={sel.isSelected(r.id)} onCheckedChange={() => sel.toggle(r.id)} />
 */
export function useRowSelection(pageIds: string[]): UseRowSelectionResult {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const isSelected = useCallback((id: string) => selected.has(id), [selected]);

  const set = useCallback((id: string, value: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedOnPage = useMemo(
    () => pageIds.filter((id) => selected.has(id)).length,
    [pageIds, selected]
  );

  const allSelected = pageIds.length > 0 && selectedOnPage === pageIds.length;
  const someSelected = selectedOnPage > 0 && selectedOnPage < pageIds.length;

  const toggleAll = useCallback(
    (value: boolean) => {
      setSelected((prev) => {
        const next = new Set(prev);
        for (const id of pageIds) {
          if (value) next.add(id);
          else next.delete(id);
        }
        return next;
      });
    },
    [pageIds]
  );

  const clear = useCallback(() => setSelected(new Set()), []);

  return {
    selected,
    count: selected.size,
    isSelected,
    toggle,
    set,
    allSelected,
    someSelected,
    toggleAll,
    clear,
  };
}

export default useRowSelection;
