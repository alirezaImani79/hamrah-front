"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Armchair,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  Car,
  DoorOpen,
  Loader2,
  Luggage,
  Phone,
  User,
  Users,
} from "lucide-react";

import { getToken } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/format";
import { formatJalaliDateTime, isFuture } from "@/lib/datetime";
import {
  getTripDetail,
  leaveTrip,
  type TripDetail,
  type TripParticipant,
} from "@/lib/trips";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  NeshanMap,
  type MapMarker,
} from "@/components/map/neshan-map";

const ORIGIN_COLOR = "var(--brand-500, #16a34a)";
const DESTINATION_COLOR = "var(--destructive, #dc2626)";

type LoadState = "loading" | "ready" | "error";

function participantName(p: TripParticipant): string {
  const full = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return full || "بدون نام";
}

/** A fellow rider (driver or passenger): avatar, name, phone with call link. */
function ParticipantRow({ p }: { p: TripParticipant }) {
  return (
    <Card className="gap-3 p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <User className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-foreground">
            {participantName(p)}
          </span>
          <span dir="ltr" className="truncate text-xs text-muted-foreground">
            {toPersianDigits(p.phone_number)}
          </span>
        </div>
        <div className="ms-auto flex flex-wrap items-center gap-1.5">
          {p.gender ? (
            <Badge variant="outline" className="gap-1">
              {p.gender === "male" ? "آقا" : "خانم"}
            </Badge>
          ) : null}
          {p.is_identity_verified ? (
            <Badge variant="secondary" className="gap-1">
              <BadgeCheck className="size-3.5" />
              احراز‌شده
            </Badge>
          ) : null}
        </div>
      </div>
      <a
        href={`tel:${p.phone_number}`}
        dir="ltr"
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "gap-1.5 self-start rounded-lg",
        )}
      >
        <Phone className="size-3.5" />
        تماس
      </a>
    </Card>
  );
}

export function TripDetailManager({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setError("نشستت منقضی شده؛ برای ادامه دوباره وارد شو.");
      setLoadState("error");
      return;
    }
    setLoadState("loading");
    try {
      setTrip(await getTripDetail(token, Number(tripId)));
      setLoadState("ready");
    } catch (err) {
      setError(errorMessage(err));
      setLoadState("error");
    }
  }, [tripId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  async function handleLeave() {
    if (leaving) return;
    const token = getToken();
    if (!token) {
      setLeaveError("نشستت منقضی شده؛ برای ادامه دوباره وارد شو.");
      return;
    }
    setLeaving(true);
    setLeaveError(null);
    try {
      await leaveTrip(token, Number(tripId));
      router.push("/dashboard/trips");
    } catch (err) {
      setLeaveError(errorMessage(err));
    } finally {
      setLeaving(false);
    }
  }

  if (loadState === "loading" || !trip) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-7 animate-spin text-brand-600" />
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard/trips"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          بازگشت به سفرها
        </Link>
        <Card className="flex flex-col gap-3 p-6">
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
          <Button onClick={load} variant="outline" className="w-fit rounded-xl">
            تلاش دوباره
          </Button>
        </Card>
      </div>
    );
  }

  const upcoming = isFuture(trip.departure_at);
  const isPassenger = trip.role === "passenger";

  const markers: MapMarker[] = [
    { id: "origin", lat: trip.origin.lat, lng: trip.origin.lng, color: ORIGIN_COLOR },
    {
      id: "destination",
      lat: trip.destination.lat,
      lng: trip.destination.lng,
      color: DESTINATION_COLOR,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/dashboard/trips"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowRight className="size-4" />
          بازگشت به سفرها
        </Link>
        <Badge variant={upcoming ? "secondary" : "outline"} className="gap-1.5">
          <span
            className={cn(
              "size-1.5 rounded-full",
              upcoming ? "bg-brand-500" : "bg-muted-foreground",
            )}
          />
          {upcoming ? "در پیش رو" : "انجام شده"}
        </Badge>
      </div>

      <h1 className="font-heading text-2xl font-bold text-foreground">
        جزئیات سفر
      </h1>

      <Card className="gap-0 overflow-hidden p-0">
        <NeshanMap
          markers={markers}
          interactive={false}
          fitToMarkers
          className="h-56 w-full"
          ariaLabel="مسیر سفر"
        />
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <CalendarClock className="size-4 text-brand-600" />
            {formatJalaliDateTime(trip.departure_at)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              <Armchair className="size-3.5" />
              {toPersianDigits(trip.empty_seats)} صندلی خالی
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
        </div>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          راننده
        </h2>
        {trip.driver ? (
          <ParticipantRow p={trip.driver} />
        ) : (
          <p className="text-sm text-muted-foreground">
            اطلاعات راننده در دسترس نیست.
          </p>
        )}
      </section>

      {trip.vehicle ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            خودرو
          </h2>
          <Card className="gap-3 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Car className="size-4 text-brand-600" />
              {trip.vehicle.name}
              {trip.vehicle.model ? ` • ${trip.vehicle.model}` : ""}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                {toPersianDigits(trip.vehicle.seats)} صندلی
              </Badge>
              {trip.vehicle.color ? (
                <Badge variant="outline">{trip.vehicle.color}</Badge>
              ) : null}
              {trip.vehicle.number ? (
                <Badge variant="outline" className="gap-1">
                  <span dir="ltr">{toPersianDigits(trip.vehicle.number)}</span>
                </Badge>
              ) : null}
            </div>
          </Card>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          هم‌سفرها
        </h2>
        {trip.passengers.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {trip.passengers.map((p) => (
              <li key={p.id}>
                <ParticipantRow p={p} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            هنوز هم‌سفر دیگه‌ای به این سفر اضافه نشده.
          </p>
        )}
      </section>

      {isPassenger ? (
        <div className="border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={() => setLeaveOpen(true)}
            className="gap-1.5 rounded-xl text-muted-foreground hover:text-destructive"
          >
            <DoorOpen className="size-4" />
            ترک سفر
          </Button>
        </div>
      ) : (
        <p className="border-t border-border pt-4 text-sm text-muted-foreground">
          این سفر رو تو ایجاد کردی.
        </p>
      )}

      <AlertDialog
        open={leaveOpen}
        onOpenChange={(open) => {
          if (!leaving) setLeaveOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ترک سفر</AlertDialogTitle>
            <AlertDialogDescription>
              مطمئنی می‌خوای از این سفر خارج بشی؟ صندلی‌ت آزاد می‌شه و ممکنه به
              هم‌سفر دیگه‌ای داده بشه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {leaveError ? (
            <p className="text-sm text-destructive" role="alert">
              {leaveError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setLeaveOpen(false)}
              disabled={leaving}
              className="rounded-xl"
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeave}
              disabled={leaving}
              className="gap-1.5 rounded-xl"
            >
              {leaving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <DoorOpen className="size-4" />
              )}
              {leaving ? "در حال خروج…" : "خروج از سفر"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
