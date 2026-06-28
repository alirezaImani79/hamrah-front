"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { toLatinDigits, toPersianDigits } from "@/lib/format";
import { Input } from "@/components/ui/input";
import { Select, type SelectOption } from "@/components/ui/select";

// Letters that appear on standard Iranian civilian plates.
const PLATE_LETTERS = [
  "الف",
  "ب",
  "پ",
  "ت",
  "ث",
  "ج",
  "د",
  "ز",
  "ژ",
  "س",
  "ش",
  "ص",
  "ط",
  "ع",
  "ف",
  "ق",
  "ک",
  "گ",
  "ل",
  "م",
  "ن",
  "و",
  "ه",
  "ی",
  "D", // دیپلمات
  "S", // سیاسی
];

const LETTER_OPTIONS: SelectOption[] = PLATE_LETTERS.map((l) => ({
  value: l,
  label: l,
}));

type PlateParts = {
  /** Two-digit series prefix. */
  left: string;
  /** The plate letter. */
  letter: string;
  /** Three-digit middle number. */
  mid: string;
  /** Two-digit province / Iran code. */
  right: string;
};

const EMPTY_PARTS: PlateParts = { left: "", letter: "", mid: "", right: "" };

/** Compose the four segments into the API string, e.g. "12 ج 345 67". */
export function composePlate(parts: PlateParts): string {
  return [parts.left, parts.letter, parts.mid, parts.right].join(" ");
}

/** Split an API plate string back into its four segments. */
function parsePlate(value: string): PlateParts {
  const tokens = value.trim().split(/\s+/);
  if (value.trim() === "") return EMPTY_PARTS;
  return {
    left: tokens[0] ?? "",
    letter: tokens[1] ?? "",
    mid: tokens[2] ?? "",
    right: tokens[3] ?? "",
  };
}

/** A plate is complete when both numbers have full length and a letter is set. */
export function isPlateComplete(value: string): boolean {
  const p = parsePlate(value);
  return (
    /^\d{2}$/.test(p.left) &&
    p.letter.length > 0 &&
    /^\d{3}$/.test(p.mid) &&
    /^\d{2}$/.test(p.right)
  );
}

type Props = {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  id?: string;
};

/**
 * Structured Iranian license-plate input: two-digit series, a letter, a
 * three-digit number, and the two-digit Iran code — laid out left-to-right like
 * a real plate. Emits the joined string the backend expects.
 */
export function PlateInput({ value, onChange, invalid, id }: Props) {
  const [parts, setParts] = useState<PlateParts>(() => parsePlate(value));

  // Re-seed from the prop when it changes externally (dialog open / edit mode),
  // but skip the echo of our own emitted value to keep typing smooth.
  useEffect(() => {
    if (value !== composePlate(parts)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setParts(parsePlate(value));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function update(patch: Partial<PlateParts>) {
    const next = { ...parts, ...patch };
    setParts(next);
    onChange(composePlate(next));
  }

  const digits = (raw: string, max: number) =>
    toLatinDigits(raw).replace(/\D/g, "").slice(0, max);

  return (
    <div
      dir="ltr"
      id={id}
      className={cn(
        "flex w-full items-stretch gap-1.5 rounded-xl border border-input bg-card p-1.5",
        invalid && "border-destructive ring-3 ring-destructive/20",
      )}
    >
      <Input
        aria-label="دو رقم سمت چپ پلاک"
        inputMode="numeric"
        value={toPersianDigits(parts.left)}
        onChange={(e) => update({ left: digits(e.target.value, 2) })}
        placeholder="۱۲"
        className="h-9 flex-[2] rounded-lg border-transparent bg-transparent text-center text-base tracking-widest"
      />
      <div className="flex-[2]">
        <Select
          aria-label="حرف پلاک"
          value={parts.letter || null}
          onValueChange={(letter) => update({ letter })}
          items={LETTER_OPTIONS}
          placeholder="حرف"
          className="h-9 rounded-lg border-transparent bg-transparent px-2"
        />
      </div>
      <Input
        aria-label="سه رقم میانی پلاک"
        inputMode="numeric"
        value={toPersianDigits(parts.mid)}
        onChange={(e) => update({ mid: digits(e.target.value, 3) })}
        placeholder="۳۴۵"
        className="h-9 flex-[3] rounded-lg border-transparent bg-transparent text-center text-base tracking-widest"
      />
      <div className="flex flex-[2] flex-col items-center justify-center rounded-lg bg-accent-300/15 px-1">
        <span className="text-[0.6rem] font-bold leading-none text-accent-700">
          ایران
        </span>
        <Input
          aria-label="کد دو رقمی ایران"
          inputMode="numeric"
          value={toPersianDigits(parts.right)}
          onChange={(e) => update({ right: digits(e.target.value, 2) })}
          placeholder="۶۷"
          className="h-6 w-full rounded-md border-transparent bg-transparent px-0 text-center text-base tracking-widest"
        />
      </div>
    </div>
  );
}

/**
 * Read-only plate rendering for lists. Each segment is its own element so the
 * Persian letter never reorders against the Latin digits via the bidi
 * algorithm — the visual order stays exactly as on a real plate.
 */
export function PlateDisplay({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const parts = parsePlate(value);
  return (
    <span
      dir="ltr"
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-md border border-border bg-card text-sm font-semibold text-foreground",
        className,
      )}
    >
      <span className="px-1.5 py-1 tabular-nums">
        {toPersianDigits(parts.left)}
      </span>
      <span className="border-x border-border px-1.5 py-1">{parts.letter}</span>
      <span className="px-1.5 py-1 tabular-nums">
        {toPersianDigits(parts.mid)}
      </span>
      <span className="flex flex-col items-center justify-center bg-accent-300/15 px-1.5 py-0.5 text-accent-700">
        <span className="text-[0.55rem] font-bold leading-none">ایران</span>
        <span className="text-xs leading-tight tabular-nums">
          {toPersianDigits(parts.right)}
        </span>
      </span>
    </span>
  );
}
