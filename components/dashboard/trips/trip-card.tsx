"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Armchair,
  BadgeCheck,
  CalendarClock,
  Car,
  Loader2,
  Luggage,
  User,
  Users,
  XCircle,
} from "lucide-react";

import { type Trip, type TripParticipant } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { cancelTrip } from "@/lib/trips";
import { errorMessage } from "@/lib/errors";
import { toPersianDigits } from "@/lib/format";
import { formatJalaliDateTime } from "@/lib/datetime";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NeshanMap, type MapMarker } from "@/components/map/neshan-map";

const ORIGIN_COLOR = "var(--brand-500, #16a34a)";
const DESTINATION_COLOR = "var(--destructive, #dc2626)";

function participantName(p: TripParticipant): string {
  const full = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return full || "بدون نام";
}

type TripCardProps = {
  trip: Trip;
  /** Called after the driver successfully cancels this trip. */
  onCancelled?: (id: number) => void;
};

/**
 * One trip on the dashboard: route preview, Jalali departure, status/role badges,
 * seats/passengers/trunk, the driver or vehicle, a details link, and — for the
 * driver only — a destructive "cancel" action that hits /trips/{id}/cancel.
 */
export function TripCard({ trip, onCancelled }: TripCardProps) {
  const isDriver = trip.role === "driver";
  const isOngoing = trip.status === "ongoing";

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const markers: MapMarker[] = [
    { id: "origin", lat: trip.origin.lat, lng: trip.origin.lng, color: ORIGIN_COLOR },
    {
      id: "destination",
      lat: trip.destination.lat,
      lng: trip.destination.lng,
      color: DESTINATION_COLOR,
    },
  ];

  async function handleCancel() {
    if (cancelling) return;
    const token = getToken();
    if (!token) {
      setCancelError("نشستت منقضی شده؛ برای ادامه دوباره وارد شو.");
      return;
    }
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelTrip(token, trip.id);
      onCancelled?.(trip.id);
      setCancelOpen(false);
    } catch (err) {
      setCancelError(errorMessage(err));
    } finally {
      setCancelling(false);
    }
  }

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <NeshanMap
        markers={markers}
        interactive={false}
        fitToMarkers
        className="h-40 w-full"
        ariaLabel="پیش‌نمایش مسیر سفر"
      />
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            <CalendarClock className="size-4 text-brand-600" />
            {formatJalaliDateTime(trip.departure_at)}
          </div>
          <Badge
            variant={isOngoing ? "secondary" : "outline"}
            className="gap-1.5"
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                isOngoing ? "bg-brand-500" : "bg-accent-500",
              )}
            />
            {isOngoing ? "در حال انجام" : "در پیش رو"}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Armchair className="size-3.5" />
            {toPersianDigits(trip.empty_seats)} صندلی خالی
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Users className="size-3.5" />
            {toPersianDigits(trip.passengers_count)} هم‌سفر
          </Badge>
          <Badge variant={trip.trunk_empty ? "secondary" : "outline"} className="gap-1">
            <Luggage className="size-3.5" />
            {trip.trunk_empty ? "صندوق خالی" : "صندوق پر"}
          </Badge>
          <Badge variant="outline" className="gap-1">
            {isDriver ? (
              <Car className="size-3.5" />
            ) : (
              <User className="size-3.5" />
            )}
            {isDriver ? "راننده" : "هم‌سفر"}
          </Badge>
        </div>

        {isDriver && trip.vehicle ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Car className="size-4 text-brand-600" />
            <span className="font-medium text-foreground">{trip.vehicle.name}</span>
            {trip.vehicle.model ? (
              <span>• {trip.vehicle.model}</span>
            ) : null}
          </div>
        ) : null}
        {!isDriver && trip.driver ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex size-7 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <User className="size-4" />
            </span>
            <span className="font-medium text-foreground">
              {participantName(trip.driver)}
            </span>
            {trip.driver.is_identity_verified ? (
              <Badge variant="secondary" className="gap-1">
                <BadgeCheck className="size-3.5" />
                احراز‌شده
              </Badge>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center gap-2 border-t border-border pt-4">
          <Link
            href={`/dashboard/trips/${trip.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5 rounded-lg",
            )}
          >
            مشاهده جزئیات
            <ArrowLeft className="size-3.5" />
          </Link>
          {isDriver ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCancelError(null);
                setCancelOpen(true);
              }}
              className="ms-auto gap-1.5 rounded-lg text-muted-foreground hover:text-destructive"
            >
              <XCircle className="size-3.5" />
              لغو سفر
            </Button>
          ) : null}
        </div>
      </div>

      <AlertDialog
        open={cancelOpen}
        onOpenChange={(open) => {
          if (!cancelling) setCancelOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>لغو سفر</AlertDialogTitle>
            <AlertDialogDescription>
              مطمئنی می‌خوای این سفر رو لغو کنی؟ هم‌سفرها مطلع می‌شن و این کار
              قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {cancelError ? (
            <p className="text-sm text-destructive" role="alert">
              {cancelError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={cancelling}
              className="rounded-xl"
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelling}
              className="gap-1.5 rounded-xl"
            >
              {cancelling ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <XCircle className="size-4" />
              )}
              {cancelling ? "در حال لغو…" : "لغو سفر"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
