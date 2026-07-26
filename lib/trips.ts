// CRUD helpers for the authenticated user's trips.
// Maps onto /api/v1/trips (list, create) and /api/v1/trips/{id} (show, update,
// delete). Every call needs the Sanctum bearer token.

import { apiFetch, type Gender, type Trip, type Vehicle } from "@/lib/api";

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

// ─── Passenger-side matching ──────────────────────────────────────────────
// POST /api/v1/trips/match returns ranked scheduled trips for a travel
// request; POST /api/v1/trips/{id}/join seats the user on one as a passenger.

/** Driver-gender preference for matching. Omit for "no preference". */
export type DriverGender = "male" | "female";

/**
 * A passenger's travel request. The backend takes the same flat lat/lng fields
 * as `TripInput`. `driver_gender` is optional — omit the key (don't send null)
 * when the passenger has no preference.
 */
export type MatchTripInput = {
  origin_lat: number;
  origin_lng: number;
  destination_lat: number;
  destination_lng: number;
  /** Gregorian "YYYY-MM-DD HH:mm:ss", must be in the future. */
  departure_at: string;
  /** 1..4 (the match endpoint's cap). */
  requested_seats: number;
  driver_gender?: DriverGender;
};

/** A ranked scheduled trip returned by /trips/match. */
export type MatchedTrip = Trip & {
  /** Empty seats not yet taken by other passengers. */
  available_seats: number;
  /** Distance between the trip's origin and the passenger's pickup, in km. */
  origin_distance_km: number;
  /** Distance between the trip's destination and the passenger's dropoff, in km. */
  destination_distance_km: number;
};

/**
 * Find scheduled trips that fit a travel request. Results are ranked by the
 * backend. `input.driver_gender` is forwarded only when set.
 */
export function matchTrips(
  token: string,
  input: MatchTripInput,
): Promise<MatchedTrip[]> {
  return apiFetch<MatchedTrip[]>("/api/v1/trips/match", {
    method: "POST",
    token,
    body: input,
  });
}

/** Join a trip as a passenger. Returns the updated trip. */
export function joinTrip(token: string, id: number): Promise<Trip> {
  return apiFetch<Trip>(`/api/v1/trips/${id}/join`, {
    method: "POST",
    token,
  });
}

// ─── Trip detail (driver, vehicle, passengers) ────────────────────────────

/** A user as seen by fellow riders on a shared trip (driver or passenger). */
export type TripParticipant = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  gender: Gender | null;
  phone_number: string;
  is_identity_verified: boolean;
};

/** A trip enriched with its driver, vehicle, and signed-up passengers. */
export type TripDetail = Trip & {
  driver: TripParticipant | null;
  vehicle: Vehicle | null;
  passengers: TripParticipant[];
};

/** Fetch the enriched detail for one trip the user drives or has joined. */
export function getTripDetail(token: string, id: number): Promise<TripDetail> {
  return apiFetch<TripDetail>(`/api/v1/trips/${id}`, { token });
}

/** Leave a trip the user previously joined. */
export function leaveTrip(token: string, id: number): Promise<null> {
  return apiFetch<null>(`/api/v1/trips/${id}/leave`, {
    method: "DELETE",
    token,
  });
}
