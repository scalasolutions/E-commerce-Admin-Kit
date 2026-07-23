import { Badge } from "@/components/ui/badge";

type Tint = "success" | "warning" | "info" | "danger" | "neutral";

interface AdminStatusBadgeProps {
  status: string;
  /** Optionally disambiguate labels that read differently per context. */
  context?: "order" | "payment";
}

// Map raw status strings → colored tint.
const STATUS_TINT: Record<string, Tint> = {
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
const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  completed: "Completed",
  active: "Active",
  delivered: "Delivered",
  success: "Success",
  settled: "Settled",
  pending: "Pending",
  pending_payment: "Pending Payment",
  processing: "Processing",
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

function humanize(status: string) {
  return status
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminStatusBadge({ status, context }: AdminStatusBadgeProps) {
  const key = status?.toLowerCase() ?? "unknown";
  const tint = STATUS_TINT[key] ?? "neutral";

  let label = STATUS_LABEL[key] ?? humanize(status || "Unknown");
  // "pending" reads clearer as "Pending Payment" in a payment context.
  if (context === "payment" && key === "pending") label = "Pending Payment";

  return (
    <Badge variant={tint} className="gap-1.5 pl-2">
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </Badge>
  );
}
