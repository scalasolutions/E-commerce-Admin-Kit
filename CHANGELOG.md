# Changelog

## Unreleased

### Reference flows in the showcase (fake-data pages built from the kit)
Full list + detail/edit pages so you can judge real UX, not just isolated components:
- **Vouchers** — list + a redesigned **live-preview edit page** (sticky coupon
  card that updates as you type; segmented discount-type control).
- **Campaigns** — list + two-column edit with a live tracked-link / QR preview.
- **Orders** — list (stat cards + filters) + a full order detail (customer,
  items + totals, payment + transactions, fulfillment, notes).
- **Payments** — list with status stat cards, method/reference table, and a
  webhook-events panel.
- **Logistics** — a stage-tab fulfillment queue with a guided courier-booking
  flow (rate selection) and a printable shipping-label preview.
- New **`Segmented`** control primitive (pill toggle group) used by the editors.
- Nav grouped into Sales (Orders/Payments/Logistics) and Marketing
  (Vouchers/Campaigns); the gallery gained a Reference-pages index.



### Reusable table patterns (extracted from Francis's list pages, not the pages themselves)
- `useRowSelection` hook — select-all-on-page, toggle, indeterminate, clear.
- `Checkbox` now supports `indeterminate` (dash state) for select-all headers.
- `AdminBulkBar` — sticky bulk-action bar shown when rows are selected.
- `AdminFilterBar` — search + filters toolbar layout above a table.
- `TableLoadingRow` / `TableEmptyRow` — the standard in-table states.
- `ConfirmDialog` — a typed, async-aware `window.confirm` replacement on the kit Modal.
- The `/demo` products page now wires all of the above end to end as a copyable recipe.

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
