"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Printer,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import AdminSectionCard from "@/components/admin/admin-section-card";
import AdminStatusBadge from "@/components/admin/admin-status-badge";
import AdminActionBar from "@/components/admin/admin-action-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fireConfetti } from "@/components/ui/confetti";
import { formatPrice } from "@/app/format";
import {
  findOrder,
  paymentMethodLabel,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  type OrderStatus,
  type PaymentStatus,
} from "../orders-data";

function longDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const order = findOrder(params.id);

  // Hooks must run unconditionally — seed from the order when present.
  const [orderStatus, setOrderStatus] = React.useState<OrderStatus>(
    order?.orderStatus ?? "pending_payment"
  );
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus>(
    order?.paymentStatus ?? "pending"
  );
  const [provider, setProvider] = React.useState(order?.shippingProvider ?? "");
  const [resi, setResi] = React.useState(order?.resi ?? "");
  const [notes, setNotes] = React.useState(order?.notes ?? "");
  const [saving, setSaving] = React.useState(false);

  if (!order) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push("/demo/orders")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-admin-text-subdued transition-colors hover:text-admin-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </button>
        <div className="rounded-xl border border-admin-border bg-admin-surface p-10 text-center shadow-admin">
          <p className="text-sm text-admin-text-subdued">
            No order found for <span className="font-mono text-admin-text">{params.id}</span>.
          </p>
        </div>
      </div>
    );
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    if (orderStatus === "completed" || orderStatus === "shipped") fireConfetti();
  }

  return (
    <div className="space-y-6 pb-24">
      <button
        onClick={() => router.push("/demo/orders")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-admin-text-subdued transition-colors hover:text-admin-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-admin-text">{order.code}</h1>
          <p className="mt-1 text-sm text-admin-text-subdued">
            Placed by {order.customer.name}
          </p>
        </div>
        <AdminStatusBadge status={orderStatus} context="order" />
      </div>

      {/* 1. Overview strip */}
      <AdminSectionCard title="Overview" description="Where this order stands right now.">
        <dl className="grid gap-6 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-admin-text-subdued">Placed</dt>
            <dd className="mt-1 text-sm font-medium text-admin-text">{longDateTime(order.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-admin-text-subdued">Payment</dt>
            <dd className="mt-1.5">
              <AdminStatusBadge status={paymentStatus} context="payment" />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-admin-text-subdued">Fulfillment</dt>
            <dd className="mt-1.5">
              <AdminStatusBadge status={orderStatus} context="order" />
            </dd>
          </div>
        </dl>
      </AdminSectionCard>

      {/* 2. Customer & Delivery */}
      <AdminSectionCard title="Customer & Delivery" description="Who the order is for and where it ships.">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <InfoRow icon={<User className="h-4 w-4" />} label="Name" value={order.customer.name} />
            <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={order.customer.phone} />
            <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={order.customer.email} />
          </div>
          <div className="flex gap-3">
            <span className="mt-0.5 shrink-0 text-admin-text-subdued">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-admin-text-subdued">
                Shipping address
              </p>
              <p className="mt-1 text-sm leading-relaxed text-admin-text">{order.customer.address}</p>
            </div>
          </div>
        </div>
      </AdminSectionCard>

      {/* 3. Order Items */}
      <AdminSectionCard title="Order Items" description="Products, quantities, and the order total.">
        <div className="-mx-6 -mt-2 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Product</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="pr-6 text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell className="pl-6 font-medium text-admin-text">{item.name}</TableCell>
                  <TableCell className="text-center text-admin-text-subdued">{item.qty}</TableCell>
                  <TableCell className="text-right text-admin-text-subdued">
                    {formatPrice(item.price)}
                  </TableCell>
                  <TableCell className="pr-6 text-right font-medium text-admin-text">
                    {formatPrice(item.price * item.qty)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-xs space-y-2 text-sm">
            <TotalRow label="Subtotal" value={formatPrice(order.subtotal)} />
            {order.discount > 0 && (
              <TotalRow label="Discount" value={`− ${formatPrice(order.discount)}`} muted />
            )}
            {order.voucherDiscount > 0 && (
              <TotalRow
                label={`Voucher (${order.voucherCode})`}
                value={`− ${formatPrice(order.voucherDiscount)}`}
                muted
              />
            )}
            <TotalRow
              label={`Shipping${order.shippingProvider ? ` (${order.shippingProvider})` : ""}`}
              value={order.shippingCost > 0 ? formatPrice(order.shippingCost) : "Free"}
            />
            <div className="flex items-center justify-between border-t border-admin-border-subtle pt-2">
              <dt className="font-semibold text-admin-text">Total</dt>
              <dd className="text-base font-bold text-admin-text">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>
      </AdminSectionCard>

      {/* 4. Payment */}
      <AdminSectionCard title="Payment" description="How the customer paid and the transaction trail.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Method</Label>
            <div className="flex h-9 items-center rounded-lg border border-admin-border bg-admin-surface-subdued px-3 text-sm text-admin-text">
              {paymentMethodLabel(order.paymentMethod, order.paymentProvider)}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="payment-status">Payment status</Label>
            <Select
              id="payment-status"
              value={paymentStatus}
              onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}
            >
              {PAYMENT_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-admin-text-subdued">
            Transactions
          </p>
          <div className="overflow-x-auto rounded-lg border border-admin-border-subtle">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Reference</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="pr-4">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.transactions.map((t) => (
                  <TableRow key={t.reference}>
                    <TableCell className="pl-4 font-mono text-xs text-admin-text">{t.reference}</TableCell>
                    <TableCell className="text-admin-text-subdued">{t.method}</TableCell>
                    <TableCell className="text-right text-admin-text">{formatPrice(t.amount)}</TableCell>
                    <TableCell className="pr-4">
                      <AdminStatusBadge status={t.status} context="payment" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </AdminSectionCard>

      {/* 5. Fulfillment & Logistics */}
      <AdminSectionCard
        title="Fulfillment & Logistics"
        description="Advance the order and attach the courier waybill."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="order-status">Order status</Label>
            <Select
              id="order-status"
              value={orderStatus}
              onValueChange={(v) => setOrderStatus(v as OrderStatus)}
            >
              {ORDER_STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="provider">Courier / provider</Label>
            <Input
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="JNE REG"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="resi">Resi / waybill number</Label>
            <Input
              id="resi"
              value={resi}
              onChange={(e) => setResi(e.target.value)}
              placeholder="e.g. JN88 9987 4410 067"
              className="font-mono"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" variant="outline" className="gap-1.5" onClick={() => {}}>
            <Printer className="h-4 w-4" />
            Print Resi
          </Button>
          <Button type="button" variant="outline" className="gap-1.5" onClick={() => {}}>
            <FileText className="h-4 w-4" />
            Print Invoice
          </Button>
        </div>
      </AdminSectionCard>

      {/* 6. Internal Notes */}
      <AdminSectionCard title="Internal Notes" description="Only visible to staff — never shown to the customer.">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add a note about this order…"
        />
      </AdminSectionCard>

      <AdminActionBar>
        <Button variant="outline" onClick={() => router.push("/demo/orders")}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving} className="gap-1.5">
          {saving ? (
            "Saving…"
          ) : (
            <>
              <Check className="h-4 w-4" />
              Save changes
            </>
          )}
        </Button>
      </AdminActionBar>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-admin-text-subdued">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-admin-text-subdued">{label}</p>
        <p className="text-sm text-admin-text">{value}</p>
      </div>
    </div>
  );
}

function TotalRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-admin-text-subdued">{label}</dt>
      <dd className={muted ? "text-admin-success-text" : "text-admin-text"}>{value}</dd>
    </div>
  );
}
