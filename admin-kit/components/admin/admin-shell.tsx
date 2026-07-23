"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import { useAdminKit } from "./admin-context";

/**
 * The admin frame: sidebar + topbar + scrollable page body. Wrap it in
 * <AdminProvider> (which supplies brand, nav, profile, auth). Handles the
 * loading state, an unauthenticated gate, RBAC page-gating, and the page-mount
 * fade. The `.admin-shell` root is required — the motion utilities are scoped
 * under it.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, loading, canAccess } = useAdminKit();

  if (loading) {
    return (
      <div className="admin-shell flex h-screen items-center justify-center bg-admin-surface-subdued text-sm text-admin-text-subdued">
        Loading…
      </div>
    );
  }

  if (!profile) {
    // Host middleware should normally redirect unauthenticated visitors before
    // reaching here; this is a safety net.
    return (
      <div className="admin-shell flex h-screen items-center justify-center bg-admin-surface-subdued text-sm text-admin-text-subdued">
        You are not signed in.
      </div>
    );
  }

  const allowed = !canAccess || canAccess(profile.role, pathname);

  return (
    <div className="admin-shell flex h-screen overflow-hidden bg-admin-surface-subdued text-admin-text">
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar />
        <main key={pathname} className="admin-fade-in-up flex-1 overflow-y-auto p-8">
          {allowed ? children : <AccessDenied />}
        </main>
      </div>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-admin-border bg-admin-surface p-10 text-center shadow-admin">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-admin-accent-subdued text-admin-accent">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="mt-6 text-xl font-bold tracking-tight text-admin-text">Access Denied</h2>
        <p className="mt-2 text-sm leading-relaxed text-admin-text-subdued">
          Your role doesn&apos;t have permission to view this section.
        </p>
      </div>
    </div>
  );
}
