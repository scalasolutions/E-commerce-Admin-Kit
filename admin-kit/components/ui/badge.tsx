import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "lime" | "danger" | "success" | "warning" | "info" | "neutral";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-5 transition-colors",
        {
          "border-transparent bg-admin-neutral-bg text-admin-neutral-text": variant === "default" || variant === "secondary" || variant === "neutral",
          "border-admin-border bg-admin-surface text-admin-text-subdued": variant === "outline",
          "border-transparent bg-admin-accent-subdued text-admin-accent": variant === "lime",
          "border-transparent bg-admin-critical-bg text-admin-critical-text": variant === "danger",
          "border-transparent bg-admin-success-bg text-admin-success-text": variant === "success",
          "border-transparent bg-admin-warning-bg text-admin-warning-text": variant === "warning",
          "border-transparent bg-admin-info-bg text-admin-info-text": variant === "info",
        },
        className
      )}
      {...props}
    />
  );
}
