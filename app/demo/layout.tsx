"use client";

import * as React from "react";
import { AdminProvider } from "@/components/admin/admin-context";
import { AdminShell } from "@/components/admin/admin-shell";
import { StorageProvider, createInMemoryStorageAdapter } from "@/lib/adapters/storage";
import { brand, nav, canAccess, demoProfile, demoSearch } from "./demo-data";

/**
 * Stands up the kit exactly as a real consumer's `app/admin/layout.tsx` would:
 * supply brand + nav + a resolved profile + auth callbacks to <AdminProvider>,
 * a StorageAdapter for uploads, then render <AdminShell>. Here the profile is
 * hard-coded and storage is in-memory; a real app resolves both from its backend.
 */
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  // Stable across renders so object URLs survive navigation.
  const storage = React.useMemo(() => createInMemoryStorageAdapter(), []);

  return (
    <AdminProvider
      brand={brand}
      nav={nav}
      canAccess={canAccess}
      profile={demoProfile}
      loading={false}
      onSignOut={() => window.location.assign("/")}
      onSearch={async (q) => demoSearch(q)}
    >
      <StorageProvider adapter={storage}>
        <AdminShell>{children}</AdminShell>
      </StorageProvider>
    </AdminProvider>
  );
}
