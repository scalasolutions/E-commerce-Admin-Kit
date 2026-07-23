"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Copy, ExternalLink, Link2, Megaphone, QrCode, Ticket } from "lucide-react";
import AdminFormSection from "@/components/admin/admin-form-section";
import AdminActionBar from "@/components/admin/admin-action-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { fireConfetti } from "@/components/ui/confetti";
import { cn } from "@/lib/utils";
import {
  BLANK_CAMPAIGN,
  DEFAULT_DESTINATION,
  VOUCHER_CODES,
  buildTrackedLink,
  findCampaign,
  type CampaignStatus,
} from "../campaigns-data";

export default function CampaignEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const isNew = params.id === "new";
  const existing = isNew ? undefined : findCampaign(params.id);
  const base = existing ?? BLANK_CAMPAIGN;

  const [name, setName] = React.useState(base.name);
  const [status, setStatus] = React.useState<CampaignStatus>(base.status);
  const [utmSource, setUtmSource] = React.useState(base.utmSource);
  const [utmMedium, setUtmMedium] = React.useState(base.utmMedium);
  const [utmCampaign, setUtmCampaign] = React.useState(base.utmCampaign);
  const [destination, setDestination] = React.useState(base.destinationUrl);
  // Existing rows show their stored URL as-is; new rows let the voucher auto-point.
  const [destinationTouched, setDestinationTouched] = React.useState(!isNew);
  const [voucherCode, setVoucherCode] = React.useState(base.voucherCode);
  const [saving, setSaving] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // When a voucher is attached and the admin hasn't typed a custom URL,
  // auto-point the destination at the voucher landing page.
  const autoPointed = Boolean(voucherCode) && !destinationTouched;
  const effectiveDestination = autoPointed
    ? `${DEFAULT_DESTINATION}/voucher/${voucherCode}`
    : destination;

  const trackedLink = buildTrackedLink({
    destinationUrl: effectiveDestination,
    utmSource,
    utmMedium,
    utmCampaign,
  });

  async function handleCopy() {
    try {
      await navigator.clipboard?.writeText(trackedLink);
    } catch {
      /* clipboard may be unavailable in the demo sandbox — ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    setSaving(false);
    fireConfetti();
  }

  return (
    <div className="space-y-6 pb-24">
      <button
        onClick={() => router.push("/demo/campaigns")}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-admin-text-subdued transition-colors hover:text-admin-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to campaigns
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-admin-text">
          {isNew ? "Create campaign" : `Edit ${existing?.name}`}
        </h1>
        <p className="mt-1 text-sm text-admin-text-subdued">
          Build a tracked link and QR — the preview updates as you go.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ---------- Form (left, 2/3) ---------- */}
        <div className="space-y-6 lg:col-span-2">
          <AdminFormSection title="Basics" description="What this campaign is and whether it’s live.">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Campaign name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Instagram Launch"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <Select id="status" value={status} onValueChange={(v) => setStatus(v as CampaignStatus)}>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="Tracking" description="UTM parameters appended to the link for analytics.">
            <div className="space-y-1.5">
              <Label htmlFor="utm-source">UTM source</Label>
              <Input
                id="utm-source"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                placeholder="instagram"
                className="font-mono"
              />
              <p className="text-xs text-admin-text-subdued">Where the traffic comes from — required.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="utm-medium">UTM medium</Label>
                <Input
                  id="utm-medium"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                  placeholder="social"
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="utm-campaign">UTM campaign</Label>
                <Input
                  id="utm-campaign"
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value.toLowerCase().replace(/\s+/g, "_"))}
                  placeholder="spring_launch"
                  className="font-mono"
                />
              </div>
            </div>
          </AdminFormSection>

          <AdminFormSection title="Destination" description="Where the link lands and an optional voucher to attach.">
            <div className="space-y-1.5">
              <Label htmlFor="destination">Destination URL</Label>
              <Input
                id="destination"
                value={effectiveDestination}
                onChange={(e) => {
                  setDestinationTouched(true);
                  setDestination(e.target.value);
                }}
                placeholder={DEFAULT_DESTINATION}
                className="font-mono"
              />
              {autoPointed ? (
                <p className="text-xs text-admin-info-text">
                  Auto-pointed at the voucher page. Edit to set a custom URL.
                </p>
              ) : (
                <p className="text-xs text-admin-text-subdued">The page shoppers land on after scanning.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="voucher">Attached voucher</Label>
              <Select id="voucher" value={voucherCode} onValueChange={setVoucherCode}>
                <option value="">No voucher</option>
                {VOUCHER_CODES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-admin-text-subdued">
                Optional — a campaign tracks the link; the voucher supplies the discount.
              </p>
            </div>
          </AdminFormSection>
        </div>

        {/* ---------- Live preview (right, sticky) ---------- */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4 space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-admin-text-disabled">Live preview</p>

            <div className="rounded-2xl border border-admin-border bg-admin-surface p-5 shadow-admin-lift space-y-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-admin-accent-subdued text-admin-accent">
                  <Megaphone className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-admin-text">{name || "Untitled campaign"}</p>
                  <p className="text-xs text-admin-text-subdued">Tracked link + QR</p>
                </div>
              </div>

              <div className="flex justify-center">
                <FauxQr value={trackedLink} />
              </div>

              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-admin-text-subdued">
                  <Link2 className="h-3 w-3" />
                  Tracked link
                </p>
                <p className="break-all rounded-lg border border-admin-border-subtle bg-admin-surface-subdued/60 px-3 py-2 font-mono text-xs leading-relaxed text-admin-text">
                  {trackedLink}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-admin-border-subtle pt-3">
                <span className="flex items-center gap-1.5 text-xs text-admin-text-subdued">
                  <Ticket className="h-3.5 w-3.5" />
                  Voucher
                </span>
                {voucherCode ? (
                  <Badge variant="outline" className="font-mono">
                    {voucherCode}
                  </Badge>
                ) : (
                  <span className="text-xs text-admin-text-disabled">None attached</span>
                )}
              </div>

              <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy link
                  </>
                )}
              </Button>
            </div>

            <a
              href={trackedLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-text-subdued transition-colors hover:text-admin-text"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open link in new tab
            </a>
          </div>
        </div>
      </div>

      <AdminActionBar>
        <Button variant="outline" onClick={() => router.push("/demo/campaigns")}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={saving || !name || !utmSource}
          className="gap-1.5"
        >
          {saving ? (
            "Saving…"
          ) : (
            <>
              <Check className="h-4 w-4" />
              {isNew ? "Create campaign" : "Save campaign"}
            </>
          )}
        </Button>
      </AdminActionBar>
    </div>
  );
}

/** A deterministic faux QR: a grid of on/off cells derived from the link string.
 *  Purely decorative — it does not encode anything scannable, but it shifts as
 *  the link changes so the preview feels alive. No Math.random (SSR-safe). */
function FauxQr({ value }: { value: string }) {
  const SIZE = 21;
  const cells = React.useMemo(() => {
    // Seed a simple LCG from a rolling hash of the string.
    let h = 2166136261;
    for (let i = 0; i < value.length; i++) {
      h ^= value.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    let state = (h >>> 0) || 1;
    const next = () => {
      state = (Math.imul(state, 1103515245) + 12345) >>> 0;
      return state / 0xffffffff;
    };
    const grid: boolean[] = [];
    for (let i = 0; i < SIZE * SIZE; i++) grid.push(next() > 0.5);
    return grid;
  }, [value]);

  // The three finder squares of a real QR, stamped into the corners.
  const isFinder = (r: number, c: number) => {
    const inBox = (r0: number, c0: number) => {
      const dr = r - r0;
      const dc = c - c0;
      if (dr < 0 || dr > 6 || dc < 0 || dc > 6) return null;
      const edge = dr === 0 || dr === 6 || dc === 0 || dc === 6;
      const core = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
      return edge || core;
    };
    return inBox(0, 0) ?? inBox(0, SIZE - 7) ?? inBox(SIZE - 7, 0);
  };

  return (
    <div
      className="rounded-xl border border-admin-border bg-white p-3 shadow-admin"
      aria-label="QR code preview"
      role="img"
    >
      <div
        className="grid gap-0"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)`, width: 168, height: 168 }}
      >
        {cells.map((on, i) => {
          const r = Math.floor(i / SIZE);
          const c = i % SIZE;
          const finder = isFinder(r, c);
          const filled = finder === null ? on : finder;
          return (
            <span
              key={i}
              className={cn("aspect-square", filled ? "bg-admin-text" : "bg-transparent")}
            />
          );
        })}
      </div>
    </div>
  );
}
