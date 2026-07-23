"use client";

import AdminPageHeader from "@/components/admin/admin-page-header";
import AdminEmptyState from "@/components/admin/admin-empty-state";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Settings" description="Placeholder page — wire your own data here." />
      <AdminEmptyState
        title="Nothing here yet"
        description="This demo route is a stub. In a real project this is where the settings form would live."
      />
    </div>
  );
}
