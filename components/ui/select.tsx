"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
};

type SelectProps = {
  value: string | null;
  onValueChange: (value: string) => void;
  items: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  "aria-label"?: string;
  className?: string;
};

/**
 * Single-select dropdown built on Base UI. Values are strings; `items` carries
 * the labels, so the trigger shows the selected option's label automatically.
 * Inherits RTL from the app's DirectionProvider.
 */
export function Select({
  value,
  onValueChange,
  items,
  placeholder = "انتخاب کن",
  disabled = false,
  invalid = false,
  id,
  "aria-label": ariaLabel,
  className,
}: SelectProps) {
  return (
    <SelectPrimitive.Root
      items={items}
      value={value}
      onValueChange={(next) => onValueChange(next as string)}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        id={id}
        aria-label={ariaLabel}
        aria-invalid={invalid}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-input bg-card px-3.5 text-base text-foreground transition-colors outline-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "data-[popup-open]:border-ring",
          "disabled:pointer-events-none disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          {(val) =>
            val == null || val === "" ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              items.find((item) => item.value === val)?.label
            )
          }
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon className="text-muted-foreground">
          <ChevronDown className="size-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          sideOffset={6}
          alignItemWithTrigger={false}
          className="z-50 outline-none"
        >
          <SelectPrimitive.Popup
            className={cn(
              "max-h-[min(20rem,var(--available-height))] w-[var(--anchor-width)] overflow-y-auto overscroll-contain rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-foreground/5",
              "origin-[var(--transform-origin)] transition-[transform,opacity] data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
            )}
          >
            {items.map((item) => (
              <SelectPrimitive.Item
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                className={cn(
                  "flex cursor-default items-center justify-between gap-2 rounded-lg px-3 py-2 text-base outline-none select-none",
                  "data-[highlighted]:bg-brand-50 data-[highlighted]:text-brand-800",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                )}
              >
                <SelectPrimitive.ItemText>
                  {item.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="text-brand-600">
                  <Check className="size-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
