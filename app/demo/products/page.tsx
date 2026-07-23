"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Plus, Upload, Package, Trash2 } from "lucide-react";
import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminTableShell from "@/components/admin/admin-table-shell";
import AdminSearchInput from "@/components/admin/admin-search-input";
import AdminQuickActions from "@/components/admin/admin-quick-actions";
import AdminInlineStatusSelect from "@/components/admin/admin-inline-status-select";
import AdminFilterBar from "@/components/admin/admin-filter-bar";
import AdminBulkBar from "@/components/admin/admin-bulk-bar";
import { TableEmptyRow } from "@/components/admin/admin-table-states";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { usePagination } from "@/lib/hooks/use-pagination";
import { useRowSelection } from "@/lib/hooks/use-row-selection";
import { formatPrice } from "@/lib/utils";
import { demoProducts, type DemoProduct } from "../demo-data";

const COL_COUNT = 7;
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "inactive", label: "Inactive" },
];

export default function ProductsPage() {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  const [rows, setRows] = React.useState<DemoProduct[]>(demoProducts);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((p) => {
      const matchesQuery =
        !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || p.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [rows, query, statusFilter]);

  const pagination = usePagination(filtered, { initialPageSize: 10 });
  const pageIds = React.useMemo(() => pagination.pageItems.map((p) => p.id), [pagination.pageItems]);
  const selection = useRowSelection(pageIds);

  async function updateStatus(id: string, status: string) {
    await new Promise((r) => setTimeout(r, 500));
    setRows((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: status as DemoProduct["status"] } : p))
    );
  }

  function bulkSetStatus(status: string) {
    if (!status) return;
    setRows((prev) =>
      prev.map((p) =>
        selection.selected.has(p.id) ? { ...p, status: status as DemoProduct["status"] } : p
      )
    );
    selection.clear();
  }

  async function bulkDelete() {
    await new Promise((r) => setTimeout(r, 600));
    setRows((prev) => prev.filter((p) => !selection.selected.has(p.id)));
    selection.clear();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description="Your catalog — search, filter, bulk-edit, and manage stock."
        actionLabel="Add product"
        actionHref="/demo/products/new"
      />

      <AdminFilterBar
        search={<AdminSearchInput value={query} onChange={setQuery} placeholder="Search name or SKU…" />}
      >
        <Select
          className="h-9 w-full text-xs sm:w-40"
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </Select>
        <AdminQuickActions
          actions={[
            { label: "Add product", href: "/demo/products/new", icon: Plus },
            { label: "Import CSV", href: "/demo/products", icon: Upload },
          ]}
        />
      </AdminFilterBar>

      <AdminTableShell pagination={filtered.length > 0 ? pagination : null}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selection.allSelected}
                  indeterminate={selection.someSelected}
                  onCheckedChange={selection.toggleAll}
                  aria-label="Select all on page"
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableEmptyRow colSpan={COL_COUNT} message={`Nothing matches “${query}”.`} />
            ) : (
              pagination.pageItems.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="w-10">
                    <Checkbox
                      checked={selection.isSelected(p.id)}
                      onCheckedChange={() => selection.toggle(p.id)}
                      aria-label={`Select ${p.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-admin-surface-subdued text-admin-text-disabled">
                        <Package className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-admin-text">{p.name}</div>
                        <div className="text-xs text-admin-text-subdued">{p.sku}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-admin-text-subdued">{p.category}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(p.price)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {p.stock === 0 ? (
                      <span className="font-semibold text-admin-critical-text">Out</span>
                    ) : (
                      p.stock
                    )}
                  </TableCell>
                  <TableCell>
                    <AdminInlineStatusSelect
                      value={p.status}
                      options={STATUS_OPTIONS}
                      onChange={(s) => updateStatus(p.id, s)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/demo/products/${p.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-admin-text-subdued transition-colors hover:bg-admin-surface-subdued hover:text-admin-text"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableShell>

      <AdminBulkBar count={selection.count} onClear={selection.clear}>
        <Select
          className="h-9 w-full text-xs sm:w-44"
          value=""
          placeholder="Set status…"
          onValueChange={bulkSetStatus}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 text-admin-critical-text hover:text-admin-critical-text"
          onClick={() => setConfirmOpen(true)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>
      </AdminBulkBar>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={bulkDelete}
        title={`Delete ${selection.count} product${selection.count === 1 ? "" : "s"}?`}
        description="This can’t be undone. The selected products will be removed from your catalog."
        confirmLabel="Delete"
      />
    </div>
  );
}
