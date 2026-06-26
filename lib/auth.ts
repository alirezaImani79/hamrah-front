// ──────────────────────────────────────────────────────────────────────────
// Auth: bearer-token cookie helpers + the OTP auth endpoints.
//
// The token lives in a JS-readable cookie (`hamrah_token`) so that:
//   • the browser can send it as `Authorization: Bearer …`, and
//   • `proxy.ts` can do an optimistic presence check to guard /dashboard.
// ──────────────────────────────────────────────────────────────────────────

import {
  AUTH_COOKIE,
  apiFetch,
  type AuthData,
  type User,
} from "@/lib/api";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/** Read the stored bearer token (client-side only). */
export function getToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${AUTH_COOKIE}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/** Persist the bearer token. `secure` only on https so it still works on localhost. */
export function setToken(token: string): void {
  if (typeof document === "undefined") return;
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax${secure}`;
}

/** Remove the stored bearer token. */
export function clearToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

/** Send a one-time code to the given phone number. */
export function requestOtp(phoneNumber: string): Promise<null> {
  return apiFetch<null>("/api/v1/auth/otp/request", {
    method: "POST",
    body: { phone_number: phoneNumber },
  });
}

/** Verify the code and exchange it for a bearer token + user. */
export function verifyOtp(phoneNumber: string, code: string): Promise<AuthData> {
  return apiFetch<AuthData>("/api/v1/auth/otp/verify", {
    method: "POST",
    body: { phone_number: phoneNumber, code },
  });
}

/** Fetch the currently authenticated user. */
export function getMe(token: string): Promise<User> {
  return apiFetch<User>("/api/v1/auth/me", { token });
}

/** Revoke the current bearer token server-side. */
export function logout(token: string): Promise<null> {
  return apiFetch<null>("/api/v1/auth/logout", { method: "POST", token });
}
