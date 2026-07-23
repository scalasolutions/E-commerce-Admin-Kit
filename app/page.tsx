import Link from "next/link";
import { LayoutGrid, PanelsTopLeft, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-admin-border bg-admin-surface px-3 py-1 text-xs font-semibold text-admin-text-subdued shadow-admin">
        <span className="h-2 w-2 rounded-full bg-admin-accent" />
        E-commerce Admin Kit
      </span>

      <h1 className="mt-6 text-4xl font-bold tracking-tight text-admin-text sm:text-5xl">
        A portable admin design system.
      </h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-admin-text-subdued">
        Backend-agnostic primitives, an admin shell, and building blocks — extracted
        and polished over real projects. Re-theme with three CSS variables, drop in a
        storage adapter, and ship.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/gallery"
          className="group flex flex-col gap-3 rounded-xl border border-admin-border bg-admin-surface p-6 shadow-admin transition-colors hover:border-admin-accent"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-admin-accent-subdued text-admin-accent">
            <LayoutGrid className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold text-admin-text">Component gallery</span>
          <span className="text-sm text-admin-text-subdued">
            Every primitive and building block, in every state.
          </span>
          <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-admin-accent">
            Browse <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/demo/dashboard"
          className="group flex flex-col gap-3 rounded-xl border border-admin-border bg-admin-surface p-6 shadow-admin transition-colors hover:border-admin-accent"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-admin-accent-subdued text-admin-accent">
            <PanelsTopLeft className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold text-admin-text">Wired demo admin</span>
          <span className="text-sm text-admin-text-subdued">
            The full shell: sidebar, search, tables, forms — on fake data.
          </span>
          <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-admin-accent">
            Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </main>
  );
}
