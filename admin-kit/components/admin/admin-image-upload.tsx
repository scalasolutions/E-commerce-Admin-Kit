"use client";

import * as React from "react";
import { Loader2, X, Image as ImageIcon, Link2, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useStorage } from "@/lib/adapters/storage";

interface AdminImageUploadProps {
  /** Current image URL ("" when unset). */
  value: string;
  onChange: (url: string) => void;
  /** Key prefix passed to the storage adapter, e.g. "products". */
  folder?: string;
  /** Logical bucket / container, when the adapter uses one. */
  bucket?: string;
}

const MAX_SIZE_MB = 5;

/**
 * Image picker backed by the host `StorageAdapter`: uploads the chosen file and
 * reports its public URL through `onChange`. Supports click-to-browse and
 * drag-and-drop, shows the image with hover actions to replace or remove, and
 * keeps an optional manual URL field for linking images hosted elsewhere.
 */
export default function AdminImageUpload({ value, onChange, folder, bucket }: AdminImageUploadProps) {
  const storage = useStorage();
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [showUrl, setShowUrl] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file (JPG, PNG, WebP…).");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image is too large — keep it under ${MAX_SIZE_MB} MB.`);
      return;
    }

    setUploading(true);
    try {
      const { url } = await storage.upload(file, { folder, bucket });
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-3">
      {value ? (
        <div className="group relative h-44 w-44 overflow-hidden rounded-xl border border-admin-border bg-admin-surface-subdued">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Image preview" className="h-full w-full object-cover" />

          {/* Hover overlay with actions */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-admin-text/50 opacity-0 backdrop-blur-[1px] transition-opacity duration-150 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-admin-text shadow-admin transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
            >
              {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-semibold text-admin-critical-text shadow-admin transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
            >
              <X className="h-3 w-3" />
              Remove
            </button>
          </div>

          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-admin-surface/70 text-admin-text-subdued">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-[10px] font-semibold">Uploading…</span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          disabled={uploading}
          className={cn(
            "flex h-44 w-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-admin-text-disabled transition-colors",
            dragActive
              ? "border-admin-accent bg-admin-accent-subdued text-admin-accent"
              : "border-admin-border bg-admin-surface-subdued hover:border-admin-text-disabled hover:bg-admin-surface-hover hover:text-admin-text-subdued"
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-[10px] font-semibold">Uploading…</span>
            </>
          ) : (
            <>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-admin-surface shadow-admin">
                <ImageIcon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-semibold">
                {dragActive ? "Drop to upload" : "Click or drag image"}
              </span>
              <span className="text-[9px]">JPG · PNG · WebP · max {MAX_SIZE_MB} MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <button
        type="button"
        onClick={() => setShowUrl((s) => !s)}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-admin-text-subdued transition-colors hover:text-admin-accent"
      >
        <Link2 className="h-3 w-3" />
        {showUrl ? "Hide URL field" : "Paste a URL instead"}
      </button>

      {showUrl && (
        <Input
          placeholder="https://…"
          className="text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}

      {error && <p className="text-[11px] font-semibold text-admin-critical-text">{error}</p>}
    </div>
  );
}
