# Building the Android APK (TWA)

This project is wrapped as an Android app using a **Trusted Web Activity
(TWA)**: Chrome opens `https://hamrah-ride.ir` full-screen with no address
bar, so it behaves like a native app. The PWA prerequisites are already wired
up in this repo — this doc covers generating the APK from the live site.

## Prerequisites (already in the repo)

- [`app/manifest.ts`](../app/manifest.ts) — web app manifest, served at
  `/manifest.webmanifest`.
- [`public/sw.js`](../public/sw.js) — minimal service worker (the
  installability signal Chrome requires; intentionally network-only, no
  precaching).
- `public/icons/icon-{192,512}.png` — app icons. Regenerate after changing
  [`app/icon.svg`](../app/icon.svg) with `npm run pwa:icons`.

## 1. Deploy and verify the site is installable

The site must be live on HTTPS and pass Chrome's installability check before
Bubblewrap will produce a clean TWA.

1. Deploy the frontend.
2. Open `https://hamrah-ride.ir` in Chrome.
3. DevTools → **Application** → **Manifest**: no errors, both icons resolve.
4. Lighthouse → **PWA** category → it reports **Installable**.

## 2. Generate the TWA project with Bubblewrap

```bash
npx @bubblewrap/cli init --manifest https://hamrah-ride.ir/manifest.webmanifest
```

Bubblewrap asks a few questions (example answers):

- **Application name / short name:** `همراه` / `Hamrah`
- **Application ID (package):** reverse-domain, e.g. `ir.hamrahride.app`
- **Display mode:** `standalone`
- **Orientation:** `portrait`
- **Theme / status bar color:** `#047857`
- **Signing key:** create a new keystore and **back up the password** — it
  cannot be recovered and Play Store signing keys cannot be reset.

This creates an Android project folder locally (outside this repo).

## 3. Fill in the Digital Asset Links

For the TWA to open **full-screen** (no URL bar), Chrome must verify that the
APK owns `hamrah-ride.ir`. Bubblewrap prints the SHA-256 fingerprint of the
signing key during `init` / `build`. Put it in
[`public/.well-known/assetlinks.json`](../public/.well-known/assetlinks.json):

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "ir.hamrahride.app",
      "sha256_cert_fingerprints": ["THE_SHA256_FROM_BUBBLEWRAP"]
    }
  }
]
```

Then redeploy and confirm it is reachable:

```bash
curl -sL https://hamrah-ride.ir/.well-known/assetlinks.json
```

> If this file is missing or the fingerprint does not match, the TWA still
> runs but opens as a Chrome **Custom Tab with a URL bar** instead of true
> full-screen. A placeholder version is committed — **replace it before
> release.**

## 4. Build the APK

From the Bubblewrap project directory:

```bash
npx @bubblewrap/cli build
```

This produces:

- `app-release-signed.apk` — sideloadable on a device for testing.
- `app-release-bundle.aab` — upload this to the Play Store.

## Notes

- **Signing key is permanent.** Back up the keystore created in step 2. If you
  lose it you cannot publish updates to the same Play Store listing.
- **Content updates need no APK rebuild.** The APK only points at the URL, so
  every deploy to `hamrah-ride.ir` is reflected instantly. Rebuild only when
  the manifest, icons, or package metadata change.
- **Offline:** the minimal service worker forwards every request to the
  network (no precaching), so the app needs a connection to open. If offline
  support is needed later, swap in Serwist's configurator mode
  (`@serwist/next/config`, Turbopack-compatible) or build with
  `next build --webpack`.
