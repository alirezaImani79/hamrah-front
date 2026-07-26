"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Armchair,
  CalendarClock,
  Check,
  Flag,
  Loader2,
  Luggage,
  MapPin,
  UserPlus,
  Users,
} from "lucide-react";

import { ApiError, type Trip } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { toPersianDigits } from "@/lib/format";
import { formatJalaliDateTime } from "@/lib/datetime";
import { joinTrip, type MatchedTrip } from "@/lib/trips";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  NeshanMap,
  type MapMarker,
} from "@/components/map/neshan-map";

const ORIGIN_COLOR = "var(--brand-500, #16a34a)";
const DESTINATION_COLOR = "var(--destructive, #dc2626)";

type Props = {
  trip: MatchedTrip;
  /** Called with the trip returned by /join once the user joins. */
  onJoined: (trip: Trip) => void;
};

/** One ranked suggestion: route preview, ranking badges, and a join action. */
export function MatchedTripCard({ trip, onJoined }: Props) {
  const router = useRouter();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markers: MapMarker[] = [
    { id: "origin", lat: trip.origin.lat, lng: trip.origin.lng, color: ORIGIN_COLOR },
    {
      id: "destination",
      lat: trip.destination.lat,
      lng: trip.destination.lng,
      color: DESTINATION_COLOR,
    },
  ];

  async function handleJoin() {
    if (joining || joined) return;
    const token = getToken();
    if (!token) {
      setError("نشستت منقضی شده؛ برای ادامه دوباره وارد شو.");
      return;
    }
    setJoining(true);
    setError(null);
    try {
      const updated = await joinTrip(token, trip.id);
      setJoined(true);
      onJoined(updated);
      // Send the user to the trip detail page (driver, passengers, status).
      router.push(`/dashboard/trips/${updated.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) {
        setError("این سفر ظرفیت نداره یا قبلاً هم‌سفرش شدی.");
      } else if (err instanceof ApiError && err.status === 403) {
        setError("به این سفر نمی‌تونی اضافه بشی.");
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setJoining(false);
    }
  }

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <NeshanMap
        markers={markers}
        interactive={false}
        fitToMarkers
        className="h-40 w-full"
        ariaLabel="پیش‌نمایش مسیر سفر پیشنهادی"
      />
      <div className="flex flex-col gap-4 p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <CalendarClock className="size-4 text-brand-600" />
          {formatJalaliDateTime(trip.departure_at)}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Armchair className="size-3.5" />
            {toPersianDigits(trip.available_seats)} صندلی خالی
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <MapPin className="size-3.5" />
            {toPersianDigits(trip.origin_distance_km.toFixed(1))} کیلومتر تا مبدأ تو
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Flag className="size-3.5" />
            {toPersianDigits(trip.destination_distance_km.toFixed(1))} کیلومتر تا مقصدت
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Users className="size-3.5" />
            {toPersianDigits(trip.passengers_count)} همسفر
          </Badge>
          <Badge variant={trip.trunk_empty ? "secondary" : "outline"} className="gap-1">
            <Luggage className="size-3.5" />
            {trip.trunk_empty ? "صندوق خالی" : "صندوق پر"}
          </Badge>
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="border-t border-border pt-4">
          <Button
            onClick={handleJoin}
            disabled={joining || joined}
            className="h-10 w-full gap-1.5 rounded-xl font-semibold"
          >
            {joined ? (
              <>
                <Check className="size-4" />
                هم‌سفر شدی
              </>
            ) : joining ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                در حال ثبت…
              </>
            ) : (
              <>
                <UserPlus className="size-4" />
                هم‌سفر شو
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
