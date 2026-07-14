// ──────────────────────────────────────────────────────────────────────────
// Loader + minimal typings for the Neshan Leaflet Web SDK.
//
// The SDK is loaded from Neshan's CDN (it injects a global `L`, a Neshan-flavoured
// Leaflet). We deliberately avoid an npm dependency so the map code stays a thin,
// browser-only layer. `loadNeshan()` injects the CSS + JS exactly once and resolves
// with the typed `L` namespace; concurrent callers share the same promise.
//
// Docs: https://platform.neshan.org/docs/sdk/web/leaflet/neshan-leaflet-sdk/
// ──────────────────────────────────────────────────────────────────────────

const SDK_CSS =
  "https://static.neshan.org/sdk/leaflet/v1.9.4/neshan-sdk/v1.0.8/index.css";
const SDK_JS =
  "https://static.neshan.org/sdk/leaflet/v1.9.4/neshan-sdk/v1.0.8/index.js";

/** Neshan map style. "standard-day" is the plain daytime basemap. */
export type NeshanMapType =
  | "standard-day"
  | "standard-night"
  | "neshan"
  | "dreamy"
  | "dreamy-gold";

/** Web SDK key (client-side). The map cannot render without it. */
export const NESHAN_API_KEY = process.env.NEXT_PUBLIC_NESHAN_API_KEY ?? "";

export type LatLngLiteral = { lat: number; lng: number };
export type LatLngTuple = [number, number];

// ── Minimal subset of the Leaflet API we actually use ─────────────────────
export interface NeshanLayer {
  addTo(map: NeshanMap): this;
  remove(): this;
}

export interface NeshanMarker extends NeshanLayer {
  setLatLng(latlng: LatLngTuple | LatLngLiteral): this;
  getLatLng(): LatLngLiteral;
}

export interface NeshanBounds {
  isValid(): boolean;
  extend(latlng: LatLngTuple | LatLngLiteral): this;
}

export interface NeshanMouseEvent {
  latlng: LatLngLiteral;
}

export interface NeshanMapOptions {
  key: string;
  maptype?: NeshanMapType;
  center?: LatLngTuple;
  zoom?: number;
  /** Show traffic layer. */
  traffic?: boolean;
  /** Show points of interest. */
  poi?: boolean;
  zoomControl?: boolean;
  dragging?: boolean;
  scrollWheelZoom?: boolean;
  doubleClickZoom?: boolean;
  boxZoom?: boolean;
  keyboard?: boolean;
  touchZoom?: boolean;
  attributionControl?: boolean;
}

export interface NeshanMap {
  setView(center: LatLngTuple, zoom?: number): this;
  on(event: "click", handler: (e: NeshanMouseEvent) => void): this;
  off(event: "click", handler?: (e: NeshanMouseEvent) => void): this;
  fitBounds(bounds: NeshanBounds, options?: { padding?: LatLngTuple; maxZoom?: number }): this;
  invalidateSize(animate?: boolean): this;
  remove(): void;
}

export interface NeshanDivIconOptions {
  html: string;
  className?: string;
  iconSize?: LatLngTuple;
  iconAnchor?: LatLngTuple;
}

export interface NeshanL {
  Map: new (element: string | HTMLElement, options: NeshanMapOptions) => NeshanMap;
  marker(
    latlng: LatLngTuple | LatLngLiteral,
    options?: { icon?: unknown; interactive?: boolean },
  ): NeshanMarker;
  divIcon(options: NeshanDivIconOptions): unknown;
  latLngBounds(latlngs: Array<LatLngTuple | LatLngLiteral>): NeshanBounds;
}

declare global {
  interface Window {
    L?: NeshanL;
  }
}

let loaderPromise: Promise<NeshanL> | null = null;

function injectStylesheet(): void {
  if (document.querySelector(`link[href="${SDK_CSS}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = SDK_CSS;
  document.head.appendChild(link);
}

function injectScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SDK_JS}"]`,
    );
    if (existing) {
      if (window.L) resolve();
      else {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () =>
          reject(new Error("بارگذاری نقشه نشان با خطا مواجه شد.")),
        );
      }
      return;
    }
    const script = document.createElement("script");
    script.src = SDK_JS;
    script.async = true;
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () =>
      reject(new Error("بارگذاری نقشه نشان با خطا مواجه شد.")),
    );
    document.head.appendChild(script);
  });
}

/**
 * Load the Neshan Leaflet SDK once and resolve with the global `L`.
 * Safe to call from many components concurrently — they share one load.
 */
export function loadNeshan(): Promise<NeshanL> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("نقشه فقط در مرورگر قابل بارگذاری است."));
  }
  if (window.L) return Promise.resolve(window.L);
  if (loaderPromise) return loaderPromise;

  loaderPromise = (async () => {
    injectStylesheet();
    await injectScript();
    if (!window.L) throw new Error("بارگذاری نقشه نشان با خطا مواجه شد.");
    return window.L;
  })().catch((err) => {
    // Let a later attempt retry from scratch.
    loaderPromise = null;
    throw err;
  });

  return loaderPromise;
}

/** Tehran — a sensible default center when nothing is selected yet. */
export const TEHRAN: LatLngTuple = [35.6892, 51.389];

/**
 * Build a vertical teardrop pin `divIcon` in a brand colour. Using a divIcon
 * avoids Leaflet's broken default-marker image paths under a bundler/CDN setup.
 *
 * The SVG is drawn in a 28×28 box with its tip at (14, 26) — the bottom-centre.
 * `iconAnchor` is set to that same point so the tip lands exactly on the
 * marker's lat/lng (i.e. exactly where the user clicked), with no offset.
 */
export function pinIcon(L: NeshanL, color: string): unknown {
  return L.divIcon({
    className: "neshan-pin",
    html: `<svg width="28" height="28" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" style="display:block;filter:drop-shadow(0 2px 2px rgba(0,0,0,0.35));">
      <path d="M14 2 C9 2 4 6 4 13 C4 18 14 26 14 26 C14 26 24 18 24 13 C24 6 19 2 14 2 Z" fill="${color}" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
      <circle cx="14" cy="11" r="3" fill="#ffffff"/>
    </svg>`,
    iconSize: [28, 28],
    iconAnchor: [14, 26],
  });
}
