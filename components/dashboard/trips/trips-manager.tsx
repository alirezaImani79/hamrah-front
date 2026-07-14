"use client";

import { useEffect, useState } from "react";
import {
  Armchair,
  Car,
  CalendarClock,
  Loader2,
  Luggage,
  Plus,
  Route,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";

import { type Trip, type Vehicle } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { toPersianDigits } from "@/lib/format";
import { formatJalaliDateTime } from "@/lib/datetime";
import { deleteTrip, listTrips } from "@/lib/trips";
import { listVehicles } from "@/lib/vehicles";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NeshanMap, type MapMarker } from "@/components/map/neshan-map";
import { TripFormDialog } from "@/components/dashboard/trips/trip-form-dialog";

type LoadState = "loading" | "ready" | "error";

const ORIGIN_COLOR = "var(--brand-500, #16a34a)";
const DESTINATION_COLOR = "var(--destructive, #dc2626)";

export default function TripsManager() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Trip | null>(null);

  const [pendingDelete, setPendingDelete] = useState<Trip | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function load() {
    const token = getToken();
    if (!token) {
      setLoadState("error");
      return;
    }
    setLoadState("loading");
    try {
      const [tripList, vehicleList] = await Promise.all([
        listTrips(token),
        listVehicles(token),
      ]);
      setTrips(tripList);
      setVehicles(vehicleList);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(trip: Trip) {
    setEditing(trip);
    setFormOpen(true);
  }

  function handleSaved(saved: Trip) {
    setTrips((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      return exists
        ? prev.map((t) => (t.id === saved.id ? saved : t))
        : [saved, ...prev];
    });
  }

  async function confirmDelete() {
    if (!pendingDelete || deleting) return;
    const token = getToken();
    if (!token) {
      setDeleteError("نشستت منقضی شده؛ برای ادامه دوباره وارد شو.");
      return;
    }
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteTrip(token, pendingDelete.id);
      setTrips((prev) => prev.filter((t) => t.id !== pendingDelete.id));
      setPendingDelete(null);
    } catch (err) {
      setDeleteError(errorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  const vehicleName = (id: number) => {
    const vehicle = vehicles.find((v) => v.id === id);
    return vehicle ? `${vehicle.name} • ${vehicle.model}` : "خودرو";
  };

  const hasVehicles = vehicles.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-foreground">سفرهای من</h1>
          <p className="text-sm leading-7 text-muted-foreground">
            سفرهات رو ثبت کن تا همسفرها بتونن بهت ملحق بشن.
          </p>
        </div>
        {loadState === "ready" && hasVehicles ? (
          <Button onClick={openAdd} className="gap-1.5 rounded-xl">
            <Plus className="size-4" />
            ثبت سفر
          </Button>
        ) : null}
      </div>

      {loadState === "loading" ? (
        <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-16">
          <Loader2 className="size-6 animate-spin text-brand-600" />
        </div>
      ) : loadState === "error" ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
          <p className="text-sm leading-7 text-muted-foreground">
            دریافت فهرست سفرها با مشکل مواجه شد.
          </p>
          <Button variant="outline" onClick={load} className="rounded-xl">
            تلاش دوباره
          </Button>
        </div>
      ) : !hasVehicles ? (
        // Driver gating: only users with at least one vehicle can post trips.
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
            <Car className="size-7" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-foreground">
              برای ثبت سفر اول باید خودرو اضافه کنی
            </p>
            <p className="mx-auto max-w-sm text-sm leading-7 text-muted-foreground">
              فقط رانندگانی که حداقل یک خودرو ثبت کردن می‌تونن سفر بذارن.
            </p>
          </div>
          <Link
            href="/dashboard/vehicles"
            className={cn(buttonVariants(), "h-9 gap-1.5 rounded-xl px-4")}
          >
            <Plus className="size-4" />
            افزودن خودرو
          </Link>
        </div>
      ) : trips.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 px-6 py-14 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
            <Route className="size-7" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-foreground">هنوز سفری ثبت نکردی</p>
            <p className="mx-auto max-w-sm text-sm leading-7 text-muted-foreground">
              اولین سفرت رو ثبت کن تا همسفرها بتونن پیداش کنن.
            </p>
          </div>
          <Button onClick={openAdd} className="gap-1.5 rounded-xl">
            <Plus className="size-4" />
            ثبت سفر
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {trips.map((trip) => {
            const markers: MapMarker[] = [
              {
                id: "origin",
                lat: trip.origin.lat,
                lng: trip.origin.lng,
                color: ORIGIN_COLOR,
              },
              {
                id: "destination",
                lat: trip.destination.lat,
                lng: trip.destination.lng,
                color: DESTINATION_COLOR,
              },
            ];
            return (
              <li key={trip.id}>
                <Card className="gap-0 overflow-hidden p-0">
                  <NeshanMap
                    markers={markers}
                    interactive={false}
                    fitToMarkers
                    className="h-40 w-full"
                    ariaLabel="پیش‌نمایش مسیر سفر"
                  />
                  <div className="flex flex-col gap-4 p-5">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <CalendarClock className="size-4 text-brand-600" />
                      {formatJalaliDateTime(trip.departure_at)}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Car className="size-3.5" />
                        {vehicleName(trip.vehicle_id)}
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <Armchair className="size-3.5" />
                        {toPersianDigits(trip.empty_seats)} صندلی خالی
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <Users className="size-3.5" />
                        {toPersianDigits(trip.passengers_count)} همسفر
                      </Badge>
                      <Badge
                        variant={trip.trunk_empty ? "secondary" : "outline"}
                        className="gap-1"
                      >
                        <Luggage className="size-3.5" />
                        {trip.trunk_empty ? "صندوق خالی" : "صندوق پر"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 border-t border-border pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(trip)}
                        className="gap-1.5 rounded-lg"
                      >
                        <Pencil className="size-3.5" />
                        ویرایش
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeleteError(null);
                          setPendingDelete(trip);
                        }}
                        className="gap-1.5 rounded-lg text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-3.5" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <TripFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        vehicles={vehicles}
        trip={editing}
        onSaved={handleSaved}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!deleting && !open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف سفر</AlertDialogTitle>
            <AlertDialogDescription>
              مطمئنی می‌خوای این سفر رو حذف کنی؟ این کار قابل بازگشت نیست و
              همسفرها مطلع می‌شن.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? (
            <p className="text-sm text-destructive" role="alert">
              {deleteError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingDelete(null)}
              disabled={deleting}
              className="rounded-xl"
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
              className="gap-1.5 rounded-xl"
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {deleting ? "در حال حذف…" : "حذف سفر"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
