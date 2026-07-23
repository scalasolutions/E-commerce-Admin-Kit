import Link from "next/link";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function AdminEmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 rounded-xl border border-dashed border-admin-border bg-admin-surface-subdued/60 min-h-[300px]">
      <div className="h-12 w-12 rounded-full bg-admin-accent-subdued flex items-center justify-center mb-4">
        <Inbox className="h-6 w-6 text-admin-accent" />
      </div>
      <h3 className="text-base font-semibold text-admin-text">
        {title}
      </h3>
      <p className="text-xs text-admin-text-subdued mt-1 max-w-sm">
        {description}
      </p>
      {actionLabel && actionHref && (
        <div className="mt-6">
          <Link href={actionHref}>
            <Button variant="primary" size="md">
              {actionLabel}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
