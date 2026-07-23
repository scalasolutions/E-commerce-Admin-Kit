"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, Ticket, Percent, Truck, Tag } from "lucide-react";
import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminTableShell from "@/components/admin/admin-table-shell";
import AdminSearchInput from "@/components/admin/admin-search-input";
import AdminFilterBar from "@/components/admin/admin-filter-bar";
import AdminStatusBadge from "@/components/admin/admin-status-badge";
import { TableEmptyRow } from "@/components/admin/admin-table-states";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { usePagination } from "@/lib/hooks/use-pagination";
import { formatPrice } from "@/lib/utils";
import { demoVouchers, regionLabel, type DemoVoucher } from "./vouchers-data";

function discountLabel(v: DemoVoucher) {
  if (v.discountType === "free_shipping") return "Free shipping";
  if (v.discountType === "percentage") return `${v.discountValue}% off`;
  return `${formatPrice(v.discountValue)} off`;
}

function DiscountIcon({ type }: { type: DemoVoucher["discountType"] }) {
  const Icon = type === "free_shipping" ? Truck : type === "percentage" ? Percent : Tag;
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-admin-accent-subdued text-admin-accent">
      <Icon className="h-4 w-4" />
    </span>
  );
}

function shortDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function VouchersPage() {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return demoVouchers.filter((v) => {
      const matchesQ = !q || v.code.toLowerCase().includes(q);
      const matchesS = !statusFilter || v.status === statusFilter;
      return matchesQ && matchesS;
    });
  }, [query, statusFilter]);

  const pagination = usePagination(filtered, { initialPageSize: 10 });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Vouchers"
        description="Discount codes customers can redeem at checkout."
        actionLabel="Create voucher"
        actionHref="/demo/vouchers/new"
      />

      <AdminFilterBar
        search={<AdminSearchInput value={query} onChange={setQuery} placeholder="Search code…" />}
      >
        <Select className="h-9 w-40 text-xs" value={statusFilter} onValueChange={setStatusFilter}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </Select>
      </AdminFilterBar>

      <AdminTableShell pagination={filtered.length > 0 ? pagination : null}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voucher</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableEmptyRow colSpan={7} message={`No vouchers match “${query}”.`} />
            ) : (
              pagination.pageItems.map((v) => {
                const pct = Math.min(100, Math.round((v.used / v.usageLimit) * 100));
                return (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <DiscountIcon type={v.discountType} />
                        <div className="min-w-0">
                          <div className="font-mono font-semibold text-admin-text">{v.code}</div>
                          {v.isFeatured && (
                            <Badge variant="info" className="mt-0.5">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-admin-text">{discountLabel(v)}</TableCell>
                    <TableCell className="text-admin-text-subdued">
                      {shortDate(v.startDate)} – {shortDate(v.expiryDate)}
                    </TableCell>
                    <TableCell>
                      <div className="w-28">
                        <div className="flex justify-between text-xs text-admin-text-subdued">
                          <span>
                            {v.used}/{v.usageLimit}
                          </span>
                          <span>{pct}%</span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-admin-surface-subdued">
                          <div
                            className={pct >= 100 ? "h-full bg-admin-critical-text" : "h-full bg-admin-accent"}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-admin-text-subdued">{regionLabel(v.region)}</TableCell>
                    <TableCell>
                      <AdminStatusBadge status={v.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/demo/vouchers/${v.id}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-admin-text-subdued transition-colors hover:bg-admin-surface-subdued hover:text-admin-text"
                        aria-label={`Edit ${v.code}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </AdminTableShell>
    </div>
  );
}
