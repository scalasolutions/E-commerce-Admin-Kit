import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional + conflicting Tailwind classes. Used by every kit component. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ *
 * Per-client knobs. These three constants are the only things you
 * normally change when standing the kit up for a new client.
 * ------------------------------------------------------------------ */

/** BCP-47 locale used for every number/date format below. */
export const LOCALE = "en-US";
/** ISO 4217 currency for `formatPrice`. */
export const CURRENCY = "USD";
/** IANA timezone the admin's "calendar day" is anchored to (see day helpers). */
export const TIMEZONE = "UTC";

/**
 * Currencies with no minor unit (IDR, JPY, KRW, VND…) should never render
 * decimals. Everything else keeps the locale default.
 */
const ZERO_DECIMAL_CURRENCIES = new Set(["IDR", "JPY", "KRW", "VND", "CLP", "ISK"]);

export function formatPrice(amount: number): string {
  const zeroDecimal = ZERO_DECIMAL_CURRENCIES.has(CURRENCY);
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: CURRENCY,
    ...(zeroDecimal ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}),
  }).format(amount);
}

/**
 * Groups an amount with locale thousands separators, WITHOUT the currency
 * symbol — for the display value of an editable money input (e.g. 100000 →
 * "100,000"). Non-digits are stripped, so it's safe to pass a partially-typed
 * string. Pair with `parseThousands` to read the value back.
 */
export function formatThousands(value: number | string): string {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString(LOCALE) : "";
}

/** Inverse of `formatThousands`: "100,000" → 100000. Empty → 0. */
export function parseThousands(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

export function formatDate(dateString: string): string {
  if (!dateString) return "-";
  try {
    return new Intl.DateTimeFormat(LOCALE, {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: TIMEZONE,
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

/** Date only, no clock — for table columns where the time is noise. */
export function formatDateOnly(dateString: string): string {
  if (!dateString) return "-";
  try {
    return new Intl.DateTimeFormat(LOCALE, {
      dateStyle: "medium",
      timeZone: TIMEZONE,
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

/* ------------------------------------------------------------------ *
 * Calendar-day ↔ timestamp helpers.
 *
 * Validity windows (vouchers, campaigns, discounts) are picked as calendar
 * days in an <input type="date"> (YYYY-MM-DD) but stored as absolute
 * timestamps and compared against NOW(). `new Date("YYYY-MM-DD")` parses as
 * UTC midnight, so a day picked in a non-UTC zone ends up shifted — a voucher
 * "expiring on the 19th" can die hours early. Anchor each end of the picked
 * day to `TIMEZONE` instead, so the result is deterministic regardless of the
 * admin's own browser timezone.
 * ------------------------------------------------------------------ */

/** Minutes `TIMEZONE` is offset from UTC on the given day (handles DST). */
function tzOffsetMinutes(dateInput: string): number {
  // Format a probe instant in both UTC and TIMEZONE, then diff the two.
  const probe = new Date(`${dateInput}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(probe);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const asUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour") % 24,
    get("minute"),
    get("second")
  );
  return (asUTC - probe.getTime()) / 60000;
}

function dayBoundaryISO(dateInput: string, clock: string): string {
  const offset = tzOffsetMinutes(dateInput);
  const sign = offset < 0 ? "-" : "+";
  const abs = Math.abs(offset);
  const hh = String(Math.floor(abs / 60)).padStart(2, "0");
  const mm = String(abs % 60).padStart(2, "0");
  return new Date(`${dateInput}T${clock}${sign}${hh}:${mm}`).toISOString();
}

/** A picked day (YYYY-MM-DD) → the instant it begins in `TIMEZONE`, as ISO. */
export function dayStartISO(dateInput: string): string {
  return dayBoundaryISO(dateInput, "00:00:00");
}

/** A picked day (YYYY-MM-DD) → the instant it ends in `TIMEZONE`, as ISO. */
export function dayEndISO(dateInput: string): string {
  return dayBoundaryISO(dateInput, "23:59:59");
}

/**
 * An absolute timestamp → the `TIMEZONE` calendar day (YYYY-MM-DD) for a date
 * input. Round-trips values written by `dayStartISO` / `dayEndISO`.
 */
export function isoToDateInput(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date(iso));
}
