// Public reference lists for the address step of onboarding: Iranian provinces
// and their cities. Both are unauthenticated GETs.

import { apiFetch, type City, type Province } from "@/lib/api";

/** All active provinces, ordered by name. */
export function listProvinces(): Promise<Province[]> {
  return apiFetch<Province[]>("/api/v1/locations/provinces");
}

/** Cities of a province, ordered by name. */
export function listCities(provinceId: number): Promise<City[]> {
  return apiFetch<City[]>(`/api/v1/locations/provinces/${provinceId}/cities`);
}
