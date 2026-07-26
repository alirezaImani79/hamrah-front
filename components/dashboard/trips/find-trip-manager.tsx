"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type DateObject } from "react-multi-date-picker";
import { Loader2, RotateCw, Search, Square } from "lucide-react";

import { ApiError, type Trip } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { errorMessage } from "@/lib/errors";
import { toPersianDigits } from "@/lib/format";
import { isFuture, toBackendDateTime } from "@/lib/datetime";
import {
  matchTrips,
  type DriverGender,
  type MatchedTrip,
  type MatchTripInput,
} from "@/lib/trips";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/onboarding/field";
import { Select } from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  RouteMapPicker,
  type RoutePoint,
} from "@/components/map/route-map-picker";
import { MatchedTripCard } from "@/components/dashboard/trips/matched-trip-card";

/** 5s polling cadence for re-running /trips/match while searching. */
const POLL_INTERVAL_MS = 5000;

type FormState = {
  origin: RoutePoint | null;
  destination: RoutePoint | null;
  departure: DateObject | null;
  requestedSeats: string;
  /** Select value: "any" means no driver-gender preference. */
  driverGender: "any" | DriverGender;
};

type FieldKey = "route" | "departure" | "seats";
type FieldErrors = Partial<Record<FieldKey, string>>;

const EMPTY_FORM: FormState = {
  origin: null,
  destination: null,
  departure: null,
  requestedSeats: "1",
  driverGender: "any",
};

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.origin || !form.destination)
    errors.route = "مبدأ و مقصد رو روی نقشه مشخص کن.";
  if (!form.departure) errors.departure = "تاریخ و ساعت حرکت رو انتخاب کن.";
  else if (!isFuture(toBackendDateTime(form.departure)))
    errors.departure = "زمان حرکت باید در آینده باشه.";

  const seats = Number(form.requestedSeats);
  if (
    !form.requestedSeats ||
    !Number.isInteger(seats) ||
    seats < 1 ||
    seats > 4
  )
    errors.seats = "تعداد صندلی باید عددی بین ۱ تا ۴ باشه.";

  return errors;
}

/** Maps backend 422 field keys onto the form's grouped error keys. */
function mapApiErrors(err: ApiError): FieldErrors {
  const mapped: FieldErrors = {};
  const route =
    err.fieldError("origin_lat") ??
    err.fieldError("origin_lng") ??
    err.fieldError("destination_lat") ??
    err.fieldError("destination_lng");
  if (route) mapped.route = route;
  const departure = err.fieldError("departure_at");
  if (departure) mapped.departure = departure;
  const seats = err.fieldError("requested_seats");
  if (seats) mapped.seats = seats;
  return mapped;
}

function buildInput(form: FormState): MatchTripInput | null {
  if (!form.origin || !form.destination || !form.departure) return null;
  const input: MatchTripInput = {
    origin_lat: form.origin.lat,
    origin_lng: form.origin.lng,
    destination_lat: form.destination.lat,
    destination_lng: form.destination.lng,
    departure_at: toBackendDateTime(form.departure),
    requested_seats: Number(form.requestedSeats),
  };
  // Omit driver_gender entirely for "no preference" (don't send null).
  if (form.driverGender !== "any") input.driver_gender = form.driverGender;
  return input;
}

const SEAT_ITEMS = [1, 2, 3, 4].map((n) => ({
  value: String(n),
  label: `${toPersianDigits(n)} صندلی`,
}));

const GENDER_ITEMS = [
  { value: "any", label: "بدون اولویت" },
  { value: "male", label: "آقا" },
  { value: "female", label: "خانم" },
];

export function FindTripManager() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [phase, setPhase] = useState<"idle" | "searching">("idle");
  const [results, setResults] = useState<MatchedTrip[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Snapshot of the request we're polling for, so the interval never reads
  // stale form state.
  const inputRef = useRef<MatchTripInput | null>(null);

  const searching = phase === "searching";
  const hasResults = results.length > 0;

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

  // One poll tick. Stable (only uses setState setters) so it can safely be a
  // dependency of the polling effect.
  const poll = useCallback(
    async (token: string, input: MatchTripInput) => {
      setIsFetching(true);
      try {
        const data = await matchTrips(token, input);
        setResults(data);
        setSearchError(null);
      } catch (err) {
        // A 422 means the request itself is invalid (e.g. bad departure) —
        // re-polling won't help, so stop and flag the offending fields.
        if (err instanceof ApiError && err.status === 422) {
          const mapped = mapApiErrors(err);
          setErrors(mapped);
          setFormError(
            Object.keys(mapped).length === 0 ? errorMessage(err) : null,
          );
          setPhase("idle");
        } else {
          // Transient failure — keep showing whatever we have and keep polling.
          setSearchError(errorMessage(err));
        }
      } finally {
        setIsFetching(false);
      }
    },
    [],
  );

  // Arm/disarm the 5s poller with the search phase. Fires once immediately,
  // then every POLL_INTERVAL_MS; cleans up on stop or unmount.
  useEffect(() => {
    if (phase !== "searching") return;
    const input = inputRef.current;
    if (!input) return;

    const firstToken = getToken();
    if (firstToken) void poll(firstToken, input);

    const id = window.setInterval(() => {
      const token = getToken();
      if (!token) {
        setSearchError("نشستت منقضی شده؛ برای ادامه دوباره وارد شو.");
        setPhase("idle");
        return;
      }
      void poll(token, input);
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [phase, poll]);

  function start() {
    const found = validate(form);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }
    const token = getToken();
    if (!token) {
      setFormError("نشستت منقضی شده؛ برای ادامه دوباره وارد شو.");
      return;
    }
    const input = buildInput(form);
    if (!input) return;

    inputRef.current = input;
    setErrors({});
    setFormError(null);
    setSearchError(null);
    setResults([]);
    setPhase("searching");
  }

  function stop() {
    setPhase("idle");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    start();
  }

  function handleJoined(trip: Trip) {
    // Once joined, the trip is the user's own — drop it from suggestions.
    setResults((prev) => prev.filter((t) => t.id !== trip.id));
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-2xl font-bold text-foreground">
          پیداکردن سفر
        </h1>
        <p className="text-sm leading-7 text-muted-foreground">
          ترجیحاتت رو مشخص کن تا سفرهای مناسب رو پیدا کنیم و لحظه‌به‌لحظه بهت
          نشون بدیم.
        </p>
      </header>

      {!searching ? (
        <Card className="gap-4 p-5 sm:p-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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

            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="تاریخ و ساعت حرکت"
                htmlFor="find-departure"
                error={errors.departure}
              >
                <DateTimePicker
                  id="find-departure"
                  value={form.departure}
                  onChange={(departure) => update({ departure }, "departure")}
                  minDate={new Date()}
                  invalid={Boolean(errors.departure)}
                />
              </Field>

              <Field
                label="تعداد صندلی"
                htmlFor="find-seats"
                error={errors.seats}
              >
                <Select
                  id="find-seats"
                  value={form.requestedSeats}
                  onValueChange={(value) => update({ requestedSeats: value }, "seats")}
                  items={SEAT_ITEMS}
                  invalid={Boolean(errors.seats)}
                />
              </Field>

              <Field label="اولویت راننده" htmlFor="find-gender">
                <Select
                  id="find-gender"
                  value={form.driverGender}
                  onValueChange={(value) =>
                    update({
                      driverGender: value as FormState["driverGender"],
                    })
                  }
                  items={GENDER_ITEMS}
                />
              </Field>
            </div>

            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Button
                type="submit"
                className="h-11 gap-1.5 rounded-xl font-semibold"
              >
                <Search className="size-4" />
                جستجوی سفر
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {searching && !hasResults ? (
        <Card className="p-10">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="size-8 animate-spin text-brand-600" />
            <p className="text-base font-medium text-foreground">
              در حال جستجوی سفرهای مناسب…
            </p>
            <p className="text-sm leading-7 text-muted-foreground">
              هر چند ثانیه سفرهای جدید رو بررسی می‌کنیم.
            </p>
            {searchError ? (
              <p className="text-sm leading-7 text-destructive" role="status">
                آخرین تلاش ناموفق بود ({searchError})؛ تا چند ثانیه دیگر دوباره
                تلاش می‌شود.
              </p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={stop}
              className="mt-1 gap-1.5 rounded-lg"
            >
              <Square className="size-4" />
              توقف جستجو
            </Button>
          </div>
        </Card>
      ) : hasResults ? (
        <section className="flex flex-col gap-4">
          {searching ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-sm text-brand-800">
              {isFetching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <span className="size-2 animate-pulse rounded-full bg-brand-500" />
              )}
              <span className="font-medium">در حال جستجو…</span>
              <span className="text-brand-700/80">
                سفرهای جدید رو لحظه‌به‌لحظه می‌بینی.
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={stop}
                className="ms-auto gap-1.5 rounded-lg"
              >
                <Square className="size-3.5" />
                توقف جستجو
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              <span>جستجو متوقف شد.</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={start}
                className="ms-auto gap-1.5 rounded-lg"
              >
                <RotateCw className="size-3.5" />
                شروع دوباره جستجو
              </Button>
            </div>
          )}

          {searchError && hasResults ? (
            <p className="text-sm text-destructive" role="status">
              به‌روزرسانی ناموفق بود: {searchError}
            </p>
          ) : null}

          <ul className="grid gap-4 lg:grid-cols-2">
            {results.map((trip) => (
              <li key={trip.id}>
                <MatchedTripCard trip={trip} onJoined={handleJoined} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
