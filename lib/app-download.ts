import { toPersianDigits } from "@/lib/format";

// Single source of truth for the native Android (TWA) download.
//
// The APK is a signed Bubblewrap build that lives under android-twa/ (gitignored
// there, since it's regenerable). We mirror the latest signed copy into
// public/downloads/hamrah.apk so Next serves it at a stable URL — run
// `npm run pwa:apk` after rebuilding, then bump VERSION + SIZE_BYTES to match.

/** Friendly marketing version shown in the UI (matches twa-manifest appVersionName). */
export const APP_VERSION = "1.0";

/** Stable download path; public/downloads/hamrah.apk is served verbatim by Next. */
export const APP_APK_HREF = "/downloads/hamrah.apk";

/** Suggested filename for the saved download. */
export const APP_APK_FILENAME = "hamrah.apk";

/** Exact byte size of the mirrored APK — keep in sync after `npm run pwa:apk`. */
export const APP_APK_SIZE_BYTES = 1_200_580;

/** Human-readable size with Persian digits, e.g. 1_200_580 → "۱.۱ مگابایت". */
export function formatAppSize(bytes = APP_APK_SIZE_BYTES): string {
  const mb = bytes / (1024 * 1024);
  // One decimal place, dropping a trailing ".0" so whole numbers stay clean.
  const formatted = mb.toFixed(1).replace(/\.0$/, "");
  return `${toPersianDigits(formatted)} مگابایت`;
}
