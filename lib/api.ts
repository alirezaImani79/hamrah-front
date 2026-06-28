// ──────────────────────────────────────────────────────────────────────────
// Thin client for the Hamrah backend API.
//
// Every endpoint returns a uniform JSON envelope:
//   success → { success: true,  message, data }
//   failure → { success: false, message, errors }
// `apiFetch` unwraps `data` on success and throws `ApiError` otherwise.
//
// Edge-safe: no `document` / `window` access at module scope, so this module
// can be imported from `proxy.ts` (Edge runtime) as well as the browser.
// ──────────────────────────────────────────────────────────────────────────

/** Base URL of the backend. Override per-environment via NEXT_PUBLIC_API_BASE_URL. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://hamrah.test";

/** Name of the cookie that holds the Sanctum bearer token. */
export const AUTH_COOKIE = "hamrah_token";

export type Gender = "male" | "female";

/** Identity verification lifecycle: never submitted → under review → done. */
export type IdentityStatus = "pending" | "verifying" | "verified" | "rejected";

export type Province = {
  id: number;
  name: string;
  code: string;
};

export type City = {
  id: number;
  name: string;
  province_id: number;
};

export type User = {
  id: number;
  phone_number: string;
  name: string | null;
  email: string | null;
  phone_verified_at: string | null;
  is_subscribed_to_newsletter: boolean;
  newsletter_subscribed_at: string | null;
  // Identity / onboarding profile — all null until the user completes onboarding.
  first_name: string | null;
  last_name: string | null;
  national_code: string | null;
  birth_date: string | null;
  gender: Gender | null;
  province_id: number | null;
  city_id: number | null;
  address: string | null;
  province: Province | null;
  city: City | null;
  identity_status: IdentityStatus;
  is_identity_verified: boolean;
  identity_verified_at: string | null;
  identity_rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

export type Vehicle = {
  id: number;
  /** License plate, e.g. "12 ج 345 67". */
  number: string;
  /** A preferred name the user chose for the vehicle. */
  name: string;
  seats: number;
  color: string;
  /** The vehicle model name, e.g. "Peugeot 206". */
  model: string;
  created_at: string;
  updated_at: string;
};

export type AuthData = {
  token: string;
  token_type: string;
  /** True when this OTP verify registered a brand-new user → start onboarding. */
  is_new_user: boolean;
  user: User;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data?: T | null;
  errors?: Record<string, string[]> | null;
};

/** Error carrying the backend `message`, HTTP `status`, and field `errors`. */
export class ApiError extends Error {
  readonly status: number;
  readonly errors: Record<string, string[]> | null;

  constructor(
    message: string,
    status: number,
    errors: Record<string, string[]> | null = null,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  /** First validation message for a given field, if any. */
  fieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0];
  }
}

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Sanctum bearer token to send as `Authorization: Bearer …`. */
  token?: string | null;
};

/**
 * Calls the backend and returns the unwrapped `data` payload.
 * Throws `ApiError` on a network failure, non-2xx response, or `success: false`.
 */
export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { method = "GET", body, token } = options;

  // FormData (file uploads) must go out raw so the browser sets the multipart
  // boundary itself; everything else is JSON.
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("ارتباط با سرور برقرار نشد؛ اتصال اینترنتت رو بررسی کن.", 0);
  }

  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // Non-JSON body (e.g. a 500 HTML page) — fall through to the error path.
  }

  if (!response.ok || !envelope?.success) {
    throw new ApiError(
      envelope?.message ?? "خطایی رخ داد؛ کمی بعد دوباره تلاش کن.",
      response.status,
      envelope?.errors ?? null,
    );
  }

  return (envelope.data ?? null) as T;
}
