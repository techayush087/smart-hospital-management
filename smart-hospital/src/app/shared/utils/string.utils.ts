/** Pure string formatting helpers. */

/** Uppercases the first character; returns falsy input unchanged. */
export function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/** Converts arbitrary text into a lowercase, hyphenated url slug. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Truncates to `max` characters, appending an ellipsis when shortened. */
export function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max).trimEnd() + '…' : s;
}

/** Returns up to two uppercased initials from a full name. */
export function initials(fullName: string): string {
  return fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}
