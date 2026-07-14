"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPinned } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  loadNeshan,
  pinIcon,
  NESHAN_API_KEY,
  TEHRAN,
  type LatLngLiteral,
  type LatLngTuple,
  type NeshanL,
  type NeshanMap as NeshanMapInstance,
  type NeshanMapType,
  type NeshanMarker,
} from "@/lib/neshan";

/** A point to drop on the map, with an optional brand colour for its pin. */
export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  /** Pin colour (CSS colour). Defaults to the brand green. */
  color?: string;
};

type Props = {
  markers?: MapMarker[];
  /** Initial center; ignored once the user pans. Defaults to Tehran. */
  center?: LatLngTuple;
  zoom?: number;
  maptype?: NeshanMapType;
  /** When false the map is a static preview: no panning, zooming, or clicks. */
  interactive?: boolean;
  /** Fired with the clicked point's coordinates (only when interactive). */
  onMapClick?: (point: LatLngLiteral) => void;
  /** Pan/zoom to fit all markers whenever they change. */
  fitToMarkers?: boolean;
  className?: string;
  /** Accessible label for the map region. */
  ariaLabel?: string;
};

const DEFAULT_COLOR = "var(--brand-500, #16a34a)";

/**
 * Reusable Neshan (Leaflet) map. Loads the SDK on demand, renders markers, and
 * reports clicks. Designed to be dropped anywhere — pickers, previews, detail
 * views — by toggling `interactive` / `onMapClick` / `fitToMarkers`.
 */
export function NeshanMap({
  markers = [],
  center = TEHRAN,
  zoom = 12,
  maptype = "standard-day",
  interactive = true,
  onMapClick,
  fitToMarkers = false,
  className,
  ariaLabel = "نقشه",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<NeshanMapInstance | null>(null);
  const lRef = useRef<NeshanL | null>(null);
  const markerLayers = useRef<Map<string, NeshanMarker>>(new Map());
  // Keep the latest click handler without re-binding the map listener.
  const clickRef = useRef(onMapClick);
  useEffect(() => {
    clickRef.current = onMapClick;
  }, [onMapClick]);

  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    NESHAN_API_KEY ? "loading" : "error",
  );

  // ── Create the map once ────────────────────────────────────────────────
  useEffect(() => {
    if (!NESHAN_API_KEY) return;
    let cancelled = false;
    const layers = markerLayers.current;

    loadNeshan()
      .then((L) => {
        if (cancelled || !containerRef.current) return;
        const map = new L.Map(containerRef.current, {
          key: NESHAN_API_KEY,
          maptype,
          center,
          zoom,
          poi: false,
          traffic: false,
          zoomControl: interactive,
          dragging: interactive,
          scrollWheelZoom: interactive,
          doubleClickZoom: interactive,
          boxZoom: interactive,
          keyboard: interactive,
          touchZoom: interactive,
        });
        map.on("click", (e) => clickRef.current?.(e.latlng));
        lRef.current = L;
        mapRef.current = map;
        // The container may have just been mounted (e.g. inside a dialog) with a
        // zero size; recompute once layout settles.
        requestAnimationFrame(() => map.invalidateSize());
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layers.clear();
    };
    // Intentionally create the map a single time; live props are synced below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Sync markers ────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    const L = lRef.current;
    if (!map || !L || status !== "ready") return;

    const layers = markerLayers.current;
    const seen = new Set<string>();

    for (const m of markers) {
      seen.add(m.id);
      const existing = layers.get(m.id);
      if (existing) {
        existing.setLatLng([m.lat, m.lng]);
      } else {
        const marker = L.marker([m.lat, m.lng], {
          icon: pinIcon(L, m.color ?? DEFAULT_COLOR),
          interactive: false,
        }).addTo(map);
        layers.set(m.id, marker);
      }
    }
    // Drop markers no longer present.
    for (const [id, layer] of layers) {
      if (!seen.has(id)) {
        layer.remove();
        layers.delete(id);
      }
    }

    if (fitToMarkers && markers.length > 0) {
      if (markers.length === 1) {
        map.setView([markers[0].lat, markers[0].lng], Math.max(zoom, 14));
      } else {
        const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }
  }, [markers, fitToMarkers, status, zoom]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div
        ref={containerRef}
        role="application"
        aria-label={ariaLabel}
        className="size-full"
      />
      {status === "loading" ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="size-6 animate-spin text-brand-600" />
        </div>
      ) : null}
      {status === "error" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted px-4 text-center">
          <MapPinned className="size-6 text-muted-foreground" />
          <p className="text-xs leading-6 text-muted-foreground">
            {NESHAN_API_KEY
              ? "بارگذاری نقشه ممکن نشد."
              : "کلید نقشه نشان تنظیم نشده است."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
