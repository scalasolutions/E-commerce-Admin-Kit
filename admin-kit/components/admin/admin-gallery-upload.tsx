"use client";

import * as React from "react";
import { Loader2, Plus, X, ArrowLeft, ArrowRight, Play, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStorage } from "@/lib/adapters/storage";
import { isVideoUrl } from "@/lib/media";

interface AdminGalleryUploadProps {
  /** Current gallery media URLs (images and videos), in display order. */
  value: string[];
  onChange: (urls: string[]) => void;
  /** Key prefix passed to the storage adapter, e.g. "products/gallery". */
  folder?: string;
  /** Logical bucket / container, when the adapter uses one. */
  bucket?: string;
  /** Maximum number of gallery items (default 8). */
  maxImages?: number;
}

const MAX_IMAGE_MB = 5;
const MAX_VIDEO_MB = 50;

/**
 * Multi-file gallery picker backed by the host `StorageAdapter`. Accepts images
 * and videos, uploads each, and appends the public URLs to `value`. Tiles can be
 * removed, nudged with the arrow buttons, or dragged to reorder; the first tile
 * is flagged as the gallery cover.
 */
export default function AdminGalleryUpload({
  value,
  onChange,
  folder,
  bucket,
  maxImages = 8,
}: AdminGalleryUploadProps) {
  const storage = useStorage();
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState<{ done: number; total: number } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFiles(files: File[]) {
    setError(null);

    const room = maxImages - value.length;
    if (files.length > room) {
      setError(`Gallery is limited to ${maxImages} items — ${room} slot(s) left.`);
      return;
    }
    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      if (!isImage && !isVideo) {
        setError(`"${file.name}" is not an image or video file.`);
        return;
      }
      const maxMb = isVideo ? MAX_VIDEO_MB : MAX_IMAGE_MB;
      if (file.size > maxMb * 1024 * 1024) {
        setError(`"${file.name}" is too large — keep ${isVideo ? "videos" : "images"} under ${maxMb} MB.`);
        return;
      }
    }

    setUploading(true);
    setProgress({ done: 0, total: files.length });
    const uploaded: string[] = [];

    for (let i = 0; i < files.length; i++) {
      try {
        const { url } = await storage.upload(files[i], { folder, bucket });
        uploaded.push(url);
        setProgress({ done: i + 1, total: files.length });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed. Try again.");
        break;
      }
    }

    if (uploaded.length > 0) onChange([...value, ...uploaded]);
    setUploading(false);
    setProgress(null);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function moveTo(index: number, target: number) {
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  }

  function onFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    if (uploading) return;
    const files = Array.from(e.dataTransfer.files ?? []);
    if (files.length > 0) handleFiles(files);
  }

  return (
    <div className="space-y-2.5">
      <div
        className={cn(
          "flex flex-wrap gap-3 rounded-xl border border-dashed p-3 transition-colors",
          dragActive ? "border-admin-accent bg-admin-accent-subdued" : "border-admin-border-subtle bg-admin-surface-subdued/40"
        )}
        onDragOver={(e) => {
          // Only light up for external file drags, not tile reordering.
          if (dragIndex === null) {
            e.preventDefault();
            setDragActive(true);
          }
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragActive(false);
        }}
        onDrop={(e) => {
          if (dragIndex === null) onFileDrop(e);
        }}
      >
        {value.map((url, index) => {
          const isCover = index === 0;
          return (
            <div
              key={`${url}-${index}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragIndex !== index) setOverIndex(index);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragIndex !== index) moveTo(dragIndex, index);
                setDragIndex(null);
                setOverIndex(null);
              }}
              className={cn(
                "group relative h-24 w-24 cursor-grab overflow-hidden rounded-lg border bg-admin-surface transition-[transform,box-shadow] active:cursor-grabbing",
                overIndex === index ? "border-admin-accent ring-2 ring-admin-accent/40" : "border-admin-border",
                dragIndex === index && "opacity-40"
              )}
            >
              {isVideoUrl(url) ? (
                <>
                  <video src={url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-admin-text/50 text-white">
                      <Play className="ml-0.5 h-3.5 w-3.5" />
                    </span>
                  </span>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={`Gallery item ${index + 1}`} className="h-full w-full object-cover" />
              )}

              {/* Cover flag on the lead tile */}
              {isCover && (
                <span className="absolute left-1 top-1 rounded-md bg-admin-accent px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white shadow-admin">
                  Cover
                </span>
              )}

              {/* Drag affordance */}
              <span className="pointer-events-none absolute right-1 top-1 text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-3.5 w-3.5 drop-shadow" />
              </span>

              <button
                type="button"
                onClick={() => removeAt(index)}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-admin-border bg-white text-admin-text shadow-admin transition-colors hover:bg-admin-critical-bg hover:text-admin-critical-text"
                aria-label={`Remove gallery item ${index + 1}`}
              >
                <X className="h-3 w-3" />
              </button>

              <div className="absolute inset-x-0 bottom-0 hidden justify-between border-t border-admin-border bg-white/95 group-hover:flex">
                <button
                  type="button"
                  onClick={() => moveTo(index, index - 1)}
                  disabled={index === 0}
                  className="flex flex-1 items-center justify-center py-0.5 text-admin-text transition-colors hover:bg-admin-surface-hover disabled:opacity-30"
                  aria-label={`Move gallery item ${index + 1} left`}
                >
                  <ArrowLeft className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={() => moveTo(index, index + 1)}
                  disabled={index === value.length - 1}
                  className="flex flex-1 items-center justify-center py-0.5 text-admin-text transition-colors hover:bg-admin-surface-hover disabled:opacity-30"
                  aria-label={`Move gallery item ${index + 1} right`}
                >
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}

        {value.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-admin-border bg-admin-surface text-admin-text-disabled transition-colors hover:border-admin-text-disabled hover:bg-admin-surface-hover hover:text-admin-text-subdued"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {progress && (
                  <span className="text-[9px] font-semibold">
                    {progress.done}/{progress.total}
                  </span>
                )}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span className="text-[9px] font-semibold">Add media</span>
              </>
            )}
          </button>
        )}

        {value.length === 0 && (
          <div className="flex h-24 flex-1 items-center justify-center px-3 text-center text-[10px] text-admin-text-disabled">
            {dragActive ? "Drop files to upload" : "Drag files here or use “Add media”"}
          </div>
        )}
      </div>

      <p className="text-[10px] text-admin-text-subdued">
        Up to {maxImages} items — images ({MAX_IMAGE_MB} MB) or videos ({MAX_VIDEO_MB} MB). Drag tiles to reorder; the
        first is the cover.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) handleFiles(files);
          e.target.value = "";
        }}
      />

      {error && <p className="text-[11px] font-semibold text-admin-critical-text">{error}</p>}
    </div>
  );
}
