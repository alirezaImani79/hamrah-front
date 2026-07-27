"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { toLatinDigits, toPersianDigits } from "@/lib/format";

type InputOTPProps = {
  value: string;
  onChange: (value: string) => void;
  /** Called once the code reaches `length` digits (e.g. to auto-submit). */
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  invalid?: boolean;
  "aria-label"?: string;
};

/**
 * Segmented one-time-code input. The logical value is a Latin-digit string;
 * each box *displays* Persian digits. Accepts pasted/typed Persian, Arabic,
 * or Latin digits. Always laid out left-to-right (codes read LTR) even on the
 * RTL page. Entry stays sequential so the value never has gaps.
 */
export function InputOTP({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  autoFocus = false,
  invalid = false,
  "aria-label": ariaLabel,
}: InputOTPProps) {
  const inputs = React.useRef<Array<HTMLInputElement | null>>([]);
  // Mirror of `value` that stays fresh within a synchronous change→focus cycle.
  // When `handleChange` moves focus to the next box, the browser fires `onFocus`
  // synchronously — before React re-renders — so the `value` closure in the
  // focus handler is one render stale (still the pre-keystroke value). Without
  // the ref, `handleFocus` would see the freshly-typed box as a gap and bounce
  // focus back to the previous box, so the next keystroke overwrites it.
  const valueRef = React.useRef(value);
  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  function focusAt(index: number) {
    const clamped = Math.max(0, Math.min(index, length - 1));
    const el = inputs.current[clamped];
    if (el) {
      el.focus();
      el.select();
    }
  }

  function commit(next: string) {
    const trimmed = next.slice(0, length);
    const justCompleted = trimmed.length === length && value.length < length;
    // Sync the ref BEFORE onChange/focus so the synchronous focus event kicked
    // off by a later `focusAt` sees the new value, not the pre-keystroke one.
    valueRef.current = trimmed;
    onChange(trimmed);
    if (justCompleted) onComplete?.(trimmed);
    return trimmed;
  }

  function handleChange(index: number, raw: string) {
    const digits = toLatinDigits(raw).replace(/\D/g, "");
    if (!digits) return;
    // Distribute incoming digits starting at `index`. A single keystroke writes
    // one digit; a browser OTP autofill (autocomplete="one-time-code") dumps the
    // whole code into the first box in one go, so write every digit we received.
    const next = value.split("");
    for (let i = 0; i < digits.length && index + i < length; i++) {
      next[index + i] = digits[i];
    }
    commit(next.join(""));
    focusAt(Math.min(index + digits.length, length - 1));
  }

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (value[index]) {
        commit(value.slice(0, index) + value.slice(index + 1));
        focusAt(index);
      } else if (index > 0) {
        commit(value.slice(0, index - 1) + value.slice(index));
        focusAt(index - 1);
      }
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index + 1);
    }
  }

  function handleFocus(
    index: number,
    event: React.FocusEvent<HTMLInputElement>,
  ) {
    // Keep entry sequential — jump to the first empty box, no gaps. Read the
    // ref (not the closure) so this stays correct even when focus landed here
    // programmatically during `handleChange`, before the next render commits.
    const current = valueRef.current;
    if (index > current.length) focusAt(current.length);
    else event.currentTarget.select();
  }

  function handlePaste(event: React.ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = toLatinDigits(event.clipboardData.getData("text")).replace(
      /\D/g,
      "",
    );
    if (!pasted) return;
    const committed = commit(pasted);
    focusAt(committed.length);
  }

  return (
    <div
      dir="ltr"
      role="group"
      aria-label={ariaLabel}
      className="flex items-center justify-center gap-2"
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && index === 0}
          // Allow the full code so the browser can drop an autofilled / Web-OTP
          // code into the first box without `maxlength` truncating it to one
          // digit. Display stays one-char-per-box via the controlled `value`.
          maxLength={length}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          disabled={disabled}
          aria-invalid={invalid}
          value={value[index] ? toPersianDigits(value[index]) : ""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => handleFocus(index, e)}
          onPaste={handlePaste}
          className={cn(
            "size-12 rounded-xl border border-input bg-card text-center text-lg font-semibold text-foreground transition-colors outline-none",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "disabled:pointer-events-none disabled:opacity-50",
            invalid &&
              "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
          )}
        />
      ))}
    </div>
  );
}
