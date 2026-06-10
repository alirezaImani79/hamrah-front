// ──────────────────────────────────────────────────────────────────────────
// Single source of truth for the launch moment.
//
// 👉 To change the launch date, edit ONLY this line. ISO 8601 with an explicit
//    Tehran offset (+03:30) so the target is unambiguous regardless of where
//    the server or visitor's browser is located.
// ──────────────────────────────────────────────────────────────────────────
export const LAUNCH_DATE = new Date("2026-07-03T08:00:00+03:30");

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export const ZERO_TIME: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

/** Remaining time until `target`, clamped at zero (never negative). */
export function getTimeLeft(target: Date, now: number = Date.now()): TimeLeft {
  const diff = Math.max(0, target.getTime() - now);
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** True once the launch moment has passed. */
export function hasLaunched(target: Date, now: number = Date.now()): boolean {
  return now >= target.getTime();
}
