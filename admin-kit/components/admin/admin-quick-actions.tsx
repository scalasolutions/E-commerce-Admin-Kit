"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Zap, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface AdminQuickActionsProps {
  actions: QuickAction[];
}

/** Quick-actions menu — a single button that opens a list of shortcuts. */
export default function AdminQuickActions({ actions }: AdminQuickActionsProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="primary"
        size="md"
        className="gap-2"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Zap className="h-4 w-4" />
        Quick Actions
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        />
      </Button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-xl border border-admin-border bg-admin-surface p-1.5 shadow-admin-lift animate-fade-in-up"
        >
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.href}
                role="menuitem"
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(action.href);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs font-medium text-admin-text transition-colors hover:bg-admin-surface-subdued"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-admin-accent-subdued text-admin-accent">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {action.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
