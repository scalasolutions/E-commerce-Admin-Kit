"use client";

import * as React from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStorage } from "@/lib/adapters/storage";

interface AdminRichTextProps {
  value: string;
  onChange: (html: string) => void;
  /** Placeholder shown when the editor is empty. */
  placeholder?: string;
  /** Key prefix passed to the storage adapter for inline images. */
  folder?: string;
  /** Logical bucket / container, when the adapter uses one. */
  bucket?: string;
}

const MAX_SIZE_MB = 5;

/**
 * Tiptap-backed rich-text editor. Produces HTML with headings, lists, quotes,
 * links and inline images. Inline images are uploaded through the host
 * `StorageAdapter` and inserted by public URL. Requires the `@tiptap/*` peer
 * deps (see the kit README) and the Tailwind typography plugin for `prose`.
 */
export default function AdminRichText({
  value,
  onChange,
  placeholder = "Write your content…",
  folder = "content",
  bucket,
}: AdminRichTextProps) {
  const storage = useStorage();
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const editor = useEditor({
    // Next.js SSR: render on the client only to avoid hydration mismatches.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Image.configure({ HTMLAttributes: { class: "rounded-xl" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[280px] px-4 py-3 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep the editor in sync when the form resets to a different record.
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  async function uploadImage(file: File) {
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
      editor?.chain().focus().setImage({ src: url }).run();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  function addLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", prev ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) {
    return (
      <div className="flex h-[320px] items-center justify-center rounded-md border border-admin-border text-admin-text-disabled">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-admin-border bg-admin-surface">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-admin-border-subtle px-2 py-1.5">
        <ToolButton editor={editor} name="bold" onClick={() => editor.chain().focus().toggleBold().run()} label="Bold">
          <Bold className="h-4 w-4" />
        </ToolButton>
        <ToolButton editor={editor} name="italic" onClick={() => editor.chain().focus().toggleItalic().run()} label="Italic">
          <Italic className="h-4 w-4" />
        </ToolButton>
        <Divider />
        <ToolButton
          editor={editor}
          name="heading"
          attrs={{ level: 2 }}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          label="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </ToolButton>
        <ToolButton
          editor={editor}
          name="heading"
          attrs={{ level: 3 }}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          label="Subheading"
        >
          <Heading3 className="h-4 w-4" />
        </ToolButton>
        <Divider />
        <ToolButton editor={editor} name="bulletList" onClick={() => editor.chain().focus().toggleBulletList().run()} label="Bullet list">
          <List className="h-4 w-4" />
        </ToolButton>
        <ToolButton editor={editor} name="orderedList" onClick={() => editor.chain().focus().toggleOrderedList().run()} label="Numbered list">
          <ListOrdered className="h-4 w-4" />
        </ToolButton>
        <ToolButton editor={editor} name="blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} label="Quote">
          <Quote className="h-4 w-4" />
        </ToolButton>
        <Divider />
        <ToolButton editor={editor} name="link" onClick={addLink} label="Link">
          <LinkIcon className="h-4 w-4" />
        </ToolButton>
        <button
          type="button"
          title="Insert image"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex h-8 w-8 items-center justify-center rounded text-admin-text-subdued hover:bg-admin-surface-subdued disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        </button>
        <Divider />
        <button
          type="button"
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          className="flex h-8 w-8 items-center justify-center rounded text-admin-text-subdued hover:bg-admin-surface-subdued"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          className="flex h-8 w-8 items-center justify-center rounded text-admin-text-subdued hover:bg-admin-surface-subdued"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>

      <EditorContent editor={editor} />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadImage(file);
          e.target.value = "";
        }}
      />

      {error && <p className="px-4 pb-2 text-[11px] font-semibold text-admin-critical-text">{error}</p>}
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-admin-border" />;
}

function ToolButton({
  editor,
  name,
  attrs,
  onClick,
  label,
  children,
}: {
  editor: Editor;
  name: string;
  attrs?: Record<string, unknown>;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  const active = attrs ? editor.isActive(name, attrs) : editor.isActive(name);
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded transition-colors",
        active ? "bg-admin-accent text-white" : "text-admin-text-subdued hover:bg-admin-surface-subdued"
      )}
    >
      {children}
    </button>
  );
}
