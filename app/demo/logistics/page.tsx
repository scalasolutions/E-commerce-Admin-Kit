"use client";

import * as React from "react";
import {
  Truck,
  Printer,
  PackageCheck,
  CheckCircle2,
  Boxes,
  Send,
  MapPin,
  Package,
} from "lucide-react";
import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminTableShell from "@/components/admin/admin-table-shell";
import AdminSearchInput from "@/components/admin/admin-search-input";
import AdminFilterBar from "@/components/admin/admin-filter-bar";
import AdminStatusBadge from "@/components/admin/admin-status-badge";
import AdminStatCard from "@/components/admin/admin-stat-card";
import AdminBulkBar from "@/components/admin/admin-bulk-bar";
import { TableEmptyRow } from "@/components/admin/admin-table-states";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { usePagination } from "@/lib/hooks/use-pagination";
import { useRowSelection } from "@/lib/hooks/use-row-selection";
import { cn } from "@/lib/utils";
import { formatDateOnly } from "@/app/format";
import BookingModal, { type BookingResult } from "./booking-modal";
import LabelPreviewModal from "./label-preview";
import {
  demoShipments,
  STAGES,
  stageDef,
  courierLabel,
  getRates,
  deriveResi,
  type Shipment,
  type ShipmentStage,
} from "./logistics-data";

const COL_COUNT = 8;

const STAGE_ICON = {
  processing: Boxes,
  ready_to_ship: PackageCheck,
  shipped: Truck,
  completed: CheckCircle2,
} as const;

export default function LogisticsPage() {
  const [rows, setRows] = React.useState<Shipment[]>(demoShipments);
  const [stage, setStage] = React.useState<ShipmentStage>("processing");
  const [query, setQuery] = React.useState("");
  const [bookingOrder, setBookingOrder] = React.useState<Shipment | null>(null);
  const [labelOrders, setLabelOrders] = React.useState<Shipment[] | null>(null);

  const countByStage = React.useMemo(() => {
    const map: Record<ShipmentStage, number> = {
      processing: 0,
      ready_to_ship: 0,
      shipped: 0,
      completed: 0,
    };
    for (const s of rows) map[s.stage] += 1;
    return map;
  }, [rows]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((s) => {
      if (s.stage !== stage) return false;
      if (!q) return true;
      return (
        s.code.toLowerCase().includes(q) ||
        s.customer.toLowerCase().includes(q) ||
        s.address.city.toLowerCase().includes(q) ||
        (s.resi ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, stage, query]);

  const pagination = usePagination(filtered, { initialPageSize: 10 });
  const pageIds = React.useMemo(() => pagination.pageItems.map((s) => s.id), [pagination.pageItems]);
  const selection = useRowSelection(pageIds);

  // Clear the selection when switching stages — the visible rows change.
  const clearSelection = selection.clear;
  React.useEffect(() => {
    clearSelection();
  }, [stage, clearSelection]);

  const current = stageDef(stage);

  /* -------- stage transitions -------- */

  function applyBooking(order: Shipment, result: BookingResult): Shipment {
    return {
      ...order,
      stage: "ready_to_ship",
      courierCode: result.courierCode,
      service: result.service,
      resi: result.resi,
    };
  }

  function handleBooked(orderId: string, result: BookingResult) {
    let booked: Shipment | undefined;
    setRows((prev) =>
      prev.map((s) => {
        if (s.id !== orderId) return s;
        booked = applyBooking(s, result);
        return booked;
      })
    );
    setBookingOrder(null);
    // "…& print" — surface the freshly-minted waybill right away.
    if (booked) setLabelOrders([booked]);
  }

  function advanceOne(id: string) {
    setRows((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const def = stageDef(s.stage);
        return def.next ? { ...s, stage: def.next } : s;
      })
    );
  }

  /** Auto-book with a sensible default (JNE · REG) for bulk processing rows. */
  function quickBook(order: Shipment): Shipment {
    const rates = getRates("jne", order.address.postalCode, order.items);
    const reg = rates.find((r) => r.service === "REG") ?? rates[0];
    const service = reg?.service ?? "REG";
    return {
      ...order,
      stage: "ready_to_ship",
      courierCode: "jne",
      service,
      resi: deriveResi("jne", order.id, service),
    };
  }

  function handleBulkAdvance() {
    setRows((prev) =>
      prev.map((s) => {
        if (!selection.selected.has(s.id) || s.stage !== stage) return s;
        if (stage === "processing") return quickBook(s);
        const def = stageDef(s.stage);
        return def.next ? { ...s, stage: def.next } : s;
      })
    );
    selection.clear();
  }

  function handleBulkPrint() {
    const picked = rows.filter((s) => selection.selected.has(s.id));
    if (picked.length > 0) setLabelOrders(picked);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Logistics"
        description="Fulfillment queue — pick, pack, book couriers, and track shipments to delivery."
      />

      {/* Pipeline overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard title="Awaiting fulfillment" value={countByStage.processing} icon={Boxes} tone="warning" description="Need pick, pack & booking" />
        <AdminStatCard title="Ready to ship" value={countByStage.ready_to_ship} icon={PackageCheck} tone="info" description="Booked, awaiting handover" />
        <AdminStatCard title="In transit" value={countByStage.shipped} icon={Truck} tone="accent" description="Shipped, out for delivery" />
        <AdminStatCard title="Delivered" value={countByStage.completed} icon={CheckCircle2} tone="success" description="Completed orders" />
      </div>

      {/* Stage tabs */}
      <Segmented<ShipmentStage>
        value={stage}
        onChange={setStage}
        fullWidth
        aria-label="Fulfillment stage"
        options={STAGES.map((s) => {
          const Icon = STAGE_ICON[s.key];
          const active = s.key === stage;
          return {
            value: s.key,
            icon: <Icon className="h-4 w-4" />,
            label: (
              <span className="flex items-center gap-1.5">
                <span className="hidden sm:inline">{s.label}</span>
                <span
                  className={cn(
                    "inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                    active
                      ? "bg-admin-accent-subdued text-admin-accent"
                      : "bg-admin-surface-subdued text-admin-text-subdued"
                  )}
                >
                  {countByStage[s.key]}
                </span>
              </span>
            ),
          };
        })}
      />

      <AdminFilterBar
        search={
          <AdminSearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search order, customer, city or resi…"
          />
        }
      />

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
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Courier</TableHead>
              <TableHead>Resi</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableEmptyRow
                colSpan={COL_COUNT}
                message={
                  query
                    ? `No ${current.label.toLowerCase()} orders match “${query}”.`
                    : `Nothing in ${current.label} right now.`
                }
              />
            ) : (
              pagination.pageItems.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="w-10">
                    <Checkbox
                      checked={selection.isSelected(s.id)}
                      onCheckedChange={() => selection.toggle(s.id)}
                      aria-label={`Select ${s.code}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-admin-surface-subdued text-admin-text-disabled">
                        <Package className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="font-mono font-semibold text-admin-text">{s.code}</div>
                        <div className="text-xs text-admin-text-subdued">
                          {s.items.reduce((n, it) => n + it.qty, 0)} item
                          {s.items.reduce((n, it) => n + it.qty, 0) === 1 ? "" : "s"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <div className="truncate font-medium text-admin-text">{s.customer}</div>
                      <div className="flex items-center gap-1 text-xs text-admin-text-subdued">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{s.address.city}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <AdminStatusBadge status={s.stage} />
                  </TableCell>
                  <TableCell className="text-admin-text-subdued">
                    {courierLabel(s.courierCode, s.service)}
                  </TableCell>
                  <TableCell>
                    {s.resi ? (
                      <span className="font-mono text-xs text-admin-text">{s.resi}</span>
                    ) : (
                      <span className="text-admin-text-disabled">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-admin-text-subdued">{formatDateOnly(s.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <StagePrimaryAction
                        shipment={s}
                        onBook={() => setBookingOrder(s)}
                        onAdvance={() => advanceOne(s.id)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={() => setLabelOrders([s])}
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span className="hidden lg:inline">Print</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </AdminTableShell>

      {/* Bulk actions */}
      <AdminBulkBar count={selection.count} onClear={selection.clear} label="{count} order(s)">
        <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={handleBulkPrint}>
          <Printer className="h-3.5 w-3.5" />
          Bulk print waybills
        </Button>
        {current.bulkLabel && (
          <Button variant="primary" size="sm" className="h-9 gap-1.5" onClick={handleBulkAdvance}>
            {stage === "processing" ? (
              <Truck className="h-3.5 w-3.5" />
            ) : stage === "ready_to_ship" ? (
              <Send className="h-3.5 w-3.5" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" />
            )}
            {current.bulkLabel}
          </Button>
        )}
      </AdminBulkBar>

      {/* Flows */}
      <BookingModal order={bookingOrder} onClose={() => setBookingOrder(null)} onBooked={handleBooked} />
      <LabelPreviewModal shipments={labelOrders} onClose={() => setLabelOrders(null)} />
    </div>
  );
}

/** The stage-appropriate advance button for a single row. */
function StagePrimaryAction({
  shipment,
  onBook,
  onAdvance,
}: {
  shipment: Shipment;
  onBook: () => void;
  onAdvance: () => void;
}) {
  if (shipment.stage === "processing") {
    return (
      <Button variant="primary" size="sm" className="h-8 gap-1.5" onClick={onBook}>
        <Truck className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Book courier</span>
      </Button>
    );
  }
  if (shipment.stage === "ready_to_ship") {
    return (
      <Button variant="secondary" size="sm" className="h-8 gap-1.5" onClick={onAdvance}>
        <Send className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Mark shipped</span>
      </Button>
    );
  }
  if (shipment.stage === "shipped") {
    return (
      <Button variant="secondary" size="sm" className="h-8 gap-1.5" onClick={onAdvance}>
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span className="hidden md:inline">Mark delivered</span>
      </Button>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-admin-success-text">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Delivered
    </span>
  );
}
