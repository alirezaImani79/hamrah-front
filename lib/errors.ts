// ──────────────────────────────────────────────────────────────────────────
// Central mapping from any thrown value to a user-facing Persian message.
//
// The whole UI is Persian, so error copy must be too. We only ever surface a
// message we can vouch for: a field-level validation error from the backend,
// or our own Persian copy for a recognized situation. Anything we don't
// recognize (unexpected runtime errors, odd HTTP statuses, opaque backend
// messages) falls back to a generic Persian message — never a raw/English one.
// ──────────────────────────────────────────────────────────────────────────

import { ApiError } from "@/lib/api";

/** Friendly Persian fallback for anything we don't specifically recognize. */
export const GENERIC_ERROR =
  "یه خطای غیرمنتظره پیش اومد؛ کمی بعد دوباره تلاش کن.";

/** Persian copy for well-known situations, keyed by HTTP status. */
const STATUS_MESSAGES: Record<number, string> = {
  0: "ارتباط با سرور برقرار نشد؛ اتصال اینترنتت رو بررسی کن.", // network/transport failure
  401: "نشستت منقضی شده؛ برای ادامه دوباره وارد شو.",
  403: "اجازه دسترسی به این بخش رو نداری.",
  404: "موردی که دنبالش بودی پیدا نشد.",
  408: "زمان پاسخ‌گویی تموم شد؛ دوباره تلاش کن.",
  419: "نشستت منقضی شده؛ برای ادامه دوباره وارد شو.",
  429: "تعداد تلاش‌ها زیاد شد؛ کمی صبر کن و دوباره امتحان کن.",
};

/**
 * Map any thrown value to a user-facing Persian message.
 *
 * Priority: field-level validation message (when `field` is given) → specific
 * Persian copy for a known status → generic Persian fallback.
 */
export function errorMessage(error: unknown, field?: string): string {
  if (error instanceof ApiError) {
    if (field) {
      const fieldError = error.fieldError(field);
      if (fieldError) return fieldError;
    }
    if (error.status in STATUS_MESSAGES) return STATUS_MESSAGES[error.status];
    if (error.status >= 500)
      return "مشکلی در سرور پیش اومد؛ کمی بعد دوباره تلاش کن.";
  }
  return GENERIC_ERROR;
}
