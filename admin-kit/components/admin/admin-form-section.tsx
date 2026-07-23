import * as React from "react";

interface AdminFormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function AdminFormSection({
  title,
  description,
  children,
}: AdminFormSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 border-b border-admin-border-subtle last:border-b-0">
      <div>
        <h3 className="text-sm font-semibold text-admin-text">
          {title}
        </h3>
        {description && (
          <p className="text-xs text-admin-text-subdued mt-1">
            {description}
          </p>
        )}
      </div>
      <div className="md:col-span-2 space-y-4">
        {children}
      </div>
    </div>
  );
}
