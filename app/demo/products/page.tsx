"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Plus, Upload, Package } from "lucide-react";
import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminTableShell from "@/components/admin/admin-table-shell";
import AdminSearchInput from "@/components/admin/admin-search-input";
import AdminQuickActions from "@/components/admin/admin-quick-actions";
import AdminInlineStatusSelect from "@/components/admin/admin-inline-status-select";
import AdminEmptyState from "@/components/admin/admin-empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePagination } from "@/lib/hooks/use-pagination";
import { formatPrice } from "@/lib/utils";
import { demoProducts, type DemoProduct } from "../demo-data";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "inactive", label: "Inactive" },
];

export default function ProductsPage() {
  const [query, setQuery] = React.useState("");
  const [rows, setRows] = React.useState<DemoProduct[]>(demoProducts);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const pagination = usePagination(filtered, { initialPageSize: 10 });

  async function updateStatus(id: string, status: string) {
    // Simulate a save round-trip so the inline pill shows its spinner.
    await new Promise((r) => setTimeout(r, 500));
    setRows((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: status as DemoProduct["status"] } : p))
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Products"
        description="Your catalog — search, edit, and manage stock."
        actionLabel="Add product"
        actionHref="/demo/products/new"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-72 max-w-full">
          <AdminSearchInput value={query} onChange={setQuery} placeholder="Search name or SKU…" />
        </div>
        <AdminQuickActions
          actions={[
            { label: "Add product", href: "/demo/products/new", icon: Plus },
            { label: "Import CSV", href: "/demo/products", icon: Upload },
          ]}
        />
      </div>

      {filtered.length === 0 ? (
        <AdminEmptyState
          title="No products found"
          description={`Nothing matches “${query}”. Try a different search.`}
        />
      ) : (
        <AdminTableShell pagination={pagination}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagination.pageItems.map((p) => (
                <TableRow key={p.id}>
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
              ))}
            </TableBody>
          </Table>
        </AdminTableShell>
      )}
    </div>
  );
}
