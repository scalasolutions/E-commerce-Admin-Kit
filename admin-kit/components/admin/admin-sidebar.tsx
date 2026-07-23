"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import {
  useAdminKit,
  isNavGroup,
  brandInitials,
  type NavEntry,
  type NavGroup,
  type NavLeaf,
} from "./admin-context";

const COLLAPSE_KEY = "admin-kit-sidebar-collapsed";
const OPEN_GROUPS_KEY = "admin-kit-sidebar-open-groups";

export function AdminSidebar() {
  const pathname = usePathname();
  const { brand, nav: NAV, profile, canAccess, onSignOut } = useAdminKit();

  const [collapsed, setCollapsed] = React.useState(false);
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = React.useState(false);

  const isLeafActive = React.useCallback(
    (href: string) => pathname === href || pathname.startsWith(href + "/"),
    [pathname]
  );

  // Filter nav by the active admin's role. Hide a group entirely if it has no
  // accessible children; keep everything when the profile hasn't resolved yet.
  const nav = React.useMemo<NavEntry[]>(() => {
    if (!profile || !canAccess) return NAV;
    const allow = (href: string) => canAccess(profile.role, href);
    return NAV.flatMap<NavEntry>((entry) => {
      if (!isNavGroup(entry)) return allow(entry.href) ? [entry] : [];
      const children = entry.children.filter((c) => allow(c.href));
      return children.length ? [{ ...entry, children }] : [];
    });
  }, [NAV, profile, canAccess]);

  React.useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
      const saved = localStorage.getItem(OPEN_GROUPS_KEY);
      if (saved) setOpenGroups(JSON.parse(saved));
    } catch {
      /* localStorage unavailable — fall back to defaults */
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    const activeGroup = NAV.find(
      (e) => isNavGroup(e) && e.children.some((c) => isLeafActive(c.href))
    );
    if (activeGroup) {
      setOpenGroups((prev) =>
        prev[activeGroup.title] ? prev : { ...prev, [activeGroup.title]: true }
      );
    }
  }, [NAV, isLeafActive]);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  function toggleGroup(title: string) {
    setOpenGroups((prev) => {
      const next = { ...prev, [title]: !prev[title] };
      try {
        localStorage.setItem(OPEN_GROUPS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r border-admin-border bg-admin-surface sticky top-0 transition-[width] duration-200 ease-out",
        collapsed ? "w-[68px]" : "w-64"
      )}
    >
      {/* Brand header + collapse toggle */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-4",
          collapsed ? "flex-col" : "justify-between px-5"
        )}
      >
        {collapsed ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-admin-accent text-sm font-bold text-white">
            {brandInitials(brand)}
          </span>
        ) : (
          <div className="flex flex-col">
            <h1 className="text-[15px] font-semibold leading-tight tracking-tight text-admin-text">
              {brand.name}
            </h1>
            {brand.subtitle && (
              <span className="text-xs text-admin-text-subdued">{brand.subtitle}</span>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-admin-text-subdued transition-colors hover:bg-admin-surface-subdued hover:text-admin-text"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4">
        <ul className="space-y-0.5">
          {nav.map((entry) =>
            isNavGroup(entry) ? (
              <GroupItem
                key={entry.title}
                group={entry}
                collapsed={collapsed && hydrated}
                open={!!openGroups[entry.title]}
                onToggle={() => toggleGroup(entry.title)}
                isLeafActive={isLeafActive}
              />
            ) : (
              <li key={entry.href}>
                <LeafLink leaf={entry} active={isLeafActive(entry.href)} collapsed={collapsed && hydrated} />
              </li>
            )
          )}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-admin-border-subtle p-3">
        <button
          type="button"
          onClick={() => onSignOut()}
          title={collapsed ? "Logout" : undefined}
          className={cn(
            "flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-admin-critical-text transition-colors hover:bg-admin-critical-bg",
            collapsed ? "justify-center px-0" : "gap-3"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}

function LeafLink({
  leaf,
  active,
  collapsed,
  nested = false,
}: {
  leaf: NavLeaf;
  active: boolean;
  collapsed: boolean;
  nested?: boolean;
}) {
  const Icon = leaf.icon;
  return (
    <Link
      href={leaf.href}
      title={collapsed ? leaf.title : undefined}
      className={cn(
        "group relative flex items-center rounded-lg text-sm transition-colors",
        collapsed ? "justify-center px-0 py-2" : "gap-3 px-3 py-2",
        nested && !collapsed && "py-1.5",
        active
          ? "bg-admin-accent-subdued font-semibold text-admin-accent"
          : "text-admin-text-subdued hover:bg-admin-surface-subdued hover:text-admin-text"
      )}
    >
      {active && !collapsed && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-admin-accent" />
      )}
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active ? "text-admin-accent" : "text-admin-text-disabled group-hover:text-admin-text"
        )}
      />
      {!collapsed && <span className="truncate">{leaf.title}</span>}
    </Link>
  );
}

function GroupItem({
  group,
  collapsed,
  open,
  onToggle,
  isLeafActive,
}: {
  group: NavGroup;
  collapsed: boolean;
  open: boolean;
  onToggle: () => void;
  isLeafActive: (href: string) => boolean;
}) {
  const Icon = group.icon;
  const hasActiveChild = group.children.some((c) => isLeafActive(c.href));

  // Collapsed rail: no room for a submenu — the group icon links straight to
  // its first child and shows a tooltip.
  if (collapsed) {
    const first = group.children[0];
    return (
      <li>
        <LeafLink
          leaf={{ ...first, title: group.title, icon: group.icon }}
          active={hasActiveChild}
          collapsed
        />
      </li>
    );
  }

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
          hasActiveChild
            ? "text-admin-accent hover:bg-admin-surface-subdued"
            : "text-admin-text-subdued hover:bg-admin-surface-subdued hover:text-admin-text"
        )}
      >
        <Icon
          className={cn(
            "h-4 w-4 shrink-0",
            hasActiveChild ? "text-admin-accent" : "text-admin-text-disabled"
          )}
        />
        <span className={cn("flex-1 truncate text-left", hasActiveChild ? "font-semibold" : "font-medium")}>
          {group.title}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            hasActiveChild ? "text-admin-accent" : "text-admin-text-disabled",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <ul className="mt-0.5 space-y-0.5 border-l border-admin-border-subtle pl-3 ml-4">
          {group.children.map((child) => (
            <li key={child.href}>
              <LeafLink leaf={child} active={isLeafActive(child.href)} collapsed={false} nested />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export type { LucideIcon };
