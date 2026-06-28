// Validation for the Iranian national code (کد ملی): a 10-digit number with a
// check digit. The algorithm: weight the first 9 digits by 10…2, take the sum
// mod 11; the 10th digit must equal that remainder (when < 2) or 11 − remainder.

import { toLatinDigits } from "@/lib/format";

/**
 * Whether `input` is a valid Iranian national code. Accepts Persian/Arabic or
 * Latin digits and tolerates surrounding non-digits, normalizing first.
 */
export function isValidNationalCode(input: string): boolean {
  const code = toLatinDigits(input).replace(/\D/g, "");
  if (!/^\d{10}$/.test(code)) return false;
  // Repeated-digit codes (e.g. 1111111111) satisfy the checksum but aren't real.
  if (/^(\d)\1{9}$/.test(code)) return false;

  const digits = code.split("").map(Number);
  const checkDigit = digits[9];
  const sum = digits
    .slice(0, 9)
    .reduce((acc, digit, index) => acc + digit * (10 - index), 0);
  const remainder = sum % 11;

  return remainder < 2 ? checkDigit === remainder : checkDigit === 11 - remainder;
}
