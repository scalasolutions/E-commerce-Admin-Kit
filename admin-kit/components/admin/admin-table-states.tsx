import * as React from "react";
import { Loader2 } from "lucide-react";
import { TableRow, TableCell } from "@/components/ui/table";

/**
 * Standard in-table loading / empty rows — the two states every admin table
 * repeats. Both span the full width via `colSpan`, so pass the number of
 * columns. Render one instead of the `<TableBody>` rows while loading / empty:
 *
 *   <TableBody>
 *     {loading ? (
 *       <TableLoadingRow colSpan={6} />
 *     ) : rows.length === 0 ? (
 *       <TableEmptyRow colSpan={6} message="No products found." />
 *     ) : (
 *       rows.map(…)
 *     )}
 *   </TableBody>
 */

export function TableLoadingRow({ colSpan, label = "Loading…" }: { colSpan: number; label?: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-10 text-center text-sm text-admin-text-subdued">
        <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
        {label}
      </TableCell>
    </TableRow>
  );
}

export function TableEmptyRow({
  colSpan,
  message = "Nothing to show.",
}: {
  colSpan: number;
  message?: React.ReactNode;
}) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-10 text-center text-sm text-admin-text-subdued">
        {message}
      </TableCell>
    </TableRow>
  );
}
