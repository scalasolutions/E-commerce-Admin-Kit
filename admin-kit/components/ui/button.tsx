import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "lime" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium border transition-[color,background-color,border-color,box-shadow,transform] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent/30 focus-visible:ring-offset-1 focus-visible:ring-offset-admin-surface disabled:pointer-events-none disabled:opacity-50",
          {
            // Primary: solid accent, white text
            "bg-admin-accent text-white border-transparent shadow-admin hover:bg-admin-accent-hover":
              variant === "primary" || variant === "lime",
            // Secondary / outline: white surface, hairline border
            "bg-admin-surface text-admin-text border-admin-border shadow-admin hover:bg-admin-surface-hover":
              variant === "secondary" || variant === "outline",
            // Ghost: transparent, subtle hover fill
            "bg-transparent text-admin-text border-transparent hover:bg-admin-surface-hover":
              variant === "ghost",
            // Danger: soft critical tint
            "bg-admin-critical-bg text-admin-critical-text border-transparent hover:bg-[#f9dede]":
              variant === "danger",
          },
          {
            "h-8 px-3 text-xs": size === "sm",
            "h-9 px-4 text-sm": size === "md",
            "h-10 px-6 text-base": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
