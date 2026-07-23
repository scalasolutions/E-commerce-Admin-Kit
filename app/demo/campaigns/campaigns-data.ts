/** Fake campaign data for the demo. A campaign is a TRACKED marketing link + QR
 *  (UTM analytics) that can optionally attach one voucher code — it carries no
 *  discount value/validity/limits of its own. */

export type CampaignStatus = "active" | "archived";

export interface DemoCampaign {
  id: string;
  name: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  /** Where the tracked link points. Empty falls back to the store default. */
  destinationUrl: string;
  /** Attached voucher code; "" = none. */
  voucherCode: string;
  scans: number;
  redeemed: number;
  status: CampaignStatus;
}

export const DEFAULT_DESTINATION = "https://example-store.com";

/** Codes an admin can attach to a campaign (fake). */
export const VOUCHER_CODES = ["WELCOME10", "FREESHIP", "RAYA25K", "VIP50"];

export function conversionPct(c: Pick<DemoCampaign, "scans" | "redeemed">): number {
  if (!c.scans) return 0;
  return Math.round((c.redeemed / c.scans) * 100);
}

/** Build the tracked link the QR encodes. Only non-empty UTM params are added. */
export function buildTrackedLink(input: {
  destinationUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}): string {
  const base = input.destinationUrl.trim() || DEFAULT_DESTINATION;
  const params = new URLSearchParams();
  if (input.utmSource.trim()) params.set("utm_source", input.utmSource.trim());
  if (input.utmMedium.trim()) params.set("utm_medium", input.utmMedium.trim());
  if (input.utmCampaign.trim()) params.set("utm_campaign", input.utmCampaign.trim());
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** The mono subtitle shown under a campaign name in the list. */
export function utmSubtitle(c: Pick<DemoCampaign, "utmSource" | "utmMedium">): string {
  const src = c.utmSource ? `?utm_source=${c.utmSource}` : "?utm_source=—";
  return c.utmMedium ? `${src} · ${c.utmMedium}` : src;
}

export const demoCampaigns: DemoCampaign[] = [
  { id: "c-001", name: "Instagram Launch",      utmSource: "instagram", utmMedium: "social",   utmCampaign: "spring_launch", destinationUrl: "https://example-store.com/new", voucherCode: "WELCOME10", scans: 4120, redeemed: 512, status: "active" },
  { id: "c-002", name: "Newsletter — July",     utmSource: "newsletter", utmMedium: "email",   utmCampaign: "july_digest",  destinationUrl: "https://example-store.com", voucherCode: "FREESHIP", scans: 2380, redeemed: 401, status: "active" },
  { id: "c-003", name: "TikTok Creator Drop",   utmSource: "tiktok",    utmMedium: "influencer", utmCampaign: "creator_drop", destinationUrl: "https://example-store.com/shop", voucherCode: "", scans: 8760, redeemed: 623, status: "active" },
  { id: "c-004", name: "Google Search — Brand", utmSource: "google",    utmMedium: "cpc",      utmCampaign: "brand_terms",  destinationUrl: "https://example-store.com", voucherCode: "", scans: 15230, redeemed: 1890, status: "active" },
  { id: "c-005", name: "Ramadan Print Flyer",   utmSource: "flyer",     utmMedium: "print",    utmCampaign: "ramadan_2026", destinationUrl: "https://example-store.com/voucher/RAYA25K", voucherCode: "RAYA25K", scans: 940, redeemed: 88, status: "archived" },
  { id: "c-006", name: "Affiliate — TechBlog",  utmSource: "techblog",  utmMedium: "affiliate", utmCampaign: "review_post", destinationUrl: "https://example-store.com/shop", voucherCode: "WELCOME10", scans: 1640, redeemed: 205, status: "active" },
  { id: "c-007", name: "VIP Loyalty Push",      utmSource: "loyalty",   utmMedium: "email",    utmCampaign: "vip_reactivate", destinationUrl: "https://example-store.com/voucher/VIP50", voucherCode: "VIP50", scans: 620, redeemed: 143, status: "active" },
  { id: "c-008", name: "Winter Sale Retarget",  utmSource: "meta",      utmMedium: "retargeting", utmCampaign: "winter_sale", destinationUrl: "https://example-store.com/sale", voucherCode: "", scans: 5410, redeemed: 197, status: "archived" },
];

export function findCampaign(id: string): DemoCampaign | undefined {
  return demoCampaigns.find((c) => c.id === id);
}

export const BLANK_CAMPAIGN: Omit<DemoCampaign, "id"> = {
  name: "",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  destinationUrl: DEFAULT_DESTINATION,
  voucherCode: "",
  scans: 0,
  redeemed: 0,
  status: "active",
};
