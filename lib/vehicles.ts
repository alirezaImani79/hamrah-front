// CRUD helpers for the authenticated user's vehicles.
// Maps onto /api/v1/vehicles (list, create) and /api/v1/vehicles/{id}
// (update, delete). Every call needs the Sanctum bearer token.

import { apiFetch, type Vehicle } from "@/lib/api";

/** Editable fields of a vehicle — the create/update payload. */
export type VehicleInput = {
  number: string;
  name: string;
  seats: number;
  color: string;
  model: string;
};

/** List the authenticated user's vehicles. */
export function listVehicles(token: string): Promise<Vehicle[]> {
  return apiFetch<Vehicle[]>("/api/v1/vehicles", { token });
}

/** Attach a new vehicle to the authenticated user. */
export function createVehicle(
  token: string,
  input: VehicleInput,
): Promise<Vehicle> {
  return apiFetch<Vehicle>("/api/v1/vehicles", {
    method: "POST",
    token,
    body: input,
  });
}

/**
 * Update one of the user's vehicles. The backend treats every field as
 * optional, but the form always sends the full set, so we accept the same.
 */
export function updateVehicle(
  token: string,
  id: number,
  input: VehicleInput,
): Promise<Vehicle> {
  return apiFetch<Vehicle>(`/api/v1/vehicles/${id}`, {
    method: "PUT",
    token,
    body: input,
  });
}

/** Detach (delete) one of the user's vehicles. */
export function deleteVehicle(token: string, id: number): Promise<null> {
  return apiFetch<null>(`/api/v1/vehicles/${id}`, {
    method: "DELETE",
    token,
  });
}
