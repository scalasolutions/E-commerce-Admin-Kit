"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  /** Optional clickable label rendered next to the box. */
  label?: React.ReactNode;
  /** Convenience callback fired with the next checked value. */
  onCheckedChange?: (checked: boolean) => void;
  /** Native onChange is still supported and called alongside onCheckedChange. */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  /** Extra classes applied to the outer wrapper (when a label is present). */
  wrapperClassName?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { className, wrapperClassName, label, checked, disabled, onChange, onCheckedChange, id, ...props },
    ref
  ) => {
    const reactId = React.useId();
    const inputId = id ?? reactId;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onCheckedChange?.(e.target.checked);
    };

    const control = (
      <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
        {/* The real input overlays the box (transparent, full-size) so the box
            itself is clickable even when this Checkbox is used WITHOUT a label
            (e.g. table select-all / per-row). sr-only would leave the visible
            box inert because nothing forwards the click to the input. */}
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          {...props}
        />
        {/* Visual box — peer sibling of the input so state is CSS-driven. */}
        <span
          aria-hidden="true"
          className={cn(
            "flex h-4 w-4 items-center justify-center rounded-[5px] border bg-admin-surface transition-[background-color,border-color,box-shadow] duration-150",
            "border-admin-border",
            "peer-hover:border-admin-accent/60",
            "peer-checked:border-admin-accent peer-checked:bg-admin-accent",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-admin-accent/30",
            "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            className
          )}
        />
        {/* Checkmark — also a peer sibling so it reflects checked state in both controlled and RHF-uncontrolled use. */}
        <Check
          aria-hidden="true"
          strokeWidth={3}
          className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100"
        />
      </span>
    );

    if (label === undefined) {
      return control;
    }

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "inline-flex cursor-pointer items-center gap-2 text-sm text-admin-text select-none",
          disabled && "cursor-not-allowed opacity-60",
          wrapperClassName
        )}
      >
        {control}
        <span>{label}</span>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

/** Explicit box + label variant (alias of Checkbox with a required label). */
export function CheckboxField(props: CheckboxProps & { label: React.ReactNode }) {
  return <Checkbox {...props} />;
}

export default Checkbox;
