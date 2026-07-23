import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  ShoppingCart,
  ClipboardList,
  CreditCard,
  Truck,
  Megaphone,
  Ticket,
  QrCode,
  Users,
  SlidersHorizontal,
  Settings,
} from "lucide-react";
import type { AdminBrand, NavEntry, AdminProfile } from "@/components/admin/admin-context";

/* ------------------------------------------------------------------ *
 * Per-client config, exactly as a real consumer would supply it.
 * ------------------------------------------------------------------ */

export const brand: AdminBrand = {
  name: "Admin Kit",
  subtitle: "Demo store",
  initials: "AK",
};

export const nav: NavEntry[] = [
  { title: "Dashboard", href: "/demo/dashboard", icon: LayoutDashboard },
  {
    title: "Catalog",
    icon: Package,
    children: [
      { title: "Products", href: "/demo/products", icon: ShoppingBag },
      { title: "Categories", href: "/demo/categories", icon: Layers },
    ],
  },
  {
    title: "Sales",
    icon: ShoppingCart,
    children: [
      { title: "Orders", href: "/demo/orders", icon: ClipboardList },
      { title: "Payments", href: "/demo/payments", icon: CreditCard },
      { title: "Logistics", href: "/demo/logistics", icon: Truck },
    ],
  },
  {
    title: "Marketing",
    icon: Megaphone,
    children: [
      { title: "Vouchers", href: "/demo/vouchers", icon: Ticket },
      { title: "Campaigns", href: "/demo/campaigns", icon: QrCode },
    ],
  },
  { title: "Customers", href: "/demo/customers", icon: Users },
  {
    title: "System",
    icon: SlidersHorizontal,
    children: [{ title: "Settings", href: "/demo/settings", icon: Settings }],
  },
];

/** Everything is open in the demo; wire a real RBAC map per client. */
export function canAccess(_role: string, _href: string): boolean {
  return true;
}

export const demoProfile: AdminProfile = {
  id: "demo-user",
  name: "Alex Morgan",
  email: "alex@example.com",
  role: "owner",
  roleLabel: "Owner",
};

/* ------------------------------------------------------------------ *
 * Fake catalog data — stands in for the backend the kit doesn't ship.
 * ------------------------------------------------------------------ */

export interface DemoProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "inactive";
  image: string;
}

export const demoProducts: DemoProduct[] = [
  { id: "p-001", name: "Cold-Pressed Olive Oil 500ml", sku: "OO-500", category: "Pantry", price: 189000, stock: 42, status: "active", image: "" },
  { id: "p-002", name: "Raw Wildflower Honey 250g", sku: "HN-250", category: "Pantry", price: 95000, stock: 0, status: "active", image: "" },
  { id: "p-003", name: "Himalayan Pink Salt Grinder", sku: "SL-GRD", category: "Spices", price: 68000, stock: 118, status: "active", image: "" },
  { id: "p-004", name: "Organic Rolled Oats 1kg", sku: "OT-1K", category: "Breakfast", price: 74000, stock: 7, status: "draft", image: "" },
  { id: "p-005", name: "Almond Butter, Unsweetened", sku: "AB-350", category: "Spreads", price: 132000, stock: 23, status: "active", image: "" },
  { id: "p-006", name: "Matcha Ceremonial Grade 30g", sku: "MT-30", category: "Beverages", price: 245000, stock: 15, status: "active", image: "" },
  { id: "p-007", name: "Coconut Aminos Sauce", sku: "CA-250", category: "Condiments", price: 88000, stock: 0, status: "inactive", image: "" },
  { id: "p-008", name: "Dark Chocolate 85% Cacao", sku: "CH-85", category: "Snacks", price: 56000, stock: 64, status: "active", image: "" },
  { id: "p-009", name: "Chia Seeds 500g", sku: "CS-500", category: "Superfoods", price: 79000, stock: 31, status: "active", image: "" },
  { id: "p-010", name: "Kombucha Starter Kit", sku: "KB-KIT", category: "Beverages", price: 210000, stock: 4, status: "draft", image: "" },
  { id: "p-011", name: "Extra Virgin Coconut Oil 1L", sku: "CO-1L", category: "Pantry", price: 165000, stock: 52, status: "active", image: "" },
  { id: "p-012", name: "Sun-Dried Tomatoes 200g", sku: "TM-200", category: "Pantry", price: 62000, stock: 19, status: "active", image: "" },
  { id: "p-013", name: "Grass-Fed Ghee 400g", sku: "GH-400", category: "Dairy", price: 148000, stock: 8, status: "active", image: "" },
  { id: "p-014", name: "Turmeric Powder, Single-Origin", sku: "TU-150", category: "Spices", price: 45000, stock: 0, status: "inactive", image: "" },
  { id: "p-015", name: "Buckwheat Pancake Mix", sku: "BW-MIX", category: "Breakfast", price: 71000, stock: 27, status: "active", image: "" },
];

export function findProduct(id: string): DemoProduct | undefined {
  return demoProducts.find((p) => p.id === id);
}

export const CATEGORY_OPTIONS = [
  "Pantry",
  "Spices",
  "Breakfast",
  "Spreads",
  "Beverages",
  "Condiments",
  "Snacks",
  "Superfoods",
  "Dairy",
];

/** Global-search results, drawn from the fake catalog. */
export function demoSearch(query: string) {
  const q = query.toLowerCase();
  return demoProducts
    .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      group: "Products",
      label: p.name,
      detail: p.sku,
      href: `/demo/products/${p.id}`,
    }));
}
