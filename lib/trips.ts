// CRUD helpers for the authenticated user's trips.
// Maps onto /api/v1/trips (list, create) and /api/v1/trips/{id} (show, update,
// delete). Every call needs the Sanctum bearer token.

import { apiFetch, type Trip } from "@/lib/api";

/**
 * Create/update payload. The backend takes flat lat/lng fields (not the nested
 * `origin`/`destination` objects it returns) and a `departure_at` datetime
 * string in "YYYY-MM-DD HH:mm:ss" form.
 */
export type TripInput = {
  vehicle_id: number;
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
  departure_at: string;
  empty_seats: number;
  trunk_empty: boolean;
};

/** List the trips the authenticated user drives. */
export function listTrips(token: string): Promise<Trip[]> {
  return apiFetch<Trip[]>("/api/v1/trips", { token });
}

/** Upcoming trips the user drives or has joined. */
export function listCurrentTrips(token: string): Promise<Trip[]> {
  return apiFetch<Trip[]>("/api/v1/trips/current", { token });
}

/** Past trips the user drove or joined. */
export function listTripHistory(token: string): Promise<Trip[]> {
  return apiFetch<Trip[]>("/api/v1/trips/history", { token });
}

/** Create a new trip for the authenticated user. */
export function createTrip(token: string, input: TripInput): Promise<Trip> {
  return apiFetch<Trip>("/api/v1/trips", {
    method: "POST",
    token,
    body: input,
  });
}

/**
 * Update one of the user's trips. The backend treats every field as optional,
 * but the form always sends the full set, so we accept the same.
 */
export function updateTrip(
  token: string,
  id: number,
  input: TripInput,
): Promise<Trip> {
  return apiFetch<Trip>(`/api/v1/trips/${id}`, {
    method: "PUT",
    token,
    body: input,
  });
}

/** Delete one of the user's trips. */
export function deleteTrip(token: string, id: number): Promise<null> {
  return apiFetch<null>(`/api/v1/trips/${id}`, {
    method: "DELETE",
    token,
  });
}
