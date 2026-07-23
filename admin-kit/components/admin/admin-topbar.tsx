"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { useAdminKit, brandInitials, type AdminSearchResult } from "./admin-context";

export function AdminTopbar() {
  const router = useRouter();
  const { brand, profile, onSearch } = useAdminKit();

  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<AdminSearchResult[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!onSearch) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    let cancelled = false;
    const timer = setTimeout(async () => {
      const found = await onSearch(q);
      if (cancelled) return;
      setResults(found);
      setSearching(false);
      setOpen(true);
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, onSearch]);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function goTo(result: AdminSearchResult) {
    setOpen(false);
    setQuery("");
    router.push(result.href);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") setOpen(false);
    else if (e.key === "Enter" && results.length > 0) goTo(results[0]);
  }

  const groups = Array.from(new Set(results.map((r) => r.group))).map((group) => ({
    group,
    items: results.filter((r) => r.group === group),
  }));

  const roleLabel = profile?.roleLabel ?? profile?.role ?? "";

  return (
    <header className="h-16 border-b border-admin-border bg-admin-surface flex items-center justify-between px-8 sticky top-0 z-10">
      {onSearch ? (
        <div ref={containerRef} className="relative w-72">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-admin-text-disabled">
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </span>
          <input
            type="text"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setOpen(true)}
            onKeyDown={handleKeyDown}
            className="w-full h-9 pl-9 pr-4 text-xs rounded-lg border border-transparent bg-admin-surface-subdued text-admin-text placeholder:text-admin-text-disabled transition-colors focus:outline-none focus:bg-admin-surface focus:border-admin-accent focus:ring-2 focus:ring-admin-accent/30"
          />

          {open && query.trim().length >= 2 && (
            <div className="absolute top-full left-0 mt-1 w-96 max-h-96 overflow-y-auto rounded-xl border border-admin-border bg-admin-surface shadow-admin-lift">
              {results.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-admin-text-subdued">
                  {searching ? "Searching…" : `No results for “${query.trim()}”.`}
                </p>
              ) : (
                groups.map(({ group, items }) => (
                  <div key={group}>
                    <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-admin-text-disabled">
                      {group}
                    </p>
                    {items.map((result) => {
                      const Icon = result.icon;
                      return (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => goTo(result)}
                          className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-admin-surface-subdued transition-colors"
                        >
                          {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-admin-text-disabled" />}
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold text-admin-text truncate">
                              {result.label}
                            </span>
                            {result.detail && (
                              <span className="block text-[11px] text-admin-text-subdued truncate">
                                {result.detail}
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div />
      )}

      {/* Signed-in admin */}
      <div className="flex items-center gap-2.5 pl-6">
        <div className="h-8 w-8 rounded-full bg-admin-accent-subdued flex items-center justify-center">
          <span className="text-xs font-semibold text-admin-accent">{brandInitials(brand)}</span>
        </div>
        <div className="hidden md:flex flex-col">
          <span className="text-xs font-semibold text-admin-text leading-none">{profile?.name ?? "—"}</span>
          {roleLabel && (
            <span className="text-[11px] text-admin-text-subdued leading-none mt-1">{roleLabel}</span>
          )}
        </div>
      </div>
    </header>
  );
}
