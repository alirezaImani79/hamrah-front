import { ApiError } from "@/lib/api";
import { toLatinDigits } from "@/lib/format";
import { jalaliMonthLength } from "@/lib/jalali";
import { isValidNationalCode } from "@/lib/national-id";
import type { FieldErrors, OnboardingForm } from "./types";

/** Validate step 1 (basic info). */
export function validateBasic(form: OnboardingForm): FieldErrors {
  const errors: FieldErrors = {};

  if (!form.first_name.trim()) errors.first_name = "نامت رو وارد کن.";
  if (!form.last_name.trim()) errors.last_name = "نام خانوادگیت رو وارد کن.";

  const code = toLatinDigits(form.national_code).replace(/\D/g, "");
  if (!code) errors.national_code = "کد ملیت رو وارد کن.";
  else if (!isValidNationalCode(code)) errors.national_code = "کد ملی معتبر نیست.";

  if (!form.gender) errors.gender = "جنسیتت رو انتخاب کن.";

  const { year, month, day } = form.birth;
  if (!year || !month || !day) {
    errors.birth_date = "تاریخ تولدت رو کامل انتخاب کن.";
  } else if (Number(day) > jalaliMonthLength(Number(year), Number(month))) {
    errors.birth_date = "روز انتخاب‌شده برای این ماه معتبر نیست.";
  }

  return errors;
}

/** Validate step 2 (address). */
export function validateAddress(form: OnboardingForm): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.province_id) errors.province_id = "استانت رو انتخاب کن.";
  if (!form.city_id) errors.city_id = "شهرت رو انتخاب کن.";
  if (form.address.trim().length < 10) {
    errors.address = "نشانی رو کامل‌تر بنویس (دست‌کم ۱۰ نویسه).";
  }
  return errors;
}

/** Validate step 3 (documents). */
export function validateDocuments(form: OnboardingForm): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.national_card_image) {
    errors.national_card_image = "تصویر کارت ملی رو بارگذاری کن.";
  }
  if (!form.face_image) errors.face_image = "تصویر سلفی‌ات رو بارگذاری کن.";
  return errors;
}

/** Which step (0-based) a given field belongs to — used to jump to backend errors. */
const FIELD_STEP: Record<string, number> = {
  first_name: 0,
  last_name: 0,
  national_code: 0,
  birth_date: 0,
  gender: 0,
  province_id: 1,
  city_id: 1,
  address: 1,
  national_card_image: 2,
  face_image: 2,
};

/** Map a backend 422 `ApiError` to our field-error map (first message per field). */
export function mapApiErrors(error: ApiError): FieldErrors {
  const result: FieldErrors = {};
  if (!error.errors) return result;
  for (const [field, messages] of Object.entries(error.errors)) {
    if (messages?.[0]) result[field] = messages[0];
  }
  return result;
}

/** The earliest step that has an error, so we can send the user back to fix it. */
export function firstStepWithError(errors: FieldErrors): number | null {
  let step: number | null = null;
  for (const field of Object.keys(errors)) {
    const fieldStep = FIELD_STEP[field];
    if (fieldStep === undefined) continue;
    if (step === null || fieldStep < step) step = fieldStep;
  }
  return step;
}
