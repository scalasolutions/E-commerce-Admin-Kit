/**
 * Fake fulfillment / shipment data for the logistics demo.
 *
 * Models a typical Indonesian e-commerce fulfillment pipeline: an order moves
 * from "Pick & Pack" → "Ready to Ship" → "Shipped" → "Completed". A courier is
 * booked in the Pick & Pack stage, which assigns a tracking number (resi).
 *
 * Everything here is deterministic — no Math.random — so the demo renders the
 * same on the server and the client.
 */

import type { LucideIcon } from "lucide-react";
import { Boxes, PackageCheck, Truck, CheckCircle2 } from "lucide-react";

/* ------------------------------------------------------------------ *
 * Stages
 * ------------------------------------------------------------------ */

export type ShipmentStage = "processing" | "ready_to_ship" | "shipped" | "completed";

export interface StageDef {
  key: ShipmentStage;
  /** Tab label (the fulfillment verb, e.g. "Pick & Pack"). */
  label: string;
  icon: LucideIcon;
  /** The stage an order advances to when its primary action runs. */
  next: ShipmentStage | null;
  /** Per-row primary action button label. `null` = terminal stage. */
  actionLabel: string | null;
  /** Bulk-bar advance button label. `null` = no bulk advance. */
  bulkLabel: string | null;
}

export const STAGES: StageDef[] = [
  {
    key: "processing",
    label: "Pick & Pack",
    icon: Boxes,
    next: "ready_to_ship",
    actionLabel: "Book courier & print",
    bulkLabel: "Quick-book selected",
  },
  {
    key: "ready_to_ship",
    label: "Ready to Ship",
    icon: PackageCheck,
    next: "shipped",
    actionLabel: "Mark shipped",
    bulkLabel: "Mark shipped",
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: Truck,
    next: "completed",
    actionLabel: "Mark delivered",
    bulkLabel: "Mark delivered",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircle2,
    next: null,
    actionLabel: null,
    bulkLabel: null,
  },
];

export function stageDef(key: ShipmentStage): StageDef {
  return STAGES.find((s) => s.key === key) ?? STAGES[0];
}

/* ------------------------------------------------------------------ *
 * Couriers
 * ------------------------------------------------------------------ */

export type CourierKind = "standard" | "instant" | "pickup";

export interface CourierService {
  /** Service code shown to the operator, e.g. "REG", "YES". */
  name: string;
  /** Estimated time of delivery, e.g. "1-2 days". */
  etd: string;
  /** Price multiplier applied to the computed base rate. */
  mult: number;
}

export interface Courier {
  code: string;
  name: string;
  kind: CourierKind;
  /** 2–3 letter prefix used when minting a tracking number. */
  resiPrefix: string;
  services: CourierService[];
}

export const COURIERS: Courier[] = [
  {
    code: "jne",
    name: "JNE",
    kind: "standard",
    resiPrefix: "JP",
    services: [
      { name: "OKE", etd: "3-4 days", mult: 0.8 },
      { name: "REG", etd: "1-2 days", mult: 1.0 },
      { name: "YES", etd: "next day", mult: 1.7 },
    ],
  },
  {
    code: "jnt",
    name: "J&T",
    kind: "standard",
    resiPrefix: "JT",
    services: [
      { name: "Economy", etd: "3-5 days", mult: 0.75 },
      { name: "Regular", etd: "2-3 days", mult: 1.0 },
      { name: "Express", etd: "1-2 days", mult: 1.5 },
    ],
  },
  {
    code: "sicepat",
    name: "SiCepat",
    kind: "standard",
    resiPrefix: "SC",
    services: [
      { name: "Halu", etd: "2-3 days", mult: 0.85 },
      { name: "REG", etd: "1-2 days", mult: 1.05 },
      { name: "BEST", etd: "next day", mult: 1.8 },
    ],
  },
  {
    code: "tiki",
    name: "TIKI",
    kind: "standard",
    resiPrefix: "TK",
    services: [
      { name: "ECO", etd: "3-4 days", mult: 0.8 },
      { name: "REG", etd: "2-3 days", mult: 1.0 },
      { name: "ONS", etd: "next day", mult: 1.9 },
    ],
  },
  {
    code: "gojek",
    name: "Gojek",
    kind: "instant",
    resiPrefix: "GK",
    services: [
      { name: "GoSend Same Day", etd: "today", mult: 2.2 },
      { name: "GoSend Instant", etd: "1-3 hrs", mult: 3.4 },
    ],
  },
  {
    code: "grab",
    name: "Grab",
    kind: "instant",
    resiPrefix: "GB",
    services: [
      { name: "GrabExpress Same Day", etd: "today", mult: 2.3 },
      { name: "GrabExpress Instant", etd: "1-3 hrs", mult: 3.5 },
    ],
  },
  {
    code: "ninja",
    name: "Ninja",
    kind: "standard",
    resiPrefix: "NJ",
    services: [
      { name: "Standard", etd: "3-5 days", mult: 0.78 },
      { name: "Express", etd: "1-2 days", mult: 1.35 },
    ],
  },
  {
    code: "self",
    name: "Self pickup",
    kind: "pickup",
    resiPrefix: "SP",
    services: [{ name: "Pickup at store", etd: "ready today", mult: 0 }],
  },
];

export function findCourier(code: string): Courier | undefined {
  return COURIERS.find((c) => c.code === code);
}

/** "JNE · REG" for a booked shipment, or "—" when nothing is booked. */
export function courierLabel(courierCode: string | null, service: string | null): string {
  if (!courierCode) return "—";
  const c = findCourier(courierCode);
  const name = c?.name ?? courierCode;
  return service ? `${name} · ${service}` : name;
}

/* ------------------------------------------------------------------ *
 * Shipments
 * ------------------------------------------------------------------ */

export interface ShipmentItem {
  name: string;
  qty: number;
  /** Unit weight in grams (~500g per item). */
  weightG: number;
}

export interface Address {
  recipient: string;
  phone: string;
  line1: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface Shipment {
  id: string;
  /** Human order code, e.g. "FO-2041". */
  code: string;
  customer: string;
  address: Address;
  items: ShipmentItem[];
  stage: ShipmentStage;
  /** Booked courier code, or null before booking. */
  courierCode: string | null;
  /** Booked service name, or null before booking. */
  service: string | null;
  /** Tracking number, or null before booking. */
  resi: string | null;
  /** Goods subtotal (what the products cost). */
  subtotal: number;
  /** Shipping fee the customer paid at checkout. */
  shippingPaid: number;
  /** Grand total the customer paid (subtotal + shipping). */
  total: number;
  /** Whether the order has been paid (drives the label PAID / UNPAID stamp). */
  paid: boolean;
  createdAt: string; // ISO
}

export const demoShipments: Shipment[] = [
  // ---- Pick & Pack (processing) — not yet booked ----
  {
    id: "shp-001",
    code: "FO-2041",
    customer: "Siti Rahmawati",
    address: { recipient: "Siti Rahmawati", phone: "0812-3345-6621", line1: "Jl. Kemang Raya No. 12", city: "Jakarta Selatan", province: "DKI Jakarta", postalCode: "12730" },
    items: [
      { name: "Cold-Pressed Olive Oil 500ml", qty: 2, weightG: 550 },
      { name: "Raw Wildflower Honey 250g", qty: 1, weightG: 320 },
    ],
    stage: "processing",
    courierCode: null,
    service: null,
    resi: null,
    subtotal: 473000,
    shippingPaid: 18000,
    total: 491000,
    paid: true,
    createdAt: "2026-07-23T08:12:00Z",
  },
  {
    id: "shp-002",
    code: "FO-2042",
    customer: "Budi Santoso",
    address: { recipient: "Budi Santoso", phone: "0813-9087-1120", line1: "Jl. Diponegoro No. 45", city: "Bandung", province: "Jawa Barat", postalCode: "40115" },
    items: [
      { name: "Matcha Ceremonial Grade 30g", qty: 1, weightG: 180 },
      { name: "Dark Chocolate 85% Cacao", qty: 3, weightG: 120 },
    ],
    stage: "processing",
    courierCode: null,
    service: null,
    resi: null,
    subtotal: 413000,
    shippingPaid: 22000,
    total: 435000,
    paid: true,
    createdAt: "2026-07-23T07:40:00Z",
  },
  {
    id: "shp-003",
    code: "FO-2043",
    customer: "Dewi Lestari",
    address: { recipient: "Dewi Lestari", phone: "0811-2234-8890", line1: "Jl. Gajah Mada No. 8", city: "Surabaya", province: "Jawa Timur", postalCode: "60175" },
    items: [
      { name: "Extra Virgin Coconut Oil 1L", qty: 1, weightG: 980 },
      { name: "Chia Seeds 500g", qty: 2, weightG: 520 },
    ],
    stage: "processing",
    courierCode: null,
    service: null,
    resi: null,
    subtotal: 323000,
    shippingPaid: 15000,
    total: 338000,
    paid: false,
    createdAt: "2026-07-22T15:05:00Z",
  },
  {
    id: "shp-004",
    code: "FO-2044",
    customer: "Ahmad Fauzi",
    address: { recipient: "Ahmad Fauzi", phone: "0857-1145-3378", line1: "Jl. Malioboro No. 21", city: "Yogyakarta", province: "DIY", postalCode: "55213" },
    items: [{ name: "Grass-Fed Ghee 400g", qty: 4, weightG: 460 }],
    stage: "processing",
    courierCode: null,
    service: null,
    resi: null,
    subtotal: 592000,
    shippingPaid: 20000,
    total: 612000,
    paid: true,
    createdAt: "2026-07-22T11:22:00Z",
  },

  // ---- Ready to Ship (ready_to_ship) — booked, awaiting handover ----
  {
    id: "shp-005",
    code: "FO-2038",
    customer: "Rina Wijaya",
    address: { recipient: "Rina Wijaya", phone: "0821-6678-2201", line1: "Jl. Gatot Subroto No. 99", city: "Medan", province: "Sumatera Utara", postalCode: "20112" },
    items: [
      { name: "Almond Butter, Unsweetened", qty: 2, weightG: 400 },
      { name: "Organic Rolled Oats 1kg", qty: 1, weightG: 1020 },
    ],
    stage: "ready_to_ship",
    courierCode: "jne",
    service: "REG",
    resi: "JP7714203380",
    subtotal: 338000,
    shippingPaid: 32000,
    total: 370000,
    paid: true,
    createdAt: "2026-07-22T09:18:00Z",
  },
  {
    id: "shp-006",
    code: "FO-2039",
    customer: "Eko Prasetyo",
    address: { recipient: "Eko Prasetyo", phone: "0856-9923-1145", line1: "Jl. Pandanaran No. 33", city: "Semarang", province: "Jawa Tengah", postalCode: "50241" },
    items: [{ name: "Himalayan Pink Salt Grinder", qty: 3, weightG: 420 }],
    stage: "ready_to_ship",
    courierCode: "sicepat",
    service: "BEST",
    resi: "SC0056618842",
    subtotal: 204000,
    shippingPaid: 26000,
    total: 230000,
    paid: true,
    createdAt: "2026-07-22T08:47:00Z",
  },
  {
    id: "shp-007",
    code: "FO-2040",
    customer: "Maya Sari",
    address: { recipient: "Maya Sari", phone: "0812-7781-9903", line1: "Jl. Sudirman No. 7", city: "Denpasar", province: "Bali", postalCode: "80113" },
    items: [
      { name: "Kombucha Starter Kit", qty: 1, weightG: 1400 },
      { name: "Sun-Dried Tomatoes 200g", qty: 2, weightG: 220 },
    ],
    stage: "ready_to_ship",
    courierCode: "gojek",
    service: "GoSend Same Day",
    resi: "GK4820165530",
    subtotal: 334000,
    shippingPaid: 35000,
    total: 369000,
    paid: false,
    createdAt: "2026-07-21T16:30:00Z",
  },

  // ---- Shipped (shipped) — in transit ----
  {
    id: "shp-008",
    code: "FO-2032",
    customer: "Fajar Nugroho",
    address: { recipient: "Fajar Nugroho", phone: "0813-3390-7745", line1: "Jl. Ahmad Yani No. 56", city: "Makassar", province: "Sulawesi Selatan", postalCode: "90231" },
    items: [
      { name: "Coconut Aminos Sauce", qty: 2, weightG: 300 },
      { name: "Turmeric Powder, Single-Origin", qty: 1, weightG: 170 },
    ],
    stage: "shipped",
    courierCode: "jnt",
    service: "Express",
    resi: "JT6640028193",
    subtotal: 221000,
    shippingPaid: 38000,
    total: 259000,
    paid: true,
    createdAt: "2026-07-20T13:10:00Z",
  },
  {
    id: "shp-009",
    code: "FO-2033",
    customer: "Putri Handayani",
    address: { recipient: "Putri Handayani", phone: "0857-2218-6640", line1: "Jl. Merdeka No. 14", city: "Bogor", province: "Jawa Barat", postalCode: "16121" },
    items: [{ name: "Buckwheat Pancake Mix", qty: 3, weightG: 500 }],
    stage: "shipped",
    courierCode: "tiki",
    service: "REG",
    resi: "TK1180553027",
    subtotal: 213000,
    shippingPaid: 19000,
    total: 232000,
    paid: true,
    createdAt: "2026-07-20T10:55:00Z",
  },
  {
    id: "shp-010",
    code: "FO-2034",
    customer: "Rizky Ramadhan",
    address: { recipient: "Rizky Ramadhan", phone: "0811-5567-2290", line1: "Jl. Cihampelas No. 88", city: "Bandung", province: "Jawa Barat", postalCode: "40131" },
    items: [
      { name: "Cold-Pressed Olive Oil 500ml", qty: 1, weightG: 550 },
      { name: "Dark Chocolate 85% Cacao", qty: 4, weightG: 120 },
    ],
    stage: "shipped",
    courierCode: "ninja",
    service: "Express",
    resi: "NJ9903471186",
    subtotal: 413000,
    shippingPaid: 24000,
    total: 437000,
    paid: true,
    createdAt: "2026-07-19T14:20:00Z",
  },

  // ---- Completed (completed) — delivered ----
  {
    id: "shp-011",
    code: "FO-2026",
    customer: "Lina Kusuma",
    address: { recipient: "Lina Kusuma", phone: "0812-6674-1108", line1: "Jl. Pemuda No. 3", city: "Semarang", province: "Jawa Tengah", postalCode: "50132" },
    items: [{ name: "Raw Wildflower Honey 250g", qty: 2, weightG: 320 }],
    stage: "completed",
    courierCode: "jne",
    service: "YES",
    resi: "JP2245809971",
    subtotal: 190000,
    shippingPaid: 28000,
    total: 218000,
    paid: true,
    createdAt: "2026-07-17T09:05:00Z",
  },
  {
    id: "shp-012",
    code: "FO-2027",
    customer: "Andi Wibowo",
    address: { recipient: "Andi Wibowo", phone: "0856-3390-5527", line1: "Jl. Thamrin No. 25", city: "Jakarta Pusat", province: "DKI Jakarta", postalCode: "10350" },
    items: [
      { name: "Grass-Fed Ghee 400g", qty: 1, weightG: 460 },
      { name: "Chia Seeds 500g", qty: 1, weightG: 520 },
    ],
    stage: "completed",
    courierCode: "grab",
    service: "GrabExpress Same Day",
    resi: "GB5518830042",
    subtotal: 227000,
    shippingPaid: 30000,
    total: 257000,
    paid: true,
    createdAt: "2026-07-16T12:40:00Z",
  },
];

export function findShipment(id: string): Shipment | undefined {
  return demoShipments.find((s) => s.id === id);
}

/* ------------------------------------------------------------------ *
 * Weight helpers
 * ------------------------------------------------------------------ */

/** Raw parcel weight in kilograms. */
export function totalWeightKg(items: ShipmentItem[]): number {
  const grams = items.reduce((sum, it) => sum + it.qty * it.weightG, 0);
  return grams / 1000;
}

/** Billable weight — couriers round up to the next kg, min 1 kg. */
export function billableWeightKg(items: ShipmentItem[]): number {
  return Math.max(1, Math.ceil(totalWeightKg(items)));
}

export function totalUnits(items: ShipmentItem[]): number {
  return items.reduce((sum, it) => sum + it.qty, 0);
}

/* ------------------------------------------------------------------ *
 * Deterministic rate quoting + tracking numbers (no Math.random)
 * ------------------------------------------------------------------ */

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export interface Rate {
  id: string;
  courierCode: string;
  service: string;
  etd: string;
  price: number;
}

/**
 * Fake but deterministic shipping rates for a courier to a destination.
 * Price derives from a "distance factor" (hashed postal code) and the billable
 * weight, then each service scales it by its multiplier. Rounded to Rp 500.
 */
export function getRates(courierCode: string, destPostal: string, items: ShipmentItem[]): Rate[] {
  const courier = findCourier(courierCode);
  if (!courier) return [];
  const weight = billableWeightKg(items);
  const distance = (hashString(destPostal || "00000") % 42) + 6; // 6..47
  const base = distance * 550 + weight * 8000; // core parcel rate

  return courier.services.map((svc, i) => {
    const raw = base * svc.mult;
    const price = svc.mult === 0 ? 0 : Math.round(raw / 500) * 500;
    return {
      id: `${courierCode}-${i}`,
      courierCode,
      service: svc.name,
      etd: svc.etd,
      price,
    };
  });
}

/**
 * Mint a tracking number for a booking. Deterministic from the courier + order
 * id + service so re-booking the same order yields the same resi (no random).
 */
export function deriveResi(courierCode: string, orderId: string, service: string): string {
  const courier = findCourier(courierCode);
  const prefix = courier?.resiPrefix ?? "XX";
  const seed = hashString(`${courierCode}:${orderId}:${service}`);
  // 10 digits, zero-padded.
  const digits = String(seed % 10_000_000_000).padStart(10, "0");
  return `${prefix}${digits}`;
}

/** Sender / warehouse block printed on every waybill. */
export const WAREHOUSE = {
  name: "Francis Organic",
  line1: "Gudang Utama — Jl. Industri Raya No. 4",
  city: "Jakarta Barat",
  province: "DKI Jakarta",
  postalCode: "11510",
  phone: "021-555-0142",
};
