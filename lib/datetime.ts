// Jalali (Persian) date/time helpers built on react-date-object — the same
// DateObject the picker emits. Trips are shown to users on the Persian calendar
// but stored/sent to the backend as Gregorian "YYYY-MM-DD HH:mm:ss".

import DateObject from "react-date-object";
import gregorian from "react-date-object/calendars/gregorian";
import gregorian_en from "react-date-object/locales/gregorian_en";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const BACKEND_FORMAT = "YYYY-MM-DD HH:mm:ss";

/** Convert a picker DateObject to the Gregorian datetime string the API wants. */
export function toBackendDateTime(date: DateObject): string {
  return date.convert(gregorian, gregorian_en).format(BACKEND_FORMAT);
}

/** Parse a backend Gregorian datetime string into a Persian-calendar DateObject. */
export function fromBackendDateTime(value: string): DateObject {
  return new DateObject({
    date: value,
    format: BACKEND_FORMAT,
    calendar: gregorian,
    locale: gregorian_en,
  }).convert(persian, persian_fa);
}

/**
 * Format a backend Gregorian datetime string for display, e.g.
 * "۱۰ تیر ۱۴۰۵، ساعت ۰۸:۳۰" (Persian digits, Jalali calendar).
 */
export function formatJalaliDateTime(value: string): string {
  return fromBackendDateTime(value).format("D MMMM YYYY، ساعت HH:mm");
}

/** True when the backend datetime string is strictly in the future. */
export function isFuture(value: string): boolean {
  const ms = new DateObject({
    date: value,
    format: BACKEND_FORMAT,
    calendar: gregorian,
    locale: gregorian_en,
  }).toDate().getTime();
  return ms > Date.now();
}
