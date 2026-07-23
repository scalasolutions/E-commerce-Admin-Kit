"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ *
 * Navigation model — a flat leaf or an expandable group of leaves.
 * ------------------------------------------------------------------ */
export type NavLeaf = { title: string; href: string; icon: LucideIcon };
export type NavGroup = { title: string; icon: LucideIcon; children: NavLeaf[] };
export type NavEntry = NavLeaf | NavGroup;

export const isNavGroup = (entry: NavEntry): entry is NavGroup => "children" in entry;

/* ------------------------------------------------------------------ *
 * Brand + auth + search are all supplied by the host app, so the kit
 * stays backend-agnostic (Supabase, Firebase, custom API — your call).
 * ------------------------------------------------------------------ */
export interface AdminBrand {
  /** Full product name shown in the sidebar header. */
  name: string;
  /** Small line under the name (e.g. "Admin"). */
  subtitle?: string;
  /** 1–3 letters for the collapsed logo + topbar avatar. Defaults from `name`. */
  initials?: string;
}

export interface AdminProfile {
  id: string;
  name: string;
  email?: string;
  /** Used for RBAC via `canAccess(role, href)` and shown in the topbar. */
  role: string;
  /** Human-readable role label for the topbar; falls back to `role`. */
  roleLabel?: string;
}

export interface AdminSearchResult {
  id: string;
  /** Section heading the result is grouped under (e.g. "Products"). */
  group: string;
  label: string;
  detail?: string;
  href: string;
  icon?: LucideIcon;
}

export interface AdminKitConfig {
  brand: AdminBrand;
  nav: NavEntry[];
  /** The signed-in admin, or null when unauthenticated. Host-resolved. */
  profile: AdminProfile | null;
  /** True while the host is still resolving the profile. */
  loading: boolean;
  /** Called by the sidebar logout button. */
  onSignOut: () => void | Promise<void>;
  /** Return false to hide a nav entry / gate a page for a role. Defaults to open. */
  canAccess?: (role: string, href: string) => boolean;
  /** Optional global search. Omit to hide the topbar search box. */
  onSearch?: (query: string) => Promise<AdminSearchResult[]>;
}

const AdminKitContext = React.createContext<AdminKitConfig | undefined>(undefined);

export function AdminProvider({
  children,
  ...config
}: AdminKitConfig & { children: React.ReactNode }) {
  return <AdminKitContext.Provider value={config}>{children}</AdminKitContext.Provider>;
}

export function useAdminKit(): AdminKitConfig {
  const ctx = React.useContext(AdminKitContext);
  if (!ctx) throw new Error("useAdminKit must be used within <AdminProvider>");
  return ctx;
}

/** Derive avatar/logo initials from the brand. */
export function brandInitials(brand: AdminBrand): string {
  if (brand.initials) return brand.initials;
  return brand.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
