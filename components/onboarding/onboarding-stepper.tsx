import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/format";

type OnboardingStepperProps = {
  steps: string[];
  current: number;
};

/** Numbered progress header: done steps get a check, the current one is filled. */
export function OnboardingStepper({ steps, current }: OnboardingStepperProps) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((title, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={title} className="flex flex-1 items-center gap-2">
            <div className="flex min-w-0 flex-col items-center gap-1.5 text-center">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                  done && "border-brand-500 bg-brand-500 text-white",
                  active && "border-brand-500 bg-brand-50 text-brand-700",
                  !done && !active && "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : toPersianDigits(index + 1)}
              </span>
              <span
                className={cn(
                  "max-w-20 truncate text-xs",
                  active ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {title}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span
                className={cn(
                  "mb-5 h-px flex-1 transition-colors",
                  index < current ? "bg-brand-400" : "bg-border",
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
