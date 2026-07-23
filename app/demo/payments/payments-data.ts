/** Fake payment data for the demo. Mirrors a Xendit-style gateway payment model. */

export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

/** Payment method families the gateway supports. */
export type MethodType = "qris" | "virtual_account" | "ewallet" | "pay_at_store";

export interface DemoPayment {
  id: string;
  orderCode: string;
  customer: string;
  methodType: MethodType;
  /** Rendered method label, e.g. "Virtual Account · Mandiri". */
  methodLabel: string;
  /** VA number or gateway reference, shown in a mono column. */
  reference: string;
  amount: number;
  status: PaymentStatus;
  /** ISO timestamp of the last status change. */
  updatedAt: string;
}

export const PAYMENT_STATUSES: { key: PaymentStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
  { key: "failed", label: "Failed" },
  { key: "expired", label: "Expired" },
];

export const demoPayments: DemoPayment[] = [
  { id: "pay-001", orderCode: "FO-24081", customer: "Ayu Pratiwi", methodType: "qris", methodLabel: "QRIS", reference: "qr_9f2a7c1e4b", amount: 128.5, status: "pending", updatedAt: "2026-07-23T09:12:00Z" },
  { id: "pay-002", orderCode: "FO-24080", customer: "Budi Santoso", methodType: "virtual_account", methodLabel: "Virtual Account · Mandiri", reference: "8808 1204 5567 3021", amount: 342.0, status: "paid", updatedAt: "2026-07-23T08:47:00Z" },
  { id: "pay-003", orderCode: "FO-24079", customer: "Citra Lestari", methodType: "ewallet", methodLabel: "E-Wallet · OVO", reference: "ewc_3b81de90af", amount: 64.9, status: "paid", updatedAt: "2026-07-23T08:20:00Z" },
  { id: "pay-004", orderCode: "FO-24078", customer: "Dewi Anggraini", methodType: "virtual_account", methodLabel: "Virtual Account · BNI", reference: "9881 5502 7743 1198", amount: 210.75, status: "pending", updatedAt: "2026-07-23T07:58:00Z" },
  { id: "pay-005", orderCode: "FO-24077", customer: "Eko Nugroho", methodType: "ewallet", methodLabel: "E-Wallet · DANA", reference: "ewc_7ca2f0b3d1", amount: 89.0, status: "failed", updatedAt: "2026-07-23T07:31:00Z" },
  { id: "pay-006", orderCode: "FO-24076", customer: "Fitri Handayani", methodType: "virtual_account", methodLabel: "Virtual Account · BRI", reference: "2620 8814 0067 5540", amount: 455.25, status: "paid", updatedAt: "2026-07-23T06:54:00Z" },
  { id: "pay-007", orderCode: "FO-24075", customer: "Gilang Ramadhan", methodType: "qris", methodLabel: "QRIS", reference: "qr_1d4e8a2f6c", amount: 37.5, status: "expired", updatedAt: "2026-07-22T22:10:00Z" },
  { id: "pay-008", orderCode: "FO-24074", customer: "Hana Wijaya", methodType: "ewallet", methodLabel: "E-Wallet · ShopeePay", reference: "ewc_5f90b1c8e2", amount: 152.4, status: "pending", updatedAt: "2026-07-22T20:45:00Z" },
  { id: "pay-009", orderCode: "FO-24073", customer: "Indra Kusuma", methodType: "virtual_account", methodLabel: "Virtual Account · Permata", reference: "8528 0091 4432 7760", amount: 278.0, status: "paid", updatedAt: "2026-07-22T19:33:00Z" },
  { id: "pay-010", orderCode: "FO-24072", customer: "Joko Susilo", methodType: "pay_at_store", methodLabel: "Pay at Store", reference: "POS-55210", amount: 96.8, status: "pending", updatedAt: "2026-07-22T18:02:00Z" },
  { id: "pay-011", orderCode: "FO-24071", customer: "Kartika Sari", methodType: "ewallet", methodLabel: "E-Wallet · LinkAja", reference: "ewc_2ae7d3f0b9", amount: 44.25, status: "failed", updatedAt: "2026-07-22T16:48:00Z" },
  { id: "pay-012", orderCode: "FO-24070", customer: "Lukman Hakim", methodType: "virtual_account", methodLabel: "Virtual Account · Mandiri", reference: "8808 3376 1209 8845", amount: 512.0, status: "expired", updatedAt: "2026-07-22T14:15:00Z" },
];

/** Count payments for one status — feeds the top stat cards. */
export function countByStatus(payments: DemoPayment[], status: PaymentStatus): number {
  return payments.filter((p) => p.status === status).length;
}

export interface WebhookEvent {
  id: string;
  type: string;
  /** Delivery status: success (green) or failed (red). */
  status: "success" | "failed";
  receivedAt: string;
}

export const demoWebhookEvents: WebhookEvent[] = [
  { id: "evt_9a17c4e2b8f03d61", type: "invoice.paid", status: "success", receivedAt: "2026-07-23T08:47:03Z" },
  { id: "evt_5c02f8d1a6e94b27", type: "invoice.paid", status: "success", receivedAt: "2026-07-23T08:20:11Z" },
  { id: "evt_3e8b1f60c9d27a54", type: "invoice.expired", status: "success", receivedAt: "2026-07-22T22:10:00Z" },
  { id: "evt_7d41a9e35b0c8f92", type: "invoice.payment_failed", status: "failed", receivedAt: "2026-07-23T07:31:44Z" },
  { id: "evt_b60f2c81de49730a", type: "invoice.paid", status: "success", receivedAt: "2026-07-22T19:33:29Z" },
  { id: "evt_1f7e05a2c8b46d3e", type: "invoice.expired", status: "success", receivedAt: "2026-07-22T14:15:00Z" },
];
