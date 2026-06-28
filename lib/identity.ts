// Identity verification: submitting the onboarding profile + documents, and the
// small predicate the app uses to decide whether a user still needs onboarding.

import { apiFetch, type Gender, type User } from "@/lib/api";

/** Text fields of the identity submission (everything except the two images). */
export type IdentityProfile = {
  first_name: string;
  last_name: string;
  national_code: string;
  birth_date: string; // Gregorian ISO, YYYY-MM-DD
  gender: Gender;
  province_id: number;
  city_id: number;
  address: string;
};

/** The two required document images. */
export type IdentityDocuments = {
  national_card_image: File;
  face_image: File;
};

/**
 * Submit identity info + documents for verification (multipart/form-data).
 * Marks the account "verifying" and returns the updated user. The backend may
 * answer 409 if a verification is already in progress or completed.
 */
export function submitIdentity(
  token: string,
  profile: IdentityProfile,
  documents: IdentityDocuments,
): Promise<User> {
  const form = new FormData();
  form.append("first_name", profile.first_name);
  form.append("last_name", profile.last_name);
  form.append("national_code", profile.national_code);
  form.append("birth_date", profile.birth_date);
  form.append("gender", profile.gender);
  form.append("province_id", String(profile.province_id));
  form.append("city_id", String(profile.city_id));
  form.append("address", profile.address);
  form.append("national_card_image", documents.national_card_image);
  form.append("face_image", documents.face_image);

  return apiFetch<User>("/api/v1/identity/verify", {
    method: "POST",
    token,
    body: form,
  });
}

/**
 * Whether the user still needs to go through identity onboarding. Only a
 * `pending` account has never submitted; verifying/verified/rejected are past
 * that gate (a rejected user re-submits from the dashboard, not onboarding).
 */
export function needsIdentityOnboarding(user: User): boolean {
  return user.identity_status === "pending";
}
