import * as React from "react";
import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/** Semantic tone for the icon chip — lets a metric read at a glance. */
export type StatTone = "accent" | "success" | "warning" | "critical" | "info";

const TONE_CHIP: Record<StatTone, string> = {
  accent: "bg-admin-accent-subdued text-admin-accent",
  success: "bg-admin-success-bg text-admin-success-text",
  warning: "bg-admin-warning-bg text-admin-warning-text",
  critical: "bg-admin-critical-bg text-admin-critical-text",
  info: "bg-admin-info-bg text-admin-info-text",
};

interface AdminStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  /** Colors the icon chip. Defaults to the neutral accent. */
  tone?: StatTone;
  /** Optional period-over-period delta chip. */
  trend?: { value: number; direction: "up" | "down" };
}

export default function AdminStatCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "accent",
  trend,
}: AdminStatCardProps) {
  return (
    <Card className="admin-hover-lift">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wide text-admin-text-subdued">
            {title}
          </span>
          {Icon && (
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                TONE_CHIP[tone]
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
          )}
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight text-admin-text">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                trend.direction === "up"
                  ? "bg-admin-success-bg text-admin-success-text"
                  : "bg-admin-critical-bg text-admin-critical-text"
              )}
            >
              {trend.direction === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {trend.value}%
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-xs text-admin-text-subdued">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
