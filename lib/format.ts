// Helpers for showing numbers to users in Persian, and for normalizing the
// Persian/Arabic digits a user might type back to Latin for logic and storage.

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/**
 * Convert every Latin digit in the value to its Persian (Farsi) form.
 * Non-digit characters pass through untouched, so it's safe on mixed strings
 * (e.g. a name that may or may not contain digits).
 */
export function toPersianDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/** Normalize Persian and Arabic-Indic digits in a string to Latin `0-9`. */
export function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}
