# Changelog

## 0.1.0 — Initial extraction

First cut of the reusable kit, extracted from the Francis Organic admin and
generalised so it can be re-themed and reused per client.

### Design system
- `admin-*` Tailwind token scale + preset, three-variable accent re-theme, scoped
  motion utilities.
- UI primitives: button, card, table, badge, input, select (admin + store
  variants), textarea, checkbox, switch, modal, label, money-input, confetti.
- Admin shell: `<AdminProvider>` / `<AdminShell>` / grouped collapsible sidebar /
  topbar with pluggable global search / RBAC page-gating.

### Building blocks
- Page header, section card (with header action slot), stat card (tone + trend),
  table shell (built-in top/bottom pagination), status badge, inline status
  select, empty state, action bar, form section, search input, quick actions,
  area chart, date/time range, auto-shrink text.

### Backend seams
- **StorageAdapter** (`lib/adapters/storage.tsx`) — `<StorageProvider>` +
  `useStorage()` + in-memory adapter. The image / gallery / media upload,
  storage-usage meter, and rich-text editor now depend only on this interface,
  not on Supabase.
- Auth/profile and search remain injected through `<AdminProvider>`.

### Tooling
- Runnable showcase app: `/gallery` (all components) + `/demo` (wired fake admin).
- `scripts/sync.mjs` — push/pull/diff the payload between this repo and consumers.

### Notes
- Currency/locale/timezone are the per-client knobs in `lib/utils.ts`
  (`LOCALE`, `CURRENCY`, `TIMEZONE`); day-boundary helpers are timezone-aware.
- Left in the source projects (business-specific): shipping label, booking
  widget, order shipment modal, customer business fields.
