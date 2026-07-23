/** Fake voucher data for the demo. Mirrors a typical e-commerce voucher model. */

export type DiscountType = "percentage" | "fixed" | "free_shipping";
export type VoucherStatus = "active" | "inactive" | "expired";

export interface DemoVoucher {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase: number;
  usageLimit: number;
  used: number;
  startDate: string; // YYYY-MM-DD
  expiryDate: string; // YYYY-MM-DD
  status: VoucherStatus;
  /** Region key; "" = nationwide. */
  region: string;
  isFeatured: boolean;
}

export const REGIONS = [
  { key: "", label: "Nationwide" },
  { key: "jabodetabek", label: "Jabodetabek" },
  { key: "java", label: "Java" },
  { key: "sumatra", label: "Sumatra" },
];

export function regionLabel(key: string): string {
  return REGIONS.find((r) => r.key === key)?.label ?? "Nationwide";
}

export const demoVouchers: DemoVoucher[] = [
  { id: "v-001", code: "WELCOME10", discountType: "percentage", discountValue: 10, minPurchase: 100000, usageLimit: 500, used: 213, startDate: "2026-07-01", expiryDate: "2026-08-22", status: "active", region: "", isFeatured: true },
  { id: "v-002", code: "FREESHIP", discountType: "free_shipping", discountValue: 0, minPurchase: 150000, usageLimit: 1000, used: 640, startDate: "2026-07-10", expiryDate: "2026-07-31", status: "active", region: "jabodetabek", isFeatured: true },
  { id: "v-003", code: "RAYA25K", discountType: "fixed", discountValue: 25000, minPurchase: 200000, usageLimit: 300, used: 300, startDate: "2026-06-01", expiryDate: "2026-06-30", status: "expired", region: "", isFeatured: false },
  { id: "v-004", code: "NEWSTORE", discountType: "percentage", discountValue: 15, minPurchase: 0, usageLimit: 200, used: 12, startDate: "2026-07-20", expiryDate: "2026-09-20", status: "active", region: "java", isFeatured: false },
  { id: "v-005", code: "VIP50", discountType: "fixed", discountValue: 50000, minPurchase: 500000, usageLimit: 100, used: 0, startDate: "2026-08-01", expiryDate: "2026-12-31", status: "inactive", region: "", isFeatured: false },
];

export function findVoucher(id: string): DemoVoucher | undefined {
  return demoVouchers.find((v) => v.id === id);
}

export const BLANK_VOUCHER: Omit<DemoVoucher, "id"> = {
  code: "",
  discountType: "percentage",
  discountValue: 10,
  minPurchase: 0,
  usageLimit: 100,
  used: 0,
  startDate: "2026-07-23",
  expiryDate: "2026-08-23",
  status: "active",
  region: "",
  isFeatured: false,
};

/** "WELCOME" + 4 random-ish chars, deterministic from a seed so no Math.random in render. */
export function suggestCode(seed: number): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  let n = seed;
  for (let i = 0; i < 5; i++) {
    out += chars[n % chars.length];
    n = Math.floor(n / chars.length) + 7;
  }
  return `PROMO${out}`;
}
