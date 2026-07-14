"use client";

import { useState } from "react";
import { MapPin, Flag } from "lucide-react";

import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/format";
import { type LatLngLiteral } from "@/lib/neshan";
import { NeshanMap, type MapMarker } from "@/components/map/neshan-map";

export type RoutePoint = LatLngLiteral;

type Target = "origin" | "destination";

type Props = {
  origin: RoutePoint | null;
  destination: RoutePoint | null;
  onChange: (next: { origin: RoutePoint | null; destination: RoutePoint | null }) => void;
  className?: string;
};

const ORIGIN_COLOR = "var(--brand-500, #16a34a)";
const DESTINATION_COLOR = "var(--destructive, #dc2626)";

function formatPoint(point: RoutePoint | null): string | null {
  if (!point) return null;
  return `${toPersianDigits(point.lat.toFixed(5))}، ${toPersianDigits(
    point.lng.toFixed(5),
  )}`;
}

/**
 * Pick an origin and a destination on a Neshan map. A segmented toggle chooses
 * which point the next tap sets; both render as coloured pins. Reusable for any
 * "choose two locations" flow.
 */
export function RouteMapPicker({ origin, destination, onChange, className }: Props) {
  const [target, setTarget] = useState<Target>("origin");

  const markers: MapMarker[] = [];
  if (origin) markers.push({ id: "origin", lat: origin.lat, lng: origin.lng, color: ORIGIN_COLOR });
  if (destination)
    markers.push({
      id: "destination",
      lat: destination.lat,
      lng: destination.lng,
      color: DESTINATION_COLOR,
    });

  function handleClick(point: LatLngLiteral) {
    if (target === "origin") {
      onChange({ origin: point, destination });
      // After setting the origin, nudge the user to place the destination next.
      if (!destination) setTarget("destination");
    } else {
      onChange({ origin, destination: point });
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="انتخاب نقطه">
        <PointTab
          active={target === "origin"}
          onClick={() => setTarget("origin")}
          icon={<MapPin className="size-4" />}
          label="مبدأ"
          value={formatPoint(origin)}
          color={ORIGIN_COLOR}
        />
        <PointTab
          active={target === "destination"}
          onClick={() => setTarget("destination")}
          icon={<Flag className="size-4" />}
          label="مقصد"
          value={formatPoint(destination)}
          color={DESTINATION_COLOR}
        />
      </div>

      <NeshanMap
        markers={markers}
        onMapClick={handleClick}
        fitToMarkers={false}
        className="h-72 w-full rounded-xl border border-border"
        ariaLabel="نقشه انتخاب مبدأ و مقصد"
      />

      <p className="text-xs leading-6 text-muted-foreground">
        {target === "origin"
          ? "روی نقشه بزن تا نقطه مبدأ مشخص بشه."
          : "روی نقشه بزن تا نقطه مقصد مشخص بشه."}
      </p>
    </div>
  );
}

function PointTab({
  active,
  onClick,
  icon,
  label,
  value,
  color,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  value: string | null;
  color: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-xl border px-3 py-2 text-start transition-colors outline-none",
        "focus-visible:ring-3 focus-visible:ring-ring/50",
        active
          ? "border-brand-300 bg-brand-50"
          : "border-border bg-card hover:bg-muted",
      )}
    >
      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        <span
          className="flex size-5 items-center justify-center rounded-md text-white"
          style={{ background: color }}
        >
          {icon}
        </span>
        {label}
      </span>
      <span dir="ltr" className="w-full truncate text-xs text-muted-foreground">
        {value ?? "انتخاب نشده"}
      </span>
    </button>
  );
}
