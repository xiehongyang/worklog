/** Date helpers. The app stores calendar days as ISO `YYYY-MM-DD` strings and months as `YYYY-MM`. */

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayIso(now: () => Date = () => new Date()): string {
  return toIsoDate(now());
}

/** `2026-10-05` -> `2026-10` */
export function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}
