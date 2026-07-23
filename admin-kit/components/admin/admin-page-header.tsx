import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function AdminPageHeader({
  title,
  description,
  actionLabel,
  actionHref,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-admin-text">
          {title}
        </h1>
        <p className="text-sm text-admin-text-subdued mt-1 max-w-2xl">
          {description}
        </p>
      </div>

      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button variant="primary" size="md" className="gap-1.5 font-medium">
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
