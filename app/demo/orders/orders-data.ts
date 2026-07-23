/** Fake order data for the demo. Mirrors a typical e-commerce order model. */

export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "ready_to_ship"
  | "shipped"
  | "completed"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

export type PaymentMethod = "qris" | "virtual_account" | "e_wallet" | "pay_at_store";

export interface OrderItem {
  name: string;
  qty: number;
  /** Unit price. */
  price: number;
}

export interface OrderTransaction {
  reference: string;
  /** Human-readable method + rail, e.g. "Mandiri VA · 8810 0142 5567". */
  method: string;
  amount: number;
  status: PaymentStatus;
}

export interface DemoOrder {
  id: string;
  code: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  voucherCode: string; // "" when none applied
  voucherDiscount: number;
  shippingProvider: string;
  shippingCost: number;
  total: number;
  paymentMethod: PaymentMethod;
  /** Bank/wallet behind the method, e.g. "Mandiri", "OVO". "" when N/A. */
  paymentProvider: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  /** Courier waybill number; "" until a label is printed. */
  resi: string;
  createdAt: string; // ISO
  transactions: OrderTransaction[];
  notes: string;
}

/* ------------------------------------------------------------------ *
 * Status option lists — shared by the list filters and the detail selects.
 * Values line up with the kit's shared status vocabulary so the badge
 * tints/labels resolve automatically (processing → "Pick & Pack", etc.).
 * ------------------------------------------------------------------ */

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending_payment", label: "Pending Payment" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Pick & Pack" },
  { value: "ready_to_ship", label: "Ready to Ship" },
  { value: "shipped", label: "Shipped" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "expired", label: "Expired" },
];

/** Short label for a payment method + provider (e.g. "Mandiri VA", "OVO", "QRIS"). */
export function paymentMethodLabel(method: PaymentMethod, provider = ""): string {
  switch (method) {
    case "qris":
      return "QRIS";
    case "virtual_account":
      return provider ? `${provider} VA` : "Virtual Account";
    case "e_wallet":
      return provider || "E-Wallet";
    case "pay_at_store":
      return "Pay at Store";
    default:
      return "—";
  }
}

export const demoOrders: DemoOrder[] = [
  {
    id: "o-1042",
    code: "ORD-2607-1042",
    customer: {
      name: "Andini Pratama",
      phone: "+62 812-3345-8890",
      email: "andini.pratama@gmail.com",
      address: "Jl. Kemang Raya No. 21, Kel. Bangka, Mampang Prapatan, Jakarta Selatan, DKI Jakarta 12730",
    },
    items: [
      { name: "Cold-Pressed Olive Oil 500ml", qty: 2, price: 189000 },
      { name: "Raw Wildflower Honey 250g", qty: 1, price: 95000 },
    ],
    subtotal: 473000,
    discount: 0,
    voucherCode: "WELCOME10",
    voucherDiscount: 47300,
    shippingProvider: "JNE REG",
    shippingCost: 22000,
    total: 447700,
    paymentMethod: "virtual_account",
    paymentProvider: "Mandiri",
    paymentStatus: "paid",
    orderStatus: "processing",
    resi: "",
    createdAt: "2026-07-23T09:14:00+07:00",
    transactions: [
      { reference: "TXN-8810014255", method: "Mandiri VA · 8810 0142 5567", amount: 447700, status: "paid" },
    ],
    notes: "Customer requested extra bubble wrap for the olive oil bottles.",
  },
  {
    id: "o-1041",
    code: "ORD-2607-1041",
    customer: {
      name: "Bagus Setiawan",
      phone: "+62 813-8871-2204",
      email: "bagus.setiawan@yahoo.com",
      address: "Perumahan Graha Indah Blok C2 No. 8, Cibinong, Kabupaten Bogor, Jawa Barat 16913",
    },
    items: [
      { name: "Matcha Ceremonial Grade 30g", qty: 1, price: 245000 },
      { name: "Almond Butter, Unsweetened", qty: 2, price: 132000 },
    ],
    subtotal: 509000,
    discount: 0,
    voucherCode: "",
    voucherDiscount: 0,
    shippingProvider: "SiCepat BEST",
    shippingCost: 28000,
    total: 537000,
    paymentMethod: "e_wallet",
    paymentProvider: "OVO",
    paymentStatus: "paid",
    orderStatus: "shipped",
    resi: "SC00 7712 4490 IDN",
    createdAt: "2026-07-22T15:41:00+07:00",
    transactions: [
      { reference: "TXN-7712449018", method: "OVO · 0813****2204", amount: 537000, status: "paid" },
    ],
    notes: "",
  },
  {
    id: "o-1040",
    code: "ORD-2607-1040",
    customer: {
      name: "Citra Larasati",
      phone: "+62 811-2290-5567",
      email: "citra.larasati@gmail.com",
      address: "Jl. Diponegoro No. 114, Kel. Citarum, Bandung Wetan, Kota Bandung, Jawa Barat 40115",
    },
    items: [{ name: "Kombucha Starter Kit", qty: 1, price: 210000 }],
    subtotal: 210000,
    discount: 0,
    voucherCode: "FREESHIP",
    voucherDiscount: 0,
    shippingProvider: "AnterAja Reg",
    shippingCost: 18000,
    total: 210000,
    paymentMethod: "qris",
    paymentProvider: "",
    paymentStatus: "paid",
    orderStatus: "ready_to_ship",
    resi: "",
    createdAt: "2026-07-22T11:05:00+07:00",
    transactions: [
      { reference: "TXN-5590231144", method: "QRIS · GoPay wallet", amount: 210000, status: "paid" },
    ],
    notes: "FREESHIP voucher waived the AnterAja fee.",
  },
  {
    id: "o-1039",
    code: "ORD-2607-1039",
    customer: {
      name: "Dimas Nugroho",
      phone: "+62 856-4471-9982",
      email: "dimas.nugroho@outlook.com",
      address: "Jl. Gejayan No. 45, Kel. Condongcatur, Depok, Kabupaten Sleman, DI Yogyakarta 55281",
    },
    items: [
      { name: "Organic Rolled Oats 1kg", qty: 3, price: 74000 },
      { name: "Chia Seeds 500g", qty: 2, price: 79000 },
      { name: "Dark Chocolate 85% Cacao", qty: 4, price: 56000 },
    ],
    subtotal: 604000,
    discount: 25000,
    voucherCode: "",
    voucherDiscount: 0,
    shippingProvider: "J&T Express",
    shippingCost: 32000,
    total: 611000,
    paymentMethod: "virtual_account",
    paymentProvider: "BCA",
    paymentStatus: "paid",
    orderStatus: "completed",
    resi: "JT99 4471 0032 199",
    createdAt: "2026-07-20T08:52:00+07:00",
    transactions: [
      { reference: "TXN-4471003219", method: "BCA VA · 7011 3390 4471", amount: 611000, status: "paid" },
    ],
    notes: "Repeat customer — applied Rp25.000 loyalty discount manually.",
  },
  {
    id: "o-1038",
    code: "ORD-2607-1038",
    customer: {
      name: "Eka Wulandari",
      phone: "+62 821-1145-3320",
      email: "eka.wulandari@gmail.com",
      address: "Jl. Ahmad Yani No. 202, Kel. Purwodadi, Blimbing, Kota Malang, Jawa Timur 65126",
    },
    items: [
      { name: "Extra Virgin Coconut Oil 1L", qty: 1, price: 165000 },
      { name: "Turmeric Powder, Single-Origin", qty: 2, price: 45000 },
      { name: "Himalayan Pink Salt Grinder", qty: 1, price: 68000 },
    ],
    subtotal: 323000,
    discount: 0,
    voucherCode: "",
    voucherDiscount: 0,
    shippingProvider: "JNE YES",
    shippingCost: 26000,
    total: 349000,
    paymentMethod: "virtual_account",
    paymentProvider: "BNI",
    paymentStatus: "pending",
    orderStatus: "pending_payment",
    resi: "",
    createdAt: "2026-07-23T07:38:00+07:00",
    transactions: [
      { reference: "TXN-1145332099", method: "BNI VA · 8880 1145 3320", amount: 349000, status: "pending" },
    ],
    notes: "",
  },
  {
    id: "o-1037",
    code: "ORD-2607-1037",
    customer: {
      name: "Fajar Ramadhan",
      phone: "+62 878-6690-1123",
      email: "fajar.ramadhan@gmail.com",
      address: "Cluster Alamanda Blok D5 No. 12, Serpong, Kota Tangerang Selatan, Banten 15310",
    },
    items: [
      { name: "Grass-Fed Ghee 400g", qty: 2, price: 148000 },
      { name: "Buckwheat Pancake Mix", qty: 1, price: 71000 },
    ],
    subtotal: 367000,
    discount: 0,
    voucherCode: "",
    voucherDiscount: 0,
    shippingProvider: "SiCepat REG",
    shippingCost: 20000,
    total: 387000,
    paymentMethod: "e_wallet",
    paymentProvider: "ShopeePay",
    paymentStatus: "failed",
    orderStatus: "pending_payment",
    resi: "",
    createdAt: "2026-07-22T19:22:00+07:00",
    transactions: [
      { reference: "TXN-6690112301", method: "ShopeePay · 0878****1123", amount: 387000, status: "failed" },
      { reference: "TXN-6690112288", method: "ShopeePay · 0878****1123", amount: 387000, status: "expired" },
    ],
    notes: "Two failed wallet attempts — reached out via WhatsApp to retry.",
  },
  {
    id: "o-1036",
    code: "ORD-2607-1036",
    customer: {
      name: "Gita Permatasari",
      phone: "+62 812-9987-4410",
      email: "gita.permata@gmail.com",
      address: "Jl. Sudirman No. 78, Kel. Sungai Baru, Banjarmasin Tengah, Kota Banjarmasin, Kalimantan Selatan 70111",
    },
    items: [
      { name: "Sun-Dried Tomatoes 200g", qty: 3, price: 62000 },
      { name: "Coconut Aminos Sauce", qty: 2, price: 88000 },
    ],
    subtotal: 362000,
    discount: 0,
    voucherCode: "RAYA25K",
    voucherDiscount: 25000,
    shippingProvider: "JNE REG",
    shippingCost: 45000,
    total: 382000,
    paymentMethod: "virtual_account",
    paymentProvider: "BRI",
    paymentStatus: "paid",
    orderStatus: "shipped",
    resi: "JN88 9987 4410 067",
    createdAt: "2026-07-21T13:10:00+07:00",
    transactions: [
      { reference: "TXN-9987441067", method: "BRI VA · 8020 9987 4410", amount: 382000, status: "paid" },
    ],
    notes: "Outer-island delivery — higher courier rate.",
  },
  {
    id: "o-1035",
    code: "ORD-2607-1035",
    customer: {
      name: "Hendra Wijaya",
      phone: "+62 813-4402-7781",
      email: "hendra.wijaya@company.co.id",
      address: "Ruko Puri Niaga Blok A No. 3, Kembangan, Jakarta Barat, DKI Jakarta 11610",
    },
    items: [
      { name: "Cold-Pressed Olive Oil 500ml", qty: 6, price: 189000 },
      { name: "Grass-Fed Ghee 400g", qty: 4, price: 148000 },
    ],
    subtotal: 1726000,
    discount: 100000,
    voucherCode: "VIP50",
    voucherDiscount: 50000,
    shippingProvider: "J&T Express",
    shippingCost: 0,
    total: 1576000,
    paymentMethod: "pay_at_store",
    paymentProvider: "",
    paymentStatus: "paid",
    orderStatus: "completed",
    resi: "",
    createdAt: "2026-07-19T16:47:00+07:00",
    transactions: [
      { reference: "TXN-4402778100", method: "Cash · Kemang store counter", amount: 1576000, status: "paid" },
    ],
    notes: "Wholesale pickup at store. Free shipping, bulk discount + VIP voucher applied.",
  },
  {
    id: "o-1034",
    code: "ORD-2607-1034",
    customer: {
      name: "Indah Kusuma",
      phone: "+62 857-7712-3390",
      email: "indah.kusuma@gmail.com",
      address: "Jl. Teuku Umar No. 56, Kel. Dauh Puri, Denpasar Barat, Kota Denpasar, Bali 80114",
    },
    items: [{ name: "Almond Butter, Unsweetened", qty: 1, price: 132000 }],
    subtotal: 132000,
    discount: 0,
    voucherCode: "",
    voucherDiscount: 0,
    shippingProvider: "AnterAja Reg",
    shippingCost: 35000,
    total: 167000,
    paymentMethod: "qris",
    paymentProvider: "",
    paymentStatus: "expired",
    orderStatus: "cancelled",
    resi: "",
    createdAt: "2026-07-21T21:55:00+07:00",
    transactions: [
      { reference: "TXN-7712339011", method: "QRIS · DANA wallet", amount: 167000, status: "expired" },
    ],
    notes: "QRIS window lapsed before payment; auto-cancelled after 24h.",
  },
  {
    id: "o-1033",
    code: "ORD-2607-1033",
    customer: {
      name: "Joko Susilo",
      phone: "+62 811-3345-9902",
      email: "joko.susilo@gmail.com",
      address: "Jl. Pemuda No. 133, Kel. Karangkidul, Semarang Tengah, Kota Semarang, Jawa Tengah 50132",
    },
    items: [
      { name: "Chia Seeds 500g", qty: 2, price: 79000 },
      { name: "Dark Chocolate 85% Cacao", qty: 2, price: 56000 },
      { name: "Raw Wildflower Honey 250g", qty: 1, price: 95000 },
    ],
    subtotal: 365000,
    discount: 0,
    voucherCode: "",
    voucherDiscount: 0,
    shippingProvider: "JNE REG",
    shippingCost: 24000,
    total: 389000,
    paymentMethod: "e_wallet",
    paymentProvider: "DANA",
    paymentStatus: "paid",
    orderStatus: "paid",
    resi: "",
    createdAt: "2026-07-23T06:12:00+07:00",
    transactions: [
      { reference: "TXN-3345990244", method: "DANA · 0811****9902", amount: 389000, status: "paid" },
    ],
    notes: "",
  },
];

export function findOrder(id: string): DemoOrder | undefined {
  return demoOrders.find((o) => o.id === id);
}
