"use client";

import { useEffect, useState } from "react";
import {
  LAUNCH_DATE,
  ZERO_TIME,
  getTimeLeft,
  type TimeLeft,
} from "@/lib/launch";

const UNITS: { key: keyof TimeLeft; label: string }[] = [
  { key: "days", label: "روز" },
  { key: "hours", label: "ساعت" },
  { key: "minutes", label: "دقیقه" },
  { key: "seconds", label: "ثانیه" },
];

/** Persian (Farsi) digits, always two characters wide. */
function toFa(n: number): string {
  return n.toLocaleString("fa-IR", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
}

export default function CountdownTimer() {
  // `mounted` keeps the server render and the FIRST client render identical
  // (both show zeros) so hydration never mismatches. Live time begins only
  // after useEffect runs, which is client-only and post-hydration.
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(ZERO_TIME);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeLeft(LAUNCH_DATE));
    const id = setInterval(() => setTimeLeft(getTimeLeft(LAUNCH_DATE)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    // dir="ltr" keeps the unit order days → hours → minutes → seconds — the
    // conventional countdown reading order — even inside the RTL page.
    <div
      dir="ltr"
      aria-live="polite"
      className="flex items-stretch justify-center gap-2 sm:gap-3"
    >
      {UNITS.map(({ key, label }, i) => (
        <div key={key} className="flex items-stretch gap-2 sm:gap-3">
          <div className="flex min-w-[4.25rem] flex-col items-center rounded-2xl border border-brand-100 bg-card/90 px-3 py-3 shadow-lg shadow-brand-900/5 backdrop-blur-sm sm:min-w-20">
            <span
              suppressHydrationWarning
              className="text-3xl font-extrabold tabular-nums text-brand-700 sm:text-4xl"
            >
              {toFa(mounted ? timeLeft[key] : 0)}
            </span>
            <span className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
              {label}
            </span>
          </div>
          {i < UNITS.length - 1 ? (
            <span className="self-center text-2xl font-bold text-brand-300 sm:text-3xl">
              :
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
