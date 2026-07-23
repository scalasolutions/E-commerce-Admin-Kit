import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text shadow-admin transition-colors placeholder:text-admin-text-disabled focus-visible:outline-none focus-visible:border-admin-accent focus-visible:ring-2 focus-visible:ring-admin-accent/30 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
