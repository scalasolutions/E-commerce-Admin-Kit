/**
 * Shared status vocabulary for the admin UI: maps raw status strings to a
 * colored tint and a human-readable label. Used by both the read-only
 * `AdminStatusBadge` and the editable `AdminInlineStatusSelect` so a status
 * always looks the same wherever it appears.
 */

export type StatusTint = "success" | "warning" | "info" | "danger" | "neutral";

// Map raw status strings → colored tint.
export const STATUS_TINT: Record<string, StatusTint> = {
  // success (green)
  paid: "success",
  completed: "success",
  active: "success",
  delivered: "success",
  success: "success",
  settled: "success",
  // warning (amber)
  pending: "warning",
  pending_payment: "warning",
  processing: "warning",
  unpaid: "warning",
  awaiting_payment: "warning",
  on_hold: "warning",
  // info (blue)
  shipped: "info",
  ready_to_ship: "info",
  refunded: "info",
  partially_refunded: "info",
  in_transit: "info",
  // critical (red)
  cancelled: "danger",
  failed: "danger",
  expired: "danger",
  rejected: "danger",
  void: "danger",
  // neutral (gray)
  draft: "neutral",
  inactive: "neutral",
  unknown: "neutral",
};

// Human-readable labels.
export const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  completed: "Completed",
  active: "Active",
  delivered: "Delivered",
  success: "Success",
  settled: "Settled",
  pending: "Pending",
  pending_payment: "Pending Payment",
  processing: "Pick & Pack",
  unpaid: "Unpaid",
  awaiting_payment: "Awaiting Payment",
  on_hold: "On Hold",
  shipped: "Shipped",
  ready_to_ship: "Ready to Ship",
  refunded: "Refunded",
  partially_refunded: "Partially Refunded",
  in_transit: "In Transit",
  cancelled: "Cancelled",
  failed: "Failed",
  expired: "Expired",
  rejected: "Rejected",
  void: "Void",
  draft: "Draft",
  inactive: "Inactive",
  unknown: "Unknown",
};

/** Tailwind classes (background + text) for each tint — badge/pill styling. */
export const TINT_CLASSES: Record<StatusTint, string> = {
  success: "bg-admin-success-bg text-admin-success-text",
  warning: "bg-admin-warning-bg text-admin-warning-text",
  info: "bg-admin-info-bg text-admin-info-text",
  danger: "bg-admin-critical-bg text-admin-critical-text",
  neutral: "bg-admin-neutral-bg text-admin-neutral-text",
};

export function humanizeStatus(status: string): string {
  return status.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function statusTint(status: string): StatusTint {
  return STATUS_TINT[status?.toLowerCase() ?? "unknown"] ?? "neutral";
}

export function statusLabel(status: string): string {
  const key = status?.toLowerCase() ?? "unknown";
  return STATUS_LABEL[key] ?? humanizeStatus(status || "Unknown");
}
