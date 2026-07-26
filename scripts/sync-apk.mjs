// Mirror the latest signed Bubblewrap APK (android-twa/app-release-signed.apk,
// which is gitignored as a regenerable build output) into public/downloads/ so
// Next serves it at a stable URL. Run after rebuilding the TWA:
//   npm run pwa:apk
//
// Kept dependency-free and ESM so it runs on the same `node` as the other scripts.
import { copyFileSync, existsSync, statSync } from "node:fs";

const SOURCE = "android-twa/app-release-signed.apk";
const DEST_DIR = "public/downloads";
const DEST = `${DEST_DIR}/hamrah.apk`;

if (!existsSync(SOURCE)) {
  console.error(
    `✗ Signed APK not found at ${SOURCE}.\n` +
      "  Build it first with Bubblewrap (see docs/TWA.md), then re-run.",
  );
  process.exit(1);
}

copyFileSync(SOURCE, DEST);
const size = statSync(DEST).size;
console.log(
  `✓ Copied ${SOURCE} → ${DEST} (${(size / 1024 / 1024).toFixed(1)} MB)`,
);
console.log("  Download URL: /downloads/hamrah.apk");
