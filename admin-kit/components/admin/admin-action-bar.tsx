import * as React from "react";

interface AdminActionBarProps {
  children: React.ReactNode;
}

export default function AdminActionBar({ children }: AdminActionBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-xl border border-admin-border bg-admin-surface shadow-admin mb-6">
      {children}
    </div>
  );
}
