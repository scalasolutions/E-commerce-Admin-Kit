"use client";

import * as React from "react";
import { Printer, MapPin, ScanLine } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { cn, formatPrice } from "@/lib/utils";
import {
  courierLabel,
  billableWeightKg,
  totalUnits,
  WAREHOUSE,
  type Shipment,
} from "./logistics-data";

/**
 * Turn a resi (or order code) into a stable set of barcode bar widths — no
 * Math.random, so it renders identically everywhere.
 */
function barcodeBars(seedStr: string): number[] {
  const src = seedStr || "0000000000";
  const bars: number[] = [];
  for (let i = 0; i < 44; i++) {
    const code = src.charCodeAt(i % src.length) + i * 7;
    bars.push((code % 3) + 1); // 1..3 px-ish weight
  }
  return bars;
}

function Barcode({ value }: { value: string }) {
  const bars = React.useMemo(() => barcodeBars(value), [value]);
  return (
    <div className="space-y-1">
      <div className="flex h-10 items-end gap-[2px]" aria-hidden="true">
        {bars.map((w, i) => (
          <span
            key={i}
            className="h-full bg-admin-text"
            style={{ width: `${w}px` }}
          />
        ))}
      </div>
      <p className="text-center font-mono text-xs tracking-[0.2em] text-admin-text">{value}</p>
    </div>
  );
}

/** One A6-ish waybill card. */
function LabelCard({ shipment }: { shipment: Shipment }) {
  const booked = Boolean(shipment.resi && shipment.courierCode);
  const weight = billableWeightKg(shipment.items);
  const units = totalUnits(shipment.items);

  return (
    <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-lg border-2 border-admin-text bg-admin-surface text-admin-text shadow-admin">
      {/* Header: courier + PAID stamp */}
      <div className="flex items-center justify-between border-b-2 border-admin-text px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-text-subdued">
            Courier
          </p>
          <p className="truncate text-lg font-extrabold leading-tight text-admin-text">
            {booked ? courierLabel(shipment.courierCode, shipment.service) : "Not booked"}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 -rotate-6 rounded border-2 px-2.5 py-1 text-xs font-black uppercase tracking-widest",
            shipment.paid
              ? "border-admin-success-text text-admin-success-text"
              : "border-admin-critical-text text-admin-critical-text"
          )}
        >
          {shipment.paid ? "Paid" : "Unpaid"}
        </span>
      </div>

      {/* Barcode / resi */}
      <div className="border-b-2 border-dashed border-admin-border px-4 py-3">
        {booked ? (
          <Barcode value={shipment.resi as string} />
        ) : (
          <div className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-admin-text-subdued">
            <ScanLine className="h-4 w-4" />
            Tracking number assigned on booking
          </div>
        )}
        <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-widest text-admin-text-subdued">
          Order {shipment.code}
        </p>
      </div>

      {/* Recipient */}
      <div className="border-b border-admin-border px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-text-subdued">
          Ship to
        </p>
        <p className="mt-0.5 text-sm font-bold text-admin-text">{shipment.address.recipient}</p>
        <p className="mt-0.5 flex items-start gap-1 text-xs text-admin-text-subdued">
          <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
          <span>
            {shipment.address.line1}, {shipment.address.city}, {shipment.address.province}{" "}
            {shipment.address.postalCode}
          </span>
        </p>
        <p className="mt-0.5 text-xs text-admin-text-subdued">{shipment.address.phone}</p>
      </div>

      {/* Sender */}
      <div className="border-b border-admin-border px-4 py-2.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-text-subdued">
          From
        </p>
        <p className="mt-0.5 text-xs font-semibold text-admin-text">{WAREHOUSE.name}</p>
        <p className="text-xs text-admin-text-subdued">
          {WAREHOUSE.line1}, {WAREHOUSE.city} {WAREHOUSE.postalCode} · {WAREHOUSE.phone}
        </p>
      </div>

      {/* Contents */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-text-subdued">
            Contents · {units} item{units === 1 ? "" : "s"}
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-admin-text-subdued">
            {weight} kg
          </p>
        </div>
        <ul className="mt-1.5 space-y-1">
          {shipment.items.map((it, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3 text-xs text-admin-text">
              <span className="min-w-0 truncate">{it.name}</span>
              <span className="shrink-0 font-mono text-admin-text-subdued">×{it.qty}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-admin-border pt-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-admin-text-subdued">
            {shipment.paid ? "Order total" : "Collect on delivery"}
          </span>
          <span className="text-sm font-extrabold text-admin-text">{formatPrice(shipment.total)}</span>
        </div>
      </div>
    </div>
  );
}

interface LabelPreviewModalProps {
  /** Shipments to preview. One card each. `null`/empty closes the modal. */
  shipments: Shipment[] | null;
  onClose: () => void;
}

/**
 * Shipping-label preview. Renders one waybill card per shipment (single Print
 * or bulk "Print waybills" both flow through here). The Print button calls the
 * browser's print dialog — the cards are already styled print-like.
 */
export default function LabelPreviewModal({ shipments, onClose }: LabelPreviewModalProps) {
  const open = Boolean(shipments && shipments.length > 0);
  const list = shipments ?? [];
  const many = list.length > 1;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={many ? `${list.length} waybills` : "Shipping label"}
      description={
        many
          ? "Preview before printing the batch."
          : list[0]
          ? `Order ${list[0].code} · ${list[0].customer}`
          : undefined
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" className="gap-1.5" onClick={() => window.print()}>
            <Printer className="h-4 w-4" />
            {many ? `Print ${list.length} waybills` : "Print label"}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {list.map((s) => (
          <LabelCard key={s.id} shipment={s} />
        ))}
      </div>
    </Modal>
  );
}
