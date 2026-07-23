import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface AdminSectionCardProps {
  title: string;
  description?: string;
  /** Optional controls rendered on the right of the header (toggles, tags). */
  action?: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminSectionCard({
  title,
  description,
  action,
  children,
}: AdminSectionCardProps) {
  return (
    <Card>
      <CardHeader className="p-6 border-b border-admin-border-subtle">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-base font-semibold text-admin-text">
              {title}
            </CardTitle>
            {description && (
              <CardDescription className="text-xs mt-0.5">
                {description}
              </CardDescription>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {children}
      </CardContent>
    </Card>
  );
}
