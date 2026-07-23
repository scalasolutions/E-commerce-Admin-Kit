"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Dices, Percent, Tag, Truck, Ticket, Store, Globe } from "lucide-react";
import AdminFormSection from "@/components/admin/admin-form-section";
import AdminActionBar from "@/components/admin/admin-action-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Segmented } from "@/components/ui/segmented";
import { MoneyInput } from "@/components/ui/money-input";
import { fireConfetti } from "@/components/ui/confetti";
import { cn, formatPrice } from "@/lib/utils";
import {
  BLANK_VOUCHER,
  findVoucher,
  REGIONS,
  regionLabel,
  suggestCode,
  type DiscountType,
  type VoucherStatus,
} from "../vouchers-data";

function daysBetween(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

function longDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

export default function VoucherEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const isNew = params.id === "new";
  const existing = isNew ? undefined : findVoucher(params.id);
  const base = existing ?? BLANK_VOUCHER;

  const [code, setCode] = React.useState(base.code);
  const [discountType, setDiscountType] = React.useState<DiscountType>(base.discountType);
  const [discountValue, setDiscountValue] = React.useState<number | null>(base.discountValue);
  const [minPurchase, setMinPurchase] = React.useState<number | null>(base.minPurchase);
  const [usageLimit, setUsageLimit] = React.useState<number | null>(base.usageLimit);
  const [startDate, setStartDate] = React.useState(base.startDate);
  const [expiryDate, setExpiryDate] = React.useState(base.expiryDate);
  const [status, setStatus] = React.useState<VoucherStatus>(base.status);
  const [region, setRegion] = React.useState(base.region);
  const [isFeatured, setIsFeatured] = React.useState(base.isFeatured);
  const [saving, setSaving] = React.useState(false);

  const isFreeShip = discountType === "free_shipping";
  const days = daysBetween(startDate, expiryDate);
  const dateInvalid = Boolean(startDate && expiryDate && new Date(expiryDate) < new Date(startDate));

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    fireConfetti();
  }

  return (
    <div className="space-y-6 pb-24">
      <button
        onClick={() => router.push("/demo/vouchers")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-admin-text-subdued transition-colors hover:text-admin-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to vouchers
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-admin-text">
          {isNew ? "Create voucher" : `Edit ${existing?.code}`}
        </h1>
        <p className="mt-1 text-sm text-admin-text-subdued">
          Set the discount, when it’s valid, and who can use it — the preview updates as you go.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ---------- Form (left, 2/3) ---------- */}
        <div className="space-y-6 lg:col-span-2">
          <AdminFormSection title="Basics" description="The code shoppers enter and whether it’s live.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="code">Voucher code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s/g, ""))}
                    placeholder="WELCOME10"
                    className="font-mono uppercase"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    onClick={() => setCode(suggestCode(code.length + startDate.length + 3))}
                  >
                    <Dices className="h-4 w-4" />
                    Generate
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select id="status" value={status} onValueChange={(v) => setStatus(v as VoucherStatus)}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                </Select>
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="Discount" description="What the shopper saves, and the minimum to qualify.">
            <div className="space-y-1.5">
              <Label>Discount type</Label>
              <Segmented<DiscountType>
                value={discountType}
                onChange={setDiscountType}
                fullWidth
                aria-label="Discount type"
                options={[
                  { value: "percentage", label: "Percentage", icon: <Percent className="h-4 w-4" /> },
                  { value: "fixed", label: "Fixed amount", icon: <Tag className="h-4 w-4" /> },
                  { value: "free_shipping", label: "Free shipping", icon: <Truck className="h-4 w-4" /> },
                ]}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {!isFreeShip && (
                <div className="space-y-1.5">
                  <Label htmlFor="value">{discountType === "percentage" ? "Percentage off" : "Amount off"}</Label>
                  {discountType === "percentage" ? (
                    <div className="relative">
                      <Input
                        id="value"
                        type="number"
                        min={0}
                        max={100}
                        value={discountValue ?? ""}
                        onChange={(e) => setDiscountValue(e.target.value === "" ? null : Number(e.target.value))}
                        className="pr-8"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-admin-text-subdued">
                        %
                      </span>
                    </div>
                  ) : (
                    <MoneyInput id="value" value={discountValue} onValueChange={setDiscountValue} allowEmpty />
                  )}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="min">{isFreeShip ? "Free-shipping threshold" : "Minimum purchase"}</Label>
                <MoneyInput id="min" value={minPurchase} onValueChange={setMinPurchase} allowEmpty placeholder="0" />
                <p className="text-xs text-admin-text-subdued">
                  {minPurchase ? `Applies on orders over ${formatPrice(minPurchase)}.` : "No minimum — applies to any order."}
                </p>
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="Validity" description="The window the code can be redeemed in.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="start">Starts</Label>
                <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expiry">Expires</Label>
                <Input
                  id="expiry"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className={cn(dateInvalid && "border-admin-critical-text")}
                />
              </div>
            </div>
            <p className={cn("text-xs", dateInvalid ? "font-semibold text-admin-critical-text" : "text-admin-text-subdued")}>
              {dateInvalid
                ? "Expiry is before the start date."
                : `Valid for ${days} day${days === 1 ? "" : "s"} — ${longDate(startDate)} to ${longDate(expiryDate)}.`}
            </p>
          </AdminFormSection>

          <AdminFormSection title="Usage & reach" description="How many times it can be used and where.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="limit">Usage limit</Label>
                <Input
                  id="limit"
                  type="number"
                  min={1}
                  value={usageLimit ?? ""}
                  onChange={(e) => setUsageLimit(e.target.value === "" ? null : Number(e.target.value))}
                />
                <p className="text-xs text-admin-text-subdued">
                  Total redemptions across all customers.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="region">Region</Label>
                <Select id="region" value={region} onValueChange={setRegion}>
                  {REGIONS.map((r) => (
                    <option key={r.key || "nationwide"} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-admin-border-subtle bg-admin-surface-subdued/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-admin-text">Feature on storefront</p>
                <p className="text-xs text-admin-text-subdued">Advertise this code publicly (e.g. a homepage banner).</p>
              </div>
              <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>
          </AdminFormSection>
        </div>

        {/* ---------- Live preview (right, sticky) ---------- */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-admin-text-disabled">Live preview</p>
            <CouponPreview
              code={code}
              discountType={discountType}
              discountValue={discountValue ?? 0}
              minPurchase={minPurchase ?? 0}
              region={region}
              expiryDate={expiryDate}
              status={status}
            />
            <div className="rounded-xl border border-admin-border bg-admin-surface p-4 text-xs shadow-admin">
              <dl className="space-y-2">
                <Glance label="Reach" value={region ? regionLabel(region) : "Nationwide"} icon={region ? <Store className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />} />
                <Glance label="Redemptions" value={`Up to ${usageLimit ?? 0}`} icon={<Ticket className="h-3.5 w-3.5" />} />
                <Glance label="Window" value={`${days} day${days === 1 ? "" : "s"}`} icon={<Check className="h-3.5 w-3.5" />} />
              </dl>
            </div>
          </div>
        </div>
      </div>

      <AdminActionBar>
        <Button variant="outline" onClick={() => router.push("/demo/vouchers")}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving || dateInvalid || !code} className="gap-1.5">
          {saving ? (
            "Saving…"
          ) : (
            <>
              <Check className="h-4 w-4" />
              {isNew ? "Create voucher" : "Save voucher"}
            </>
          )}
        </Button>
      </AdminActionBar>
    </div>
  );
}

function Glance({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="flex items-center gap-1.5 text-admin-text-subdued">
        {icon}
        {label}
      </dt>
      <dd className="font-semibold text-admin-text">{value}</dd>
    </div>
  );
}

/** A visual coupon card that mirrors what the shopper effectively gets. */
function CouponPreview({
  code,
  discountType,
  discountValue,
  minPurchase,
  region,
  expiryDate,
  status,
}: {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase: number;
  region: string;
  expiryDate: string;
  status: VoucherStatus;
}) {
  const headline =
    discountType === "free_shipping"
      ? "FREE SHIPPING"
      : discountType === "percentage"
      ? `${discountValue || 0}% OFF`
      : `${formatPrice(discountValue || 0)} OFF`;

  const dimmed = status !== "active";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-admin-accent text-white shadow-admin-lift transition-opacity",
        dimmed && "opacity-60"
      )}
    >
      {/* perforation notches */}
      <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-admin-surface-subdued" />
      <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-admin-surface-subdued" />

      <div className="flex items-center gap-2 px-5 pt-5">
        <Ticket className="h-4 w-4 opacity-80" />
        <span className="text-xs font-semibold uppercase tracking-widest opacity-80">Voucher</span>
        {status !== "active" && (
          <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
            {status}
          </span>
        )}
      </div>

      <div className="px-5 py-4">
        <p className="text-3xl font-extrabold leading-none tracking-tight">{headline}</p>
        <p className="mt-1 text-sm opacity-90">
          {minPurchase > 0 ? `on orders over ${formatPrice(minPurchase)}` : "on any order"}
        </p>
      </div>

      {/* dashed tear line + code */}
      <div className="border-t border-dashed border-white/40 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-widest opacity-70">Code</p>
            <p className="truncate font-mono text-lg font-bold">{code || "———"}</p>
          </div>
          <div className="text-right text-[11px] opacity-90">
            <p>{region ? regionLabel(region) : "Nationwide"}</p>
            <p>till {expiryDate ? new Date(expiryDate).toLocaleDateString("en-US", { day: "numeric", month: "short" }) : "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
