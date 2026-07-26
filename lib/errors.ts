// ──────────────────────────────────────────────────────────────────────────
// Central mapping from any thrown value to a user-facing Persian message.
//
// The whole UI is Persian, so error copy must be too. We localize off the
// backend's stable `code` (never the English `message`), and for
// `VALIDATION_FAILED` we synthesize Persian from a field→label map — never
// echoing the English `errors[*]` strings. Anything unrecognized falls back to
// a generic Persian message, so no English can ever reach the user.
// ──────────────────────────────────────────────────────────────────────────

import { ApiError } from "@/lib/api";

/** Friendly Persian fallback for anything we don't specifically recognize. */
export const GENERIC_ERROR =
  "یه خطای غیرمنتظره پیش اومد؛ کمی بعد دوباره تلاش کن.";

/** Generic Persian copy when a form fails validation without a specific field. */
export const VALIDATION_ERROR =
  "بعضی از اطلاعات واردشده نامعتبره؛ موارد مشخص‌شده رو بررسی کن.";

/**
 * Stable error codes returned by the backend (see `ApiError.code` in the spec).
 * Used to resolve a localized message — never shown to the user raw.
 */
export type ErrorCode =
  | "VALIDATION_FAILED"
  | "UNAUTHENTICATED"
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "ENDPOINT_NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "TOO_MANY_REQUESTS"
  | "SERVER_ERROR"
  | "OTP_INVALID"
  | "OTP_REQUEST_THROTTLED"
  | "IDENTITY_VERIFICATION_IN_PROGRESS"
  | "IDENTITY_ALREADY_VERIFIED"
  | "TRIP_FULL"
  | "TRIP_ALREADY_JOINED";

/**
 * Persian copy for well-known codes. (`VALIDATION_FAILED` is handled separately
 * — it needs field context; see `errorMessage`/`fieldErrors`.)
 * `ENDPOINT_NOT_FOUND` / `METHOD_NOT_ALLOWED` deliberately absent → generic.
 */
const CODE_MESSAGES: Partial<Record<ErrorCode, string>> = {
  OTP_INVALID: "کد تأیید اشتباهه یا منقضی شده؛ یه کد جدید درخواست بده.",
  OTP_REQUEST_THROTTLED:
    "درخواست کد خیلی زود تکرار شد؛ کمی صبر کن و دوباره امتحان کن.",
  IDENTITY_VERIFICATION_IN_PROGRESS:
    "هویتت هنوز در حال بررسیه؛ فعلاً نمی‌تونی دوباره ثبت کنی.",
  IDENTITY_ALREADY_VERIFIED: "هویتت قبلاً تأیید شده.",
  TRIP_FULL: "ظرفیت این سفر پر شده.",
  TRIP_ALREADY_JOINED: "تو قبلاً هم‌سفر این سفر شدی.",
  UNAUTHENTICATED: "نشستت منقضی شده؛ برای ادامه دوباره وارد شو.",
  UNAUTHORIZED: "اجازه انجام این کار رو نداری.",
  TOO_MANY_REQUESTS: "تعداد درخواست‌ها زیاد شد؛ کمی صبر کن و دوباره امتحان کن.",
  SERVER_ERROR: "مشکلی توی سرور پیش اومد؛ کمی بعد دوباره تلاش کن.",
  NOT_FOUND: "موردی که دنبالش بودی پیدا نشد.",
};

/** Persian status-based copy for codes we don't have (or transport failures). */
const STATUS_MESSAGES: Record<number, string> = {
  0: "ارتباط با سرور برقرار نشد؛ اتصال اینترنتت رو بررسی کن.", // network/transport failure
  401: "نشستت منقضی شده؛ برای ادامه دوباره وارد شو.",
  403: "اجازه دسترسی به این بخش رو نداری.",
  404: "موردی که دنبالش بودی پیدا نشد.",
  408: "زمان پاسخ‌گویی تموم شد؛ دوباره تلاش کن.",
  419: "نشستت منقضی شده؛ برای ادامه دوباره وارد شو.",
  429: "تعداد تلاش‌ها زیاد شد؛ کمی صبر کن و دوباره امتحان کن.",
};

/** Persian labels for backend validation fields, used to phrase `VALIDATION_FAILED`. */
const FIELD_LABELS: Record<string, string> = {
  phone_number: "شماره موبایل",
  code: "کد تأیید",
  first_name: "نام",
  last_name: "نام خانوادگی",
  national_code: "کد ملی",
  birth_date: "تاریخ تولد",
  gender: "جنسیت",
  province_id: "استان",
  city_id: "شهر",
  address: "نشانی",
  national_card_image: "تصویر کارت ملی",
  face_image: "تصویر سلفی",
  number: "شماره پلاک",
  name: "نام",
  model: "مدل",
  color: "رنگ",
  seats: "تعداد سرنشین",
  empty_seats: "تعداد صندلی خالی",
  requested_seats: "تعداد صندلی",
  vehicle_id: "خودرو",
  departure_at: "زمان حرکت",
  origin_lat: "مبدأ و مقصد",
  origin_lng: "مبدأ و مقصد",
  destination_lat: "مبدأ و مقصد",
  destination_lng: "مبدأ و مقصد",
};

/** A Persian "fix this field" message for a backend field name. */
function fieldLabelMessage(field: string): string {
  return `${FIELD_LABELS[field] ?? "این مورد"} رو درست وارد کن.`;
}

/** True when the error is a 422 validation failure (by code or, as a fallback, status). */
function isValidationError(error: ApiError): boolean {
  return (
    error.code === "VALIDATION_FAILED" ||
    (error.code === null && error.status === 422)
  );
}

/**
 * Map any thrown value to a user-facing Persian message.
 *
 * Priority: known `code` (except `VALIDATION_FAILED`) → field-aware validation
 * copy → status-specific Persian copy → 5xx Persian copy → generic fallback.
 */
export function errorMessage(error: unknown, field?: string): string {
  if (error instanceof ApiError) {
    const code = error.code as ErrorCode | null;

    // A specific code (other than VALIDATION_FAILED) wins outright.
    if (code && code !== "VALIDATION_FAILED" && code in CODE_MESSAGES) {
      return CODE_MESSAGES[code]!;
    }

    // Validation failure → phrase it around the offending field if known.
    if (isValidationError(error)) {
      if (field) return fieldLabelMessage(field);
      return VALIDATION_ERROR;
    }

    if (error.status in STATUS_MESSAGES) return STATUS_MESSAGES[error.status];
    if (error.status >= 500)
      return "مشکلی در سرور پیش اومد؛ کمی بعد دوباره تلاش کن.";
  }
  return GENERIC_ERROR;
}

/**
 * Per-field Persian messages for a `VALIDATION_FAILED` ApiError — one entry per
 * flagged field, keyed by the backend field name. `{}` for anything else.
 *
 * Use this (not the English `error.errors[*]`) when rendering field-level errors.
 */
export function fieldErrors(error: unknown): Record<string, string> {
  if (!(error instanceof ApiError) || !isValidationError(error) || !error.errors) {
    return {};
  }
  const result: Record<string, string> = {};
  for (const field of Object.keys(error.errors)) {
    result[field] = fieldLabelMessage(field);
  }
  return result;
}
