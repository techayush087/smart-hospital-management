/** Pure, immutable array helpers. */

/** Groups array items into a record keyed by the stringified value at `key`. */
export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce(
    (acc, item) => {
      const k = String(item[key]);
      (acc[k] ??= []).push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}

/** Returns items with the first occurrence of each `key` value, preserving order. */
export function uniqueBy<T>(arr: T[], key: keyof T): T[] {
  const seen = new Set<unknown>();
  return arr.filter((i) => {
    const k = i[key];
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Returns a new array sorted by a date-valued `key`, ascending by default. */
export function sortByDate<T>(arr: T[], key: keyof T, dir: 'asc' | 'desc' = 'asc'): T[] {
  return [...arr].sort((a, b) => {
    const d = new Date(a[key] as string).getTime() - new Date(b[key] as string).getTime();
    return dir === 'asc' ? d : -d;
  });
}
