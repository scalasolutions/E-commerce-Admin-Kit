"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParsedOption {
  value: string;
  label: React.ReactNode;
  labelText: string;
  disabled: boolean;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  /** Drop-in compatible: receives a synthetic event with `target.value`. */
  onChange?: (event: { target: { value: string } }) => void;
  /** Convenience callback with the raw value. */
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
  className?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  required?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
}

function parseOptions(children: React.ReactNode): ParsedOption[] {
  const options: ParsedOption[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    // Support <option> elements (and fragments of them).
    if (child.type === React.Fragment) {
      const props = child.props as { children?: React.ReactNode };
      options.push(...parseOptions(props.children));
      return;
    }
    const props = child.props as {
      value?: string | number;
      children?: React.ReactNode;
      disabled?: boolean;
    };
    const value = props.value != null ? String(props.value) : "";
    const label = props.children ?? value;
    options.push({
      value,
      label,
      labelText: typeof label === "string" ? label : value,
      disabled: Boolean(props.disabled),
    });
  });
  return options;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      children,
      value,
      defaultValue,
      onChange,
      onValueChange,
      disabled,
      id,
      placeholder,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const options = React.useMemo(() => parseOptions(children), [children]);

    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState<string>(
      defaultValue ?? options[0]?.value ?? ""
    );
    const currentValue = isControlled ? value : internalValue;

    const [open, setOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState<number>(-1);

    const triggerRef = React.useRef<HTMLButtonElement | null>(null);
    const listRef = React.useRef<HTMLUListElement | null>(null);
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const listboxId = React.useId();

    const selectedOption = options.find((o) => o.value === currentValue);

    const commit = React.useCallback(
      (next: string) => {
        if (!isControlled) setInternalValue(next);
        onChange?.({ target: { value: next } });
        onValueChange?.(next);
      },
      [isControlled, onChange, onValueChange]
    );

    const close = React.useCallback((returnFocus = true) => {
      setOpen(false);
      if (returnFocus) triggerRef.current?.focus();
    }, []);

    const openMenu = React.useCallback(() => {
      if (disabled) return;
      const selectedIndex = options.findIndex((o) => o.value === currentValue);
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
      setOpen(true);
    }, [disabled, options, currentValue]);

    // Click outside to close.
    React.useEffect(() => {
      if (!open) return;
      function onPointerDown(e: MouseEvent) {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", onPointerDown);
      return () => document.removeEventListener("mousedown", onPointerDown);
    }, [open]);

    // Keep active option scrolled into view.
    React.useEffect(() => {
      if (!open || activeIndex < 0) return;
      const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }, [open, activeIndex]);

    const moveActive = (dir: 1 | -1) => {
      setActiveIndex((prev) => {
        const count = options.length;
        if (count === 0) return -1;
        let next = prev;
        for (let i = 0; i < count; i++) {
          next = (next + dir + count) % count;
          if (!options[next].disabled) return next;
        }
        return prev;
      });
    };

    const selectActive = () => {
      const opt = options[activeIndex];
      if (opt && !opt.disabled) {
        commit(opt.value);
        close();
      }
    };

    const onTriggerKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
        case "ArrowUp":
          e.preventDefault();
          if (!open) openMenu();
          else moveActive(e.key === "ArrowDown" ? 1 : -1);
          break;
        case "Home":
          if (open) {
            e.preventDefault();
            setActiveIndex(options.findIndex((o) => !o.disabled));
          }
          break;
        case "End":
          if (open) {
            e.preventDefault();
            for (let i = options.length - 1; i >= 0; i--) {
              if (!options[i].disabled) {
                setActiveIndex(i);
                break;
              }
            }
          }
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (open) selectActive();
          else openMenu();
          break;
        case "Escape":
          if (open) {
            e.preventDefault();
            close();
          }
          break;
        case "Tab":
          if (open) setOpen(false);
          break;
        default:
          break;
      }
    };

    const activeId = activeIndex >= 0 ? `${listboxId}-opt-${activeIndex}` : undefined;

    return (
      <div ref={rootRef} className="relative w-full">
        <button
          ref={(node) => {
            triggerRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          type="button"
          id={id}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
          aria-activedescendant={activeId}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={() => (open ? setOpen(false) : openMenu())}
          onKeyDown={onTriggerKeyDown}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-admin-border bg-admin-surface px-3 py-2 text-sm text-admin-text shadow-admin transition-colors focus-visible:outline-none focus-visible:border-admin-accent focus-visible:ring-2 focus-visible:ring-admin-accent/30 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        >
          <span
            className={cn(
              "truncate text-left",
              !selectedOption && "text-admin-text-disabled"
            )}
          >
            {selectedOption ? selectedOption.label : placeholder ?? "Select…"}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-admin-text-subdued transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={activeId}
            className="absolute left-0 top-full z-[70] mt-1 max-h-60 w-full overflow-auto rounded-xl border border-admin-border bg-admin-surface p-1 shadow-admin-lift focus:outline-none"
          >
            {options.map((opt, i) => {
              const selected = opt.value === currentValue;
              const active = i === activeIndex;
              return (
                <li
                  key={`${opt.value}-${i}`}
                  id={`${listboxId}-opt-${i}`}
                  role="option"
                  aria-selected={selected}
                  aria-disabled={opt.disabled || undefined}
                  onMouseEnter={() => !opt.disabled && setActiveIndex(i)}
                  onClick={() => {
                    if (opt.disabled) return;
                    commit(opt.value);
                    close();
                  }}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    opt.disabled && "cursor-not-allowed opacity-50",
                    selected
                      ? "bg-admin-accent-subdued font-medium text-admin-accent"
                      : "text-admin-text",
                    active && !selected && "bg-admin-surface-subdued"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {selected && <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} />}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export default Select;
