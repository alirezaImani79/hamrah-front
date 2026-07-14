"use client";

import DatePicker, { type DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";

import { cn } from "@/lib/utils";

type Props = {
  value: DateObject | null;
  onChange: (value: DateObject | null) => void;
  id?: string;
  invalid?: boolean;
  /** Earliest selectable moment (Persian-calendar DateObject or Date). */
  minDate?: DateObject | Date;
  placeholder?: string;
};

/**
 * Jalali (Persian) date + time picker. Wraps react-multi-date-picker with the
 * Persian calendar/locale and an inline time picker, styled to match the app's
 * inputs. Renders the calendar in a portal so it escapes dialog clipping.
 */
export function DateTimePicker({
  value,
  onChange,
  id,
  invalid = false,
  minDate,
  placeholder = "تاریخ و ساعت حرکت",
}: Props) {
  return (
    <DatePicker
      id={id}
      value={value}
      onChange={(date) => onChange(date as DateObject | null)}
      calendar={persian}
      locale={persian_fa}
      minDate={minDate}
      format="YYYY/MM/DD HH:mm"
      plugins={[<TimePicker key="time" position="bottom" hideSeconds />]}
      portal
      calendarPosition="bottom-right"
      placeholder={placeholder}
      containerClassName="w-full"
      inputClass={cn(
        "h-11 w-full rounded-xl border bg-card px-3.5 text-base text-foreground outline-none transition-colors",
        "placeholder:text-muted-foreground focus-visible:border-ring",
        invalid ? "border-destructive" : "border-input",
      )}
    />
  );
}
