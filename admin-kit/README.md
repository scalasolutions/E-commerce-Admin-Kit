# Admin Kit

A portable, backend-agnostic admin design system + shell, extracted from the
Francis Organic and Her Palais admins. Neutral Polaris-inspired look, one-line
accent re-theme, grouped/collapsible sidebar, a set of primitives (button, card,
table, badge, input, select, textarea, checkbox, switch, modal, label, money
input, confetti) plus admin building blocks (page header, section card, stat
card with tone + trend, table shell with built-in pagination, status badge,
inline status select, empty state, action bar, form section, search input,
quick actions, area chart, date/time range, image/gallery/media upload,
storage meter, rich-text editor).

Stack assumptions: **Next.js (App Router) + TypeScript + Tailwind CSS**, icons
from `lucide-react`. No backend is baked in — you supply auth, search, and a
**storage adapter**.

## What's in here

```
admin-kit/
  tailwind-preset.ts              → Tailwind preset (admin-* tokens, shadows, keyframes)
  styles/admin-theme.css          → CSS accent variables + scoped motion utilities
  config/admin-kit.config.example.tsx → per-client brand + nav + RBAC + storage (copy & edit)
  components/ui/*                  → primitives (pure; only use admin-* tokens + cn)
                                     button, card, table, badge, input, select,
                                     textarea, checkbox (with indeterminate),
                                     switch, modal, confirm-dialog, label,
                                     money-input, confetti
  components/admin/*               → building blocks + the generic shell
      admin-context.tsx           → <AdminProvider> + useAdminKit() + nav types
      admin-shell.tsx             → <AdminShell> (sidebar + topbar + gated page body)
      admin-sidebar.tsx           → grouped / nested / collapsible nav
      admin-topbar.tsx            → avatar + optional pluggable search
      admin-page-header, admin-section-card, admin-stat-card, admin-table-shell,
      admin-status-badge, admin-inline-status-select, admin-empty-state,
      admin-action-bar, admin-form-section, admin-pagination, admin-search-input,
      admin-quick-actions, admin-area-chart, admin-date-range, admin-time-range,
      auto-shrink-text
      admin-filter-bar             → search + filters toolbar above a table
      admin-bulk-bar               → sticky bulk-action bar (pairs with useRowSelection)
      admin-table-states           → <TableLoadingRow> / <TableEmptyRow>
      admin-image-upload, admin-gallery-upload, admin-media-upload,
      admin-storage-usage, admin-rich-text   ← need a StorageAdapter
  lib/adapters/storage.tsx        → StorageAdapter interface + <StorageProvider> + in-memory impl
  lib/constants/status.ts         → status → tint/label vocabulary (badge + inline select)
  lib/media.ts                    → isVideoUrl / formatBytes
  lib/hooks/use-pagination.ts     → client-side pagination hook
  lib/hooks/use-row-selection.ts  → table multi-select (select-all, toggle, indeterminate, clear)
  lib/utils.ts                    → cn() + formatPrice/formatThousands/formatDate + day helpers
                                     (LOCALE / CURRENCY / TIMEZONE are the per-client knobs)
```

The list-page recipe (bulk select + filter + confirm + pagination) is wired end
to end in the showcase at `app/demo/products/page.tsx` — copy it as a starting
point for any table page.

## Backend seams

Nothing here imports a backend. Components that need one read it from context:

- **Auth / profile / search** — supplied to `<AdminProvider>` (see the layout
  example below).
- **Storage** — the upload/gallery/media/storage-usage/rich-text components call
  a `StorageAdapter` from `<StorageProvider adapter={...}>`. Implement the
  interface (`upload`, optional `remove`, optional `usage`) against Supabase, S3,
  UploadThing, whatever. `lib/adapters/storage.tsx` ships an in-memory adapter
  for local dev; the config example has a Supabase one.

The rich-text editor needs the `@tiptap/*` peer deps and the Tailwind
typography plugin; `confetti` needs `canvas-confetti`. Install those only if you
use those components.

## Install into a new repo (≈10 minutes)

**1. Dependencies**
```bash
npm i clsx tailwind-merge lucide-react
```

**2. Drop the files in.** Merge these into your repo (paths matter — the kit
imports via the `@/*` alias → repo root):
- `admin-kit/components/*` → `components/`
- `admin-kit/lib/hooks/*` → `lib/hooks/`
- `admin-kit/lib/utils.ts` → `lib/utils.ts` (if you already have one, just copy the `cn` export over)

Ensure `tsconfig.json` maps `"@/*": ["./*"]` (Next default).

**3. Tailwind.** Add the preset and make sure `content` scans the components:
```ts
// tailwind.config.ts
import adminKitPreset from "./admin-kit/tailwind-preset"; // or wherever you keep it
export default {
  presets: [adminKitPreset],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
};
```

**4. Theme CSS.** Import once in `app/globals.css`:
```css
@import "../admin-kit/styles/admin-theme.css";
```

**5. Re-theme for the client** — change three values in `admin-theme.css`:
```css
:root {
  --admin-accent: #7C3AED;          /* the client's brand color */
  --admin-accent-hover: #6D28D9;
  --admin-accent-subdued: #F1EBFC;  /* a very light tint of it */
}
```
That's the whole brand swap.

**6. Config.** Copy `config/admin-kit.config.example.tsx` → `lib/admin-kit.config.tsx`
and edit `brand`, `nav`, and `canAccess`.

**7. Wire auth in your admin layout.** The kit is backend-agnostic — you resolve
the profile and pass it in. Example with Supabase (swap for any backend):

```tsx
// app/admin/layout.tsx
"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { AdminProvider } from "@/components/admin/admin-context";
import { AdminShell } from "@/components/admin/admin-shell";
import { StorageProvider } from "@/lib/adapters/storage";
import { brand, nav, canAccess, storageAdapter } from "@/lib/admin-kit.config";
import { supabase } from "@/lib/supabase/client";
import type { AdminProfile, AdminSearchResult } from "@/components/admin/admin-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = React.useState<AdminProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setProfile(null); setLoading(false); return; }
      const { data: row } = await supabase
        .from("admin_users").select("id, name, email, role").eq("id", data.user.id).maybeSingle();
      setProfile(row ?? null);
      setLoading(false);
    });
  }, []);

  async function onSignOut() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  // Optional: return [] or omit onSearch entirely to hide the topbar search.
  async function onSearch(q: string): Promise<AdminSearchResult[]> {
    const { data } = await supabase.from("products").select("id, name").ilike("name", `%${q}%`).limit(5);
    return (data ?? []).map((p) => ({ id: p.id, group: "Products", label: p.name, href: `/admin/products/${p.id}` }));
  }

  return (
    <AdminProvider
      brand={brand}
      nav={nav}
      canAccess={canAccess}
      profile={profile}
      loading={loading}
      onSignOut={onSignOut}
      onSearch={onSearch}
    >
      {/* StorageProvider is only needed if you use the upload / rich-text components. */}
      <StorageProvider adapter={storageAdapter}>
        <AdminShell>{children}</AdminShell>
      </StorageProvider>
    </AdminProvider>
  );
}
```

That's it. Build your `app/admin/*` pages using the primitives and building
blocks (see any Francis admin page as a reference for the table + pagination +
modal patterns).

## Notes
- **Motion is scoped** under `.admin-shell` (applied by `<AdminShell>`), so the
  animations can't leak into a public site sharing the same globals.
- **Locale/currency** live in `lib/utils.ts` (`LOCALE`, `CURRENCY`) — change per
  client.
- **Not included** (they were backend-specific): image/gallery upload, storage
  usage, and the Supabase-coupled data pages themselves. Bring your own data
  layer; the shell and primitives don't care what it is.
- Neutrals + status tints are fixed in `tailwind-preset.ts` — override there if a
  client needs a different neutral scale.
```
