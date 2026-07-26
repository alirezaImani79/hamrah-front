"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Route, Search } from "lucide-react";

import { type Trip } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { listOngoingTrips, listUpcomingTrips } from "@/lib/trips";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { TripCard } from "@/components/dashboard/trips/trip-card";

type LoadState = "loading" | "ready" | "error";

/**
 * The dashboard's live trips section. Loads the user's ongoing and upcoming
 * trips (as driver or passenger) in parallel and renders them under separate
 * headings, with loading / error / empty states. A cancelled trip is dropped
 * from both lists in-place — no refetch needed.
 */
export function DashboardTrips() {
  const [ongoing, setOngoing] = useState<Trip[]>([]);
  const [upcoming, setUpcoming] = useState<Trip[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  async function load() {
    const token = getToken();
    if (!token) {
      setLoadState("error");
      return;
    }
    setLoadState("loading");
    try {
      const [ongoingTrips, upcomingTrips] = await Promise.all([
        listOngoingTrips(token),
        listUpcomingTrips(token),
      ]);
      setOngoing(ongoingTrips);
      setUpcoming(upcomingTrips);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  function handleCancelled(id: number) {
    setOngoing((prev) => prev.filter((t) => t.id !== id));
    setUpcoming((prev) => prev.filter((t) => t.id !== id));
  }

  const hasAny = ongoing.length > 0 || upcoming.length > 0;

  if (loadState === "loading") {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-16">
        <Loader2 className="size-6 animate-spin text-brand-600" />
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
        <p className="text-sm leading-7 text-muted-foreground">
          دریافت سفرهای فعال با مشکل مواجه شد.
        </p>
        <Button variant="outline" onClick={load} className="rounded-xl">
          تلاش دوباره
        </Button>
      </div>
    );
  }

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 px-6 py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
          <Route className="size-7" />
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-semibold text-foreground">فعلاً سفر فعالی نداری</p>
          <p className="mx-auto max-w-sm text-sm leading-7 text-muted-foreground">
            می‌تونی یه سفر جدید ثبت کنی یا بین سفرهای موجود به‌دنبال هم‌سفر
            بگردی.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/dashboard/find-trip"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-9 gap-1.5 rounded-xl px-4",
            )}
          >
            <Search className="size-4" />
            یافتن سفر
          </Link>
          <Link
            href="/dashboard/trips"
            className={cn(buttonVariants(), "h-9 gap-1.5 rounded-xl px-4")}
          >
            <Plus className="size-4" />
            ثبت سفر
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {ongoing.length > 0 ? (
        <TripSection
          title="در حال انجام"
          trips={ongoing}
          onCancelled={handleCancelled}
        />
      ) : null}
      {upcoming.length > 0 ? (
        <TripSection
          title="در پیش رو"
          trips={upcoming}
          onCancelled={handleCancelled}
        />
      ) : null}
    </div>
  );
}

function TripSection({
  title,
  trips,
  onCancelled,
}: {
  title: string;
  trips: Trip[];
  onCancelled: (id: number) => void;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-lg font-semibold text-foreground">
        {title}
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {trips.map((trip) => (
          <li key={trip.id}>
            <TripCard trip={trip} onCancelled={onCancelled} />
          </li>
        ))}
      </ul>
    </section>
  );
}
