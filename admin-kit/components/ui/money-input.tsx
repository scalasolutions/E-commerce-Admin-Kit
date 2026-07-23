"use client";

import * as React from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { formatThousands, parseThousands } from "@/lib/utils";

export interface MoneyInputProps
  extends Omit<InputProps, "value" | "onChange" | "type"> {
  /** The numeric amount. Strings are accepted (form state is often a string). */
  value: number | string | null | undefined;
  /** Called with the parsed number (or null when cleared and `allowEmpty`). */
  onValueChange: (value: number | null) => void;
  /**
   * When false, renders a plain number input with no grouping — use for fields
   * that are only *sometimes* rupiah (a discount value that's a % otherwise),
   * where grouping would also wrongly strip a decimal point.
   */
  group?: boolean;
  /** Emit null instead of 0 when the field is cleared (for optional amounts). */
  allowEmpty?: boolean;
}

/**
 * A rupiah amount input that displays thousands-separated (100000 → "100.000")
 * while handing the caller a plain number. Grouped mode is a text input with
 * `inputMode="numeric"`; typing at the end reformats live. Cursor position on
 * mid-string edits isn't preserved — acceptable for whole-amount entry.
 */
export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onValueChange, group = true, allowEmpty = false, ...props }, ref) => {
    const emptyValue = () => (allowEmpty ? null : 0);

    if (!group) {
      return (
        <Input
          {...props}
          ref={ref}
          type="number"
          value={value ?? ""}
          onChange={(e) => {
            const raw = e.target.value;
            onValueChange(raw === "" ? emptyValue() : Number(raw));
          }}
        />
      );
    }

    const display =
      value === null || value === undefined || value === ""
        ? ""
        : formatThousands(value);

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          onValueChange(digits === "" ? emptyValue() : parseThousands(digits));
        }}
      />
    );
  }
);
MoneyInput.displayName = "MoneyInput";
