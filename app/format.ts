/**
 * Showcase-local currency + date formatting (IDR / id-ID).
 *
 * The KIT ships brand-neutral: admin-kit/lib/utils.ts defaults to en-US / USD /
 * UTC, and LOCALE / CURRENCY / TIMEZONE there are the documented per-client knob.
 * This demo plays the role of an Indonesian store, so it formats in Rupiah here
 * rather than changing the kit's shipped default — a real consumer would just
 * set those three constants. Import these in demo/gallery pages instead of the
 * kit's formatPrice/formatDate; keep `cn` coming from @/lib/utils.
 */

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "-";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

export function formatDateOnly(dateString: string): string {
  if (!dateString) return "-";
  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeZone: "Asia/Jakarta",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}
