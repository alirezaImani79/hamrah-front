"use client";

import * as React from "react";

import { toPersianDigits } from "@/lib/format";
import {
  JALALI_MONTHS,
  currentJalaliYear,
  jalaliMonthLength,
} from "@/lib/jalali";
import { Select, type SelectOption } from "@/components/ui/select";
import type { JalaliBirthDate } from "./types";

type JalaliDateFieldProps = {
  value: JalaliBirthDate;
  onChange: (value: JalaliBirthDate) => void;
  invalid?: boolean;
};

const MONTH_OPTIONS: SelectOption[] = JALALI_MONTHS.map((name, index) => ({
  value: String(index + 1),
  label: name,
}));

/** Year/month/day Jalali pickers. Years span ~100 back from the current year. */
export function JalaliDateField({
  value,
  onChange,
  invalid = false,
}: JalaliDateFieldProps) {
  const yearOptions = React.useMemo<SelectOption[]>(() => {
    const latest = currentJalaliYear();
    const options: SelectOption[] = [];
    for (let year = latest; year >= latest - 100; year -= 1) {
      options.push({ value: String(year), label: toPersianDigits(year) });
    }
    return options;
  }, []);

  const dayOptions = React.useMemo<SelectOption[]>(() => {
    const length =
      value.year && value.month
        ? jalaliMonthLength(Number(value.year), Number(value.month))
        : 31;
    return Array.from({ length }, (_, index) => ({
      value: String(index + 1),
      label: toPersianDigits(index + 1),
    }));
  }, [value.year, value.month]);

  /** Drop an out-of-range day when the month/year shortens (e.g. 31 → Esfand). */
  function clampDay(next: JalaliBirthDate): JalaliBirthDate {
    if (!next.year || !next.month || !next.day) return next;
    const max = jalaliMonthLength(Number(next.year), Number(next.month));
    return Number(next.day) > max ? { ...next, day: "" } : next;
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select
        items={yearOptions}
        value={value.year || null}
        onValueChange={(year) => onChange(clampDay({ ...value, year }))}
        placeholder="سال"
        aria-label="سال تولد"
        invalid={invalid}
      />
      <Select
        items={MONTH_OPTIONS}
        value={value.month || null}
        onValueChange={(month) => onChange(clampDay({ ...value, month }))}
        placeholder="ماه"
        aria-label="ماه تولد"
        invalid={invalid}
      />
      <Select
        items={dayOptions}
        value={value.day || null}
        onValueChange={(day) => onChange({ ...value, day })}
        placeholder="روز"
        aria-label="روز تولد"
        invalid={invalid}
      />
    </div>
  );
}
