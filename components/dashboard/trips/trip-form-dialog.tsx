"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { type DateObject } from "react-multi-date-picker";

import { ApiError, type Trip, type Vehicle } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { toLatinDigits, toPersianDigits } from "@/lib/format";
import { toBackendDateTime, fromBackendDateTime, isFuture } from "@/lib/datetime";
import { createTrip, updateTrip, type TripInput } from "@/lib/trips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/onboarding/field";
import { RouteMapPicker, type RoutePoint } from "@/components/map/route-map-picker";

type FormState = {
  vehicleId: string;
  origin: RoutePoint | null;
  destination: RoutePoint | null;
  departure: DateObject | null;
  emptySeats: string;
  trunkEmpty: boolean;
};

type FieldKey = "vehicleId" | "route" | "departure" | "emptySeats";
type FieldErrors = Partial<Record<FieldKey, string>>;

const EMPTY_FORM: FormState = {
  vehicleId: "",
  origin: null,
  destination: null,
  departure: null,
  emptySeats: "",
  trunkEmpty: true,
};

function toFormState(trip: Trip): FormState {
  return {
    vehicleId: String(trip.vehicle_id),
    origin: trip.origin,
    destination: trip.destination,
    departure: fromBackendDateTime(trip.departure_at),
    emptySeats: String(trip.empty_seats),
    trunkEmpty: trip.trunk_empty,
  };
}

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.vehicleId) errors.vehicleId = "خودروی سفر رو انتخاب کن.";
  if (!form.origin || !form.destination)
    errors.route = "مبدأ و مقصد رو روی نقشه مشخص کن.";
  if (!form.departure) errors.departure = "تاریخ و ساعت حرکت رو انتخاب کن.";
  else if (!isFuture(toBackendDateTime(form.departure)))
    errors.departure = "زمان حرکت باید در آینده باشه.";

  const seats = Number(form.emptySeats);
  if (!form.emptySeats.trim()) errors.emptySeats = "تعداد صندلی خالی رو وارد کن.";
  else if (!Number.isInteger(seats) || seats < 1 || seats > 100)
    errors.emptySeats = "تعداد صندلی باید عددی بین ۱ تا ۱۰۰ باشه.";

  return errors;
}

/** Maps backend 422 field keys onto the form's grouped error keys. */
function mapApiErrors(err: ApiError): FieldErrors {
  const mapped: FieldErrors = {};
  const vehicle = err.fieldError("vehicle_id");
  if (vehicle) mapped.vehicleId = vehicle;
  const route =
    err.fieldError("origin_lat") ??
    err.fieldError("origin_lng") ??
    err.fieldError("destination_lat") ??
    err.fieldError("destination_lng");
  if (route) mapped.route = route;
  const departure = err.fieldError("departure_at");
  if (departure) mapped.departure = departure;
  const seats = err.fieldError("empty_seats");
  if (seats) mapped.emptySeats = seats;
  return mapped;
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
  /** Present → edit mode; absent → create mode. */
  trip?: Trip | null;
  onSaved: (trip: Trip) => void;
};

export function TripFormDialog({
  open,
  onOpenChange,
  vehicles,
  trip,
  onSaved,
}: Props) {
  const isEdit = Boolean(trip);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(
      trip
        ? toFormState(trip)
        : {
            ...EMPTY_FORM,
            // Pre-select the only vehicle when there's just one.
            vehicleId: vehicles.length === 1 ? String(vehicles[0].id) : "",
          },
    );
    setErrors({});
    setSubmitError(null);
  }, [open, trip, vehicles]);

  function update(patch: Partial<FormState>, clear?: FieldKey) {
    setForm((prev) => ({ ...prev, ...patch }));
    if (clear) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[clear];
        return next;
      });
    }
  }

  async function handleSubmit() {
    if (submitting) return;

    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    const token = getToken();
    if (!token) {
      setSubmitError("نشستت منقضی شده؛ برای ادامه دوباره وارد شو.");
      return;
    }

    // validate() guarantees these are present.
    const payload: TripInput = {
      vehicle_id: Number(form.vehicleId),
      origin_lat: form.origin!.lat,
      origin_lng: form.origin!.lng,
      destination_lat: form.destination!.lat,
      destination_lng: form.destination!.lng,
      departure_at: toBackendDateTime(form.departure!),
      empty_seats: Number(form.emptySeats),
      trunk_empty: form.trunkEmpty,
    };

    setSubmitError(null);
    setSubmitting(true);
    try {
      const saved =
        trip != null
          ? await updateTrip(token, trip.id, payload)
          : await createTrip(token, payload);
      onSaved(saved);
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 422 && err.errors) {
        const mapped = mapApiErrors(err);
        setErrors(mapped);
        if (Object.keys(mapped).length === 0) setSubmitError(errorMessage(err));
        return;
      }
      setSubmitError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  const vehicleItems = vehicles.map((v) => ({
    value: String(v.id),
    label: `${v.name} • ${v.model}`,
  }));

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!submitting) onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "ویرایش سفر" : "ثبت سفر جدید"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "اطلاعات سفرت رو به‌روزرسانی کن."
              : "مبدأ و مقصد، زمان حرکت و جزئیات سفرت رو مشخص کن."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <Field label="خودرو" htmlFor="trip-vehicle" error={errors.vehicleId}>
            <Select
              id="trip-vehicle"
              value={form.vehicleId || null}
              onValueChange={(value) => update({ vehicleId: value }, "vehicleId")}
              items={vehicleItems}
              placeholder="خودروی سفر رو انتخاب کن"
              invalid={Boolean(errors.vehicleId)}
            />
          </Field>

          <Field label="مبدأ و مقصد" error={errors.route} required>
            <RouteMapPicker
              origin={form.origin}
              destination={form.destination}
              onChange={(next) =>
                update(
                  { origin: next.origin, destination: next.destination },
                  "route",
                )
              }
            />
          </Field>

          <Field
            label="تاریخ و ساعت حرکت"
            htmlFor="trip-departure"
            error={errors.departure}
          >
            <DateTimePicker
              id="trip-departure"
              value={form.departure}
              onChange={(departure) => update({ departure }, "departure")}
              minDate={new Date()}
              invalid={Boolean(errors.departure)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="صندلی خالی"
              htmlFor="trip-seats"
              error={errors.emptySeats}
            >
              <Input
                id="trip-seats"
                dir="ltr"
                inputMode="numeric"
                maxLength={3}
                value={toPersianDigits(form.emptySeats)}
                onChange={(e) =>
                  update(
                    {
                      emptySeats: toLatinDigits(e.target.value)
                        .replace(/\D/g, "")
                        .slice(0, 3),
                    },
                    "emptySeats",
                  )
                }
                placeholder="۳"
                aria-invalid={Boolean(errors.emptySeats)}
                className="h-11 rounded-xl bg-card px-3.5 text-center text-base"
              />
            </Field>

            <Field label="وضعیت صندوق عقب" required={false}>
              <label
                htmlFor="trip-trunk"
                className="flex h-11 cursor-pointer items-center justify-between gap-3 rounded-xl border border-input bg-card px-3.5"
              >
                <span className="text-sm text-foreground">
                  {form.trunkEmpty ? "صندوق خالیه" : "صندوق پره"}
                </span>
                <Switch
                  id="trip-trunk"
                  checked={form.trunkEmpty}
                  onCheckedChange={(checked) => update({ trunkEmpty: checked })}
                />
              </label>
            </Field>
          </div>

          {submitError ? (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          ) : null}

          <DialogFooter className="mt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="h-11 rounded-xl"
            >
              انصراف
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="h-11 gap-1.5 rounded-xl font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  در حال ذخیره…
                </>
              ) : isEdit ? (
                "ذخیره تغییرات"
              ) : (
                "ثبت سفر"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
