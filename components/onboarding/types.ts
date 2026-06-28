import type { Gender } from "@/lib/api";

/** Jalali birth date as picked in the UI; converted to ISO only on submit. */
export type JalaliBirthDate = {
  year: string;
  month: string;
  day: string;
};

/** The full onboarding form state, owned by the orchestrator. */
export type OnboardingForm = {
  first_name: string;
  last_name: string;
  national_code: string;
  gender: Gender | null;
  birth: JalaliBirthDate;
  province_id: string | null;
  city_id: string | null;
  address: string;
  national_card_image: File | null;
  face_image: File | null;
};

/** Field name → Persian error message. Keys match the backend field names. */
export type FieldErrors = Partial<Record<string, string>>;

export const EMPTY_FORM: OnboardingForm = {
  first_name: "",
  last_name: "",
  national_code: "",
  gender: null,
  birth: { year: "", month: "", day: "" },
  province_id: null,
  city_id: null,
  address: "",
  national_card_image: null,
  face_image: null,
};
