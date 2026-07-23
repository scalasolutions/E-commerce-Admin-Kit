"use client";

import * as React from "react";
import {
  Truck,
  MapPin,
  Scale,
  Search,
  Check,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/app/format";
import {
  COURIERS,
  getRates,
  billableWeightKg,
  totalUnits,
  deriveResi,
  type Shipment,
  type Rate,
} from "./logistics-data";

export interface BookingResult {
  courierCode: string;
  service: string;
  resi: string;
  bookedRate: number;
}

interface BookingModalProps {
  /** The order being booked; `null` keeps the modal closed. */
  order: Shipment | null;
  onClose: () => void;
  onBooked: (orderId: string, result: BookingResult) => void;
}

/**
 * Guided courier-booking flow inside a Modal:
 *   summary → destination → courier → get rates → pick a rate → book.
 * All state is local; on "Book shipment" it mints a deterministic resi and
 * hands the result back to the page via `onBooked`.
 */
export default function BookingModal({ order, onClose, onBooked }: BookingModalProps) {
  const [postal, setPostal] = React.useState("");
  const [courierCode, setCourierCode] = React.useState("jne");
  const [rates, setRates] = React.useState<Rate[] | null>(null);
  const [selectedRateId, setSelectedRateId] = React.useState<string | null>(null);
  const [quoting, setQuoting] = React.useState(false);
  const [booking, setBooking] = React.useState(false);

  // Reset the flow whenever a different order opens the modal.
  React.useEffect(() => {
    if (!order) return;
    setPostal(order.address.postalCode);
    setCourierCode("jne");
    setRates(null);
    setSelectedRateId(null);
    setQuoting(false);
    setBooking(false);
  }, [order?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!order) return null;

  const weight = billableWeightKg(order.items);
  const units = totalUnits(order.items);
  const selectedRate = rates?.find((r) => r.id === selectedRateId) ?? null;

  function handleGetRates() {
    if (!order) return;
    setQuoting(true);
    setRates(null);
    setSelectedRateId(null);
    // Fake network latency.
    window.setTimeout(() => {
      const next = getRates(courierCode, postal, order.items);
      setRates(next);
      // Pre-select the cheapest so the flow always has a sensible default.
      const cheapest = [...next].sort((a, b) => a.price - b.price)[0];
      setSelectedRateId(cheapest?.id ?? null);
      setQuoting(false);
    }, 550);
  }

  // Re-quote required when the courier or destination changes.
  function handleCourierChange(code: string) {
    setCourierCode(code);
    setRates(null);
    setSelectedRateId(null);
  }
  function handlePostalChange(value: string) {
    setPostal(value.replace(/\D/g, "").slice(0, 5));
    setRates(null);
    setSelectedRateId(null);
  }

  async function handleBook() {
    if (!order || !selectedRate) return;
    setBooking(true);
    await new Promise((r) => setTimeout(r, 700));
    const resi = deriveResi(selectedRate.courierCode, order.id, selectedRate.service);
    onBooked(order.id, {
      courierCode: selectedRate.courierCode,
      service: selectedRate.service,
      resi,
      bookedRate: selectedRate.price,
    });
    setBooking(false);
  }

  const overCollected = selectedRate ? selectedRate.price > order.shippingPaid : false;

  return (
    <Modal
      open={Boolean(order)}
      onClose={onClose}
      size="lg"
      title="Book courier"
      description={`Order ${order.code} · ${order.customer}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={booking}>
            Cancel
          </Button>
          <Button
            variant="primary"
            className="gap-1.5"
            onClick={handleBook}
            disabled={!selectedRate || booking}
          >
            {booking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Booking…
              </>
            ) : (
              <>
                <Truck className="h-4 w-4" />
                Book shipment
              </>
            )}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* 1 · Order summary */}
        <div className="grid grid-cols-3 gap-3">
          <SummaryTile
            icon={<Scale className="h-4 w-4" />}
            label="Est. weight"
            value={`${weight} kg`}
            hint={`${units} item${units === 1 ? "" : "s"}`}
          />
          <SummaryTile
            icon={<Truck className="h-4 w-4" />}
            label="Order total"
            value={formatPrice(order.total)}
            hint={order.paid ? "Paid" : "Unpaid (COD)"}
          />
          <SummaryTile
            icon={<MapPin className="h-4 w-4" />}
            label="Destination"
            value={order.address.city}
            hint={order.address.province}
          />
        </div>

        <div className="rounded-lg border border-admin-border-subtle bg-admin-surface-subdued/50 px-3 py-2.5 text-xs text-admin-text-subdued">
          <span className="font-medium text-admin-text">{order.address.recipient}</span> ·{" "}
          {order.address.line1}, {order.address.city}, {order.address.province}
        </div>

        {/* 2 · Destination + 3 · Courier */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="postal">Destination postal code</Label>
            <Input
              id="postal"
              inputMode="numeric"
              value={postal}
              onChange={(e) => handlePostalChange(e.target.value)}
              placeholder="12730"
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="courier">Courier</Label>
            <Select id="courier" value={courierCode} onValueChange={handleCourierChange}>
              {COURIERS.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* 4 · Get rates */}
        <Button
          variant="secondary"
          className="w-full gap-1.5"
          onClick={handleGetRates}
          disabled={quoting || postal.length < 5}
        >
          {quoting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking rates…
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              {rates ? "Refresh rates" : "Get rates"}
            </>
          )}
        </Button>

        {postal.length < 5 && (
          <p className="-mt-3 text-xs text-admin-text-subdued">
            Enter a 5-digit postal code to fetch rates.
          </p>
        )}

        {/* Rate options */}
        {rates && rates.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-admin-text-subdued">
              Choose a service
            </p>
            <div className="space-y-2">
              {rates.map((rate) => {
                const active = rate.id === selectedRateId;
                return (
                  <button
                    key={rate.id}
                    type="button"
                    onClick={() => setSelectedRateId(rate.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                      active
                        ? "border-admin-accent bg-admin-accent-subdued ring-1 ring-admin-accent"
                        : "border-admin-border bg-admin-surface hover:bg-admin-surface-hover"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        active ? "border-admin-accent bg-admin-accent text-white" : "border-admin-border"
                      )}
                    >
                      {active && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-admin-text">{rate.service}</span>
                        <span className="rounded-full bg-admin-surface-subdued px-2 py-0.5 text-[10px] font-medium text-admin-text-subdued">
                          {rate.etd}
                        </span>
                      </div>
                    </div>
                    <span className="shrink-0 font-semibold tabular-nums text-admin-text">
                      {rate.price === 0 ? "Free" : formatPrice(rate.price)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 5 · Paid vs. books-at comparison */}
            {selectedRate && (
              <div
                className={cn(
                  "flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs",
                  overCollected
                    ? "bg-admin-warning-bg text-admin-warning-text"
                    : "bg-admin-success-bg text-admin-success-text"
                )}
              >
                {overCollected ? (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : (
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                )}
                <span>
                  Customer paid{" "}
                  <span className="font-semibold">{formatPrice(order.shippingPaid)}</span> shipping ·
                  books at{" "}
                  <span className="font-semibold">
                    {selectedRate.price === 0 ? "Free" : formatPrice(selectedRate.price)}
                  </span>
                  {overCollected
                    ? ` — ${formatPrice(selectedRate.price - order.shippingPaid)} over what was collected.`
                    : selectedRate.price < order.shippingPaid
                    ? ` — ${formatPrice(order.shippingPaid - selectedRate.price)} margin.`
                    : " — breaks even."}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function SummaryTile({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-admin-border bg-admin-surface p-3">
      <div className="flex items-center gap-1.5 text-admin-text-subdued">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1.5 truncate text-sm font-semibold text-admin-text">{value}</p>
      <p className="truncate text-[11px] text-admin-text-subdued">{hint}</p>
    </div>
  );
}
