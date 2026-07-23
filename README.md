# E-commerce Admin Kit

A portable, backend-agnostic **admin design system + shell** for e-commerce
dashboards. Neutral Polaris-inspired look, one-line accent re-theme, grouped
collapsible sidebar, a full set of UI primitives, and admin building blocks
(tables, stat cards, uploads, rich-text, charts) — extracted and polished over
real projects (Francis Organic, Her Palais).

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · `lucide-react`.
No backend is baked in — you supply auth, search, and a storage adapter.

## This repo is two things

1. **The kit payload** — everything under [`admin-kit/`](./admin-kit). This is
   the source of truth you copy into consumer projects.
2. **A showcase app** — a runnable Next.js app that renders the kit so you can
   polish it without a host project:
   - `/gallery` — every primitive and building block, in its states.
   - `/demo` — a fully-wired fake admin (sidebar, search, a products table with
     pagination + inline status, and a product form with uploads + rich text),
     running on in-memory data and an in-memory storage adapter.

```bash
npm install
npm run dev        # → http://localhost:3000
npm run build      # verify it compiles
npm run lint
```

## Using the kit in another project

The kit is consumed **copy-in** (not an npm package), so each project can freely
tweak components. A sync script does the copying both ways.

```bash
# From this repo, copy the payload into a consumer:
npm run sync push ../My-Store          # writes components/, lib/, admin-kit/{styles,config,preset}
npm run sync diff ../My-Store          # list what would change, no writes
npm run sync pull ../My-Store          # bring a consumer's edits back here to review with git diff
```

Then in the consumer (~10 min — full walkthrough in [`admin-kit/README.md`](./admin-kit/README.md)):

1. `npm i clsx tailwind-merge lucide-react`
2. Add the preset to `tailwind.config.ts` and scan `components/`.
3. `@import` the theme CSS in `app/globals.css`.
4. Re-theme by editing three `--admin-accent*` vars.
5. Copy `admin-kit/config/admin-kit.config.example.tsx` → `lib/admin-kit.config.tsx` and edit brand/nav/RBAC/storage.
6. Wire auth + a `StorageAdapter` in `app/admin/layout.tsx`.

## Backend seams

The kit never imports a backend. Three seams keep it portable:

| Seam | Supplied via | Powers |
|---|---|---|
| **Auth / profile** | `<AdminProvider profile onSignOut>` | sidebar identity, RBAC gating |
| **Search** | `<AdminProvider onSearch>` | topbar global search |
| **Storage** | `<StorageProvider adapter>` | image / gallery / media upload, storage meter, rich-text images |

See `admin-kit/lib/adapters/storage.tsx` for the `StorageAdapter` interface and
an in-memory implementation; the config example has a Supabase one.

## License

Private — internal Scala Solutions tooling.
