/**
 * Pure date/time helper utilities. All functions are side-effect free and
 * operate on ISO-8601 date strings or native `Date` objects.
 */

/** Returns the `YYYY-MM-DD` (UTC) portion of a Date. */
export function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** True when the given ISO date string falls on the current calendar day. */
export function isToday(dateStr: string): boolean {
  return toISODate(new Date(dateStr)) === toISODate(new Date());
}

/** Returns a new Date offset by `days` (may be negative); does not mutate input. */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Formats an ISO date string as e.g. `Jun 9, 2026`. */
export function formatDisplayDate(dateStr: string, _format?: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Returns an inclusive array of ISO date strings between `start` and `end`. */
export function getDateRange(start: string, end: string): string[] {
  const out: string[] = [];
  let cur = new Date(start);
  const last = new Date(end);
  while (cur <= last) {
    out.push(toISODate(cur));
    cur = addDays(cur, 1);
  }
  return out;
}

/** True when the given ISO date string is strictly in the past. */
export function isDateInPast(dateStr: string): boolean {
  return new Date(dateStr).getTime() < Date.now();
}

/** Formats a minute count as a compact human duration, e.g. `1h 30m`. */
export function minutesToDurationString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? (m ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}
