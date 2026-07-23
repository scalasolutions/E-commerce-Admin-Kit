"use client";

import * as React from "react";
import Link from "next/link";
import { Pencil, ClipboardList, Clock, PackageCheck, Wallet } from "lucide-react";
import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminTableShell from "@/components/admin/admin-table-shell";
import AdminSearchInput from "@/components/admin/admin-search-input";
import AdminFilterBar from "@/components/admin/admin-filter-bar";
import AdminStatusBadge from "@/components/admin/admin-status-badge";
import AdminStatCard from "@/components/admin/admin-stat-card";
import { TableEmptyRow } from "@/components/admin/admin-table-states";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { usePagination } from "@/lib/hooks/use-pagination";
import { formatPrice } from "@/lib/utils";
import {
  demoOrders,
  paymentMethodLabel,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
} from "./orders-data";

function itemCount(items: { qty: number }[]) {
  return items.reduce((n, i) => n + i.qty, 0);
}

function shortDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OrdersPage() {
  const [query, setQuery] = React.useState("");
  const [orderStatus, setOrderStatus] = React.useState("");
  const [paymentStatus, setPaymentStatus] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return demoOrders.filter((o) => {
      const matchesQ =
        !q || o.code.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q);
      const matchesOrder = !orderStatus || o.orderStatus === orderStatus;
      const matchesPayment = !paymentStatus || o.paymentStatus === paymentStatus;
      return matchesQ && matchesOrder && matchesPayment;
    });
  }, [query, orderStatus, paymentStatus]);

  const pagination = usePagination(filtered, { initialPageSize: 10 });

  const stats = React.useMemo(() => {
    const awaiting = demoOrders.filter((o) => o.orderStatus === "pending_payment").length;
    const toFulfil = demoOrders.filter(
      (o) => o.orderStatus === "paid" || o.orderStatus === "processing" || o.orderStatus === "ready_to_ship"
    ).length;
    const revenue = demoOrders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.total, 0);
    return { total: demoOrders.length, awaiting, toFulfil, revenue };
  }, []);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="Every order placed through the storefront, from payment to delivery."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard title="Total orders" value={stats.total} icon={ClipboardList} tone="accent" />
        <AdminStatCard
          title="Awaiting payment"
          value={stats.awaiting}
          description="Not yet paid"
          icon={Clock}
          tone="warning"
        />
        <AdminStatCard
          title="To fulfil"
          value={stats.toFulfil}
          description="Paid, not shipped"
          icon={PackageCheck}
          tone="info"
        />
        <AdminStatCard
          title="Paid revenue"
          value={formatPrice(stats.revenue)}
          icon={Wallet}
          tone="success"
        />
      </div>

      <AdminFilterBar
        search={
          <AdminSearchInput value={query} onChange={setQuery} placeholder="Search code or customer…" />
        }
      >
        <Select className="h-9 w-44 text-xs" value={orderStatus} onValueChange={setOrderStatus}>
          <option value="">All order statuses</option>
          {ORDER_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
        <Select className="h-9 w-44 text-xs" value={paymentStatus} onValueChange={setPaymentStatus}>
          <option value="">All payment statuses</option>
          {PAYMENT_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </AdminFilterBar>

      <AdminTableShell pagination={filtered.length > 0 ? pagination : null}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Resi</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Edit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableEmptyRow colSpan={8} message={`No orders match your filters.`} />
            ) : (
              pagination.pageItems.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <Link
                      href={`/demo/orders/${o.id}`}
                      className="font-mono font-semibold text-admin-text hover:text-admin-accent"
                    >
                      {o.code}
                    </Link>
                    <div className="text-xs text-admin-text-subdued">
                      {itemCount(o.items)} item{itemCount(o.items) === 1 ? "" : "s"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-admin-text">{o.customer.name}</div>
                    <div className="text-xs text-admin-text-subdued">{o.customer.phone}</div>
                  </TableCell>
                  <TableCell className="font-medium text-admin-text">{formatPrice(o.total)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <AdminStatusBadge status={o.paymentStatus} context="payment" />
                      <span className="text-xs text-admin-text-subdued">
                        {paymentMethodLabel(o.paymentMethod, o.paymentProvider)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge status={o.orderStatus} context="order" />
                  </TableCell>
                  <TableCell className="font-mono text-xs text-admin-text-subdued">
                    {o.resi || "—"}
                  </TableCell>
                  <TableCell className="text-admin-text-subdued">{shortDateTime(o.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/demo/orders/${o.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-admin-text-subdued transition-colors hover:bg-admin-surface-subdued hover:text-admin-text"
                      aria-label={`Edit ${o.code}`}
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
    </div>
  );
}
