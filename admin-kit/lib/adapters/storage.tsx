"use client";

import * as React from "react";

/* ------------------------------------------------------------------ *
 * Storage seam.
 *
 * The upload / gallery / media / storage-usage / rich-text components are the
 * only ones in the kit that need a backend. Instead of importing Supabase (or
 * S3, or anything) directly, they read a `StorageAdapter` from context. The
 * host app supplies one — see `config/admin-kit.config.example.tsx` for a
 * ~20-line Supabase implementation, and `demo/` for an in-memory one.
 * ------------------------------------------------------------------ */

export interface UploadOptions {
  /** Key prefix inside the store, e.g. "products". */
  folder?: string;
  /** Logical bucket / container name, when the backend has them. */
  bucket?: string;
  /** Progress 0..1, if the adapter can report it. */
  onProgress?: (fraction: number) => void;
}

export interface StorageUsage {
  usedBytes: number;
  quotaBytes: number;
}

export interface StorageAdapter {
  /** Upload a file and resolve its publicly-servable URL. */
  upload(file: File, opts?: UploadOptions): Promise<{ url: string }>;
  /** Remove a previously-uploaded asset by its URL. Optional. */
  remove?(url: string): Promise<void>;
  /** Total usage against quota, for the storage meter. Optional. */
  usage?(): Promise<StorageUsage>;
}

const StorageContext = React.createContext<StorageAdapter | null>(null);

export function StorageProvider({
  adapter,
  children,
}: {
  adapter: StorageAdapter;
  children: React.ReactNode;
}) {
  return <StorageContext.Provider value={adapter}>{children}</StorageContext.Provider>;
}

/**
 * Read the host-supplied storage adapter. Throws if a component that needs
 * storage is rendered without a `<StorageProvider>` — a loud, early failure
 * beats a silent no-op upload button.
 */
export function useStorage(): StorageAdapter {
  const ctx = React.useContext(StorageContext);
  if (!ctx) {
    throw new Error(
      "useStorage must be used within a <StorageProvider>. Pass a StorageAdapter " +
        "(see admin-kit config example) to enable uploads."
    );
  }
  return ctx;
}

/** Non-throwing variant — returns null when no adapter is mounted. */
export function useOptionalStorage(): StorageAdapter | null {
  return React.useContext(StorageContext);
}

/**
 * An adapter that keeps files in memory as object URLs. Handy for the showcase
 * and for tests; obviously not for production (URLs die on reload).
 */
export function createInMemoryStorageAdapter(
  opts: { quotaBytes?: number } = {}
): StorageAdapter {
  let used = 0;
  const urls = new Map<string, number>();
  return {
    async upload(file) {
      // Simulate a short round-trip so the uploading spinner is visible.
      await new Promise((r) => setTimeout(r, 400));
      const url = URL.createObjectURL(file);
      urls.set(url, file.size);
      used += file.size;
      return { url };
    },
    async remove(url) {
      const size = urls.get(url) ?? 0;
      used = Math.max(0, used - size);
      urls.delete(url);
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    },
    async usage() {
      return { usedBytes: used, quotaBytes: opts.quotaBytes ?? 20 * 1024 ** 3 };
    },
  };
}
