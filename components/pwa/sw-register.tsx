"use client";

import { useEffect } from "react";

// Registers the production service worker (`/sw.js`). We bail out in
// development so the SW never intercepts local requests / interferes with
// HMR. The component renders nothing.
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service worker registration failed:", error);
      });
    };

    // Defer until the page is idle so registration never competes with
    // first paint or first navigation.
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(register);
    } else {
      window.addEventListener("load", register);
    }
  }, []);

  return null;
}
