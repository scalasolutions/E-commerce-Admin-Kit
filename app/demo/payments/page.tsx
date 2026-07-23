"use client";

import * as React from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  TimerOff,
  Info,
  QrCode,
  Landmark,
  Wallet,
  Store,
  type LucideIcon,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminTableShell from "@/components/admin/admin-table-shell";
import AdminSearchInput from "@/components/admin/admin-search-input";
import AdminFilterBar from "@/components/admin/admin-filter-bar";
import AdminStatusBadge from "@/components/admin/admin-status-badge";
import AdminStatCard from "@/components/admin/admin-stat-card";
import AdminSectionCard from "@/components/admin/admin-section-card";
import { TableEmptyRow } from "@/components/admin/admin-table-states";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { usePagination } from "@/lib/hooks/use-pagination";
import { formatPrice, formatDate } from "@/lib/utils";
import {
  demoPayments,
  demoWebhookEvents,
  countByStatus,
  type DemoPayment,
  type MethodType,
  type PaymentStatus,
} from "./payments-data";

const METHOD_ICON: Record<MethodType, LucideIcon> = {
  qris: QrCode,
  virtual_account: Landmark,
  ewallet: Wallet,
  pay_at_store: Store,
};

function MethodIcon({ type }: { type: MethodType }) {
  const Icon = METHOD_ICON[type];
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-admin-accent-subdued text-admin-accent">
      <Icon className="h-4 w-4" />
    </span>
  );
}

export default function PaymentsPage() {
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("");
  // Local overrides for the fake "Simulate pay" interaction (id → new status).
  const [overrides, setOverrides] = React.useState<Record<string, PaymentStatus>>({});
  // Rows currently mid-simulation, so their button can show a settling state.
  const [settling, setSettling] = React.useState<Record<string, boolean>>({});

  const payments = React.useMemo<DemoPayment[]>(
    () => demoPayments.map((p) => (overrides[p.id] ? { ...p, status: overrides[p.id] } : p)),
    [overrides]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return payments.filter((p) => {
      const matchesQ =
        !q || p.orderCode.toLowerCase().includes(q) || p.customer.toLowerCase().includes(q);
      const matchesS = !statusFilter || p.status === statusFilter;
      return matchesQ && matchesS;
    });
  }, [payments, query, statusFilter]);

  const pagination = usePagination(filtered, { initialPageSize: 10 });

  function simulatePay(id: string) {
    setSettling((s) => ({ ...s, [id]: true }));
    setTimeout(() => {
      setOverrides((o) => ({ ...o, [id]: "paid" }));
      setSettling((s) => {
        const next = { ...s };
        delete next[id];
        return next;
      });
    }, 900);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Payments"
        description="Gateway transactions synced from Xendit."
      />

      <div className="flex items-start gap-3 rounded-xl border border-admin-border-subtle bg-admin-surface-subdued px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-admin-text-subdued" />
        <p className="text-xs text-admin-text-subdued">
          Payments sync from the gateway and update via webhooks. This is demo data — the
          &ldquo;Simulate pay&rdquo; action only changes the row locally.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          title="Pending"
          value={countByStatus(payments, "pending")}
          icon={Clock}
          tone="warning"
        />
        <AdminStatCard
          title="Paid"
          value={countByStatus(payments, "paid")}
          icon={CheckCircle2}
          tone="success"
        />
        <AdminStatCard
          title="Failed"
          value={countByStatus(payments, "failed")}
          icon={XCircle}
          tone="critical"
        />
        <AdminStatCard
          title="Expired"
          value={countByStatus(payments, "expired")}
          icon={TimerOff}
          tone="accent"
        />
      </div>

      <AdminFilterBar
        search={
          <AdminSearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search order or customer…"
          />
        }
      >
        <Select className="h-9 w-40 text-xs" value={statusFilter} onValueChange={setStatusFilter}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="expired">Expired</option>
        </Select>
      </AdminFilterBar>

      <AdminTableShell pagination={filtered.length > 0 ? pagination : null}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableEmptyRow colSpan={8} message={`No payments match “${query}”.`} />
            ) : (
              pagination.pageItems.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="font-mono font-semibold text-admin-text">{p.orderCode}</span>
                  </TableCell>
                  <TableCell className="text-admin-text">{p.customer}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <MethodIcon type={p.methodType} />
                      <span className="text-admin-text">{p.methodLabel}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-admin-text-subdued">{p.reference}</span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-admin-text">
                    {formatPrice(p.amount)}
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge status={p.status} context="payment" />
                  </TableCell>
                  <TableCell className="text-admin-text-subdued">{formatDate(p.updatedAt)}</TableCell>
                  <TableCell className="text-right">
                    {p.status === "pending" ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => simulatePay(p.id)}
                        disabled={settling[p.id]}
                      >
                        {settling[p.id] ? "Settling…" : "Simulate pay"}
                      </Button>
                    ) : (
                      <span className="text-xs text-admin-text-subdued">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableShell>

      <AdminSectionCard
        title="Webhook events"
        description="Recent gateway callbacks received by the store."
      >
        <div className="w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoWebhookEvents.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <span className="block max-w-[180px] truncate font-mono text-xs text-admin-text-subdued">
                      {e.id}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-admin-text">{e.type}</span>
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge status={e.status} />
                  </TableCell>
                  <TableCell className="text-admin-text-subdued">{formatDate(e.receivedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AdminSectionCard>
    </div>
  );
}
