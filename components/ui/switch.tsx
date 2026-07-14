"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

/**
 * Boolean toggle built on Base UI. Inherits RTL from the app's DirectionProvider;
 * the thumb slides toward the inline-start edge when checked.
 */
function Switch({ className, ...props }: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors outline-none",
        "bg-input data-[checked]:bg-brand-500",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block size-5 rounded-full bg-white shadow-sm transition-transform",
          // RTL: rest near inline-start, slide toward inline-end when checked.
          "translate-x-[-2px] data-[checked]:translate-x-[-22px]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
