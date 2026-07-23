/**
 * Per-client Admin Kit config. Copy this to e.g. `lib/admin-kit.config.tsx`
 * and edit. This file + the CSS accent (styles/admin-theme.css) + your auth
 * wiring in app/admin/layout.tsx are the only things that change per client.
 */
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  ShoppingCart,
  ClipboardList,
  CreditCard,
  Truck,
  Users,
  SlidersHorizontal,
  Settings,
  UserCheck,
} from "lucide-react";
import type { AdminBrand, NavEntry } from "@/components/admin/admin-context";

export const brand: AdminBrand = {
  name: "Client Name",
  subtitle: "Admin",
  initials: "CN", // shown collapsed + in the topbar avatar; omit to derive from name
};

/**
 * Grouped, nested navigation. A top-level entry is either a standalone leaf
 * ({ title, href, icon }) or an expandable group ({ title, icon, children }).
 * Point `href`s at your own routes.
 */
export const nav: NavEntry[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    title: "Catalog",
    icon: Package,
    children: [
      { title: "Products", href: "/admin/products", icon: ShoppingBag },
      { title: "Categories", href: "/admin/categories", icon: Layers },
    ],
  },
  {
    title: "Sales",
    icon: ShoppingCart,
    children: [
      { title: "Orders", href: "/admin/orders", icon: ClipboardList },
      { title: "Payments", href: "/admin/payments", icon: CreditCard },
      { title: "Logistics", href: "/admin/logistics", icon: Truck },
    ],
  },
  { title: "Customers", href: "/admin/customers", icon: Users },
  {
    title: "System",
    icon: SlidersHorizontal,
    children: [
      { title: "Settings", href: "/admin/settings", icon: Settings },
      { title: "Users", href: "/admin/users", icon: UserCheck },
    ],
  },
];

/**
 * RBAC: return false to hide a nav entry / gate a page for a role. The kit
 * filters the sidebar and gates the page body with this. Default: allow all.
 */
export function canAccess(role: string, href: string): boolean {
  // Example: only owners/admins may reach /admin/users
  if (href.startsWith("/admin/users")) return role === "owner" || role === "admin";
  return true;
}

/* ------------------------------------------------------------------ *
 * Storage adapter — powers the upload / gallery / media / rich-text /
 * storage-usage components. Wrap your admin in <StorageProvider adapter={...}>.
 * This is a Supabase implementation; swap the body for S3, UploadThing, etc.
 * The kit only depends on the StorageAdapter shape, never on Supabase.
 * ------------------------------------------------------------------ */
// import type { StorageAdapter } from "@/lib/adapters/storage";
// import { supabase } from "@/lib/supabase/client";
//
// const BUCKET = "media"; // your public bucket
//
// export const storageAdapter: StorageAdapter = {
//   async upload(file, opts) {
//     const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
//     const key = `${opts?.folder ?? "uploads"}/${Date.now()}-${Math.random()
//       .toString(36)
//       .slice(2, 8)}.${ext}`;
//     const { error } = await supabase.storage
//       .from(opts?.bucket ?? BUCKET)
//       .upload(key, file, { cacheControl: "3600", contentType: file.type });
//     if (error) throw new Error(error.message);
//     const { data } = supabase.storage.from(opts?.bucket ?? BUCKET).getPublicUrl(key);
//     return { url: data.publicUrl };
//   },
//   async remove(url) {
//     // Derive the object key from the public URL, then delete it.
//     const key = url.split(`/${BUCKET}/`)[1];
//     if (key) await supabase.storage.from(BUCKET).remove([key]);
//   },
//   async usage() {
//     // Back this with an admin-only RPC that sums object sizes.
//     const { data } = await supabase.rpc("get_storage_usage_bytes");
//     return { usedBytes: Number(data ?? 0), quotaBytes: 20 * 1024 ** 3 };
//   },
// };
