"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  /** Runs on confirm. If it returns a promise, the confirm button shows a spinner until it settles, then the dialog closes. */
  onConfirm: () => void | Promise<void>;
  title: string;
  /** Body copy. String or your own nodes. */
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` (default) for destructive confirms; `primary` for neutral ones. */
  tone?: "danger" | "primary";
}

/**
 * A reusable confirm dialog built on the kit `Modal` — a typed replacement for
 * `window.confirm` that matches the admin styling and supports async confirms
 * (shows a spinner, then closes). Use for delete / bulk-delete / irreversible
 * actions.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
}: ConfirmDialogProps) {
  const [busy, setBusy] = React.useState(false);

  async function handleConfirm() {
    try {
      setBusy(true);
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title={title} size="sm">
      {description && (
        <div className="text-sm leading-relaxed text-admin-text-subdued">{description}</div>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={busy}>
          {cancelLabel}
        </Button>
        <Button variant={tone} onClick={handleConfirm} disabled={busy} className="gap-1.5">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
