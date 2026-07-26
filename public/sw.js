// Minimal service worker for the Hamrah TWA / PWA.
//
// Purpose: satisfy Chrome's installability criterion — the site must register
// a service worker with a fetch handler on its origin. It intentionally does
// NOT precache the app shell or serve stale responses: every request is
// forwarded straight to the network, so runtime behavior (auth, API calls,
// fresh content) is identical to having no service worker at all. Registered
// client-side by components/pwa/sw-register.tsx (production only).
//
// If offline support is ever needed, replace this with Serwist's configurator
// mode (`@serwist/next/config`, Turbopack-compatible) or build with
// `next build --webpack` to use the full Serwist webpack pipeline.
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Forward to the network unchanged — no caching, no offline fallback.
  event.respondWith(fetch(event.request));
});
