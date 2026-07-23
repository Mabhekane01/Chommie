/**
 * South African cultural & financial calendar — a first-class discovery signal
 * (do.md §3.5, docs/discovery-algorithm.md §6). The calendar surfaces relevant
 * bulk staples *ahead of* known high-demand moments rather than during them.
 *
 * Pure functions, no I/O — trivially testable and cheap to run per request.
 */

export interface ActiveMoment {
  key: string;
  label: string;
  /** 0..1 — how active/close the moment is (includes look-ahead so we surface early). */
  proximity: number;
  /** Weight applied to staple items during this moment. */
  staplesWeight: number;
  /** Optional per-category weights for non-staples (e.g. festive discretionary). */
  categoryWeights?: Record<string, number>;
}

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Easter Sunday via the Anonymous Gregorian algorithm (Meeus/Jones/Butcher). */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

const daysBetween = (a: Date, b: Date) =>
  Math.round((a.getTime() - b.getTime()) / 86_400_000);

/**
 * Month-end / payday: ramps up over the last ~6 days of the month (surface early),
 * peaks on the last day, and spills into the first two days (grant/SASSA payouts).
 */
function monthEndProximity(date: Date): number {
  const y = date.getFullYear();
  const mo = date.getMonth();
  const lastDay = new Date(y, mo + 1, 0).getDate();
  const dom = date.getDate();
  const daysToEnd = lastDay - dom;
  if (daysToEnd <= 6) return clamp01(1 - (daysToEnd / 6) * 0.6); // 6 days out=0.4 → last day=1.0
  if (dom <= 2) return dom === 1 ? 0.8 : 0.6; // payday spillover
  return 0;
}

/** Festive bulk buying: late-Nov ramp, December peak ~15–24 (stokvel year-end payouts). */
function festiveProximity(date: Date): number {
  const mo = date.getMonth();
  const dom = date.getDate();
  if (mo === 10 && dom >= 15) return clamp01(0.3 + ((dom - 15) / 15) * 0.3); // Nov 15–30
  if (mo === 11) return clamp01(1 - Math.abs(dom - 20) / 20); // December, peak ~20th
  return 0;
}

/** Back-to-school household shift: early Jan and mid-year (July). */
function backToSchoolProximity(date: Date): number {
  const mo = date.getMonth();
  const dom = date.getDate();
  if (mo === 0 && dom >= 3 && dom <= 15) return 0.6;
  if (mo === 6 && dom >= 8 && dom <= 20) return 0.55;
  return 0;
}

/** Easter window (±5 days) — regional staples uplift. */
function easterProximity(date: Date): number {
  const dist = Math.abs(daysBetween(date, easterSunday(date.getFullYear())));
  return dist <= 5 ? clamp01(0.7 * (1 - dist / 5)) : 0;
}

/** Heritage Day (24 Sep, ±3 days) — braai/ceremony catering staples. */
function heritageProximity(date: Date): number {
  const dist = Math.abs(daysBetween(date, new Date(date.getFullYear(), 8, 24)));
  return dist <= 3 ? clamp01(0.6 * (1 - dist / 3)) : 0;
}

/** Returns the currently active/upcoming SA moments for a date (and optionally region). */
export function getActiveMoments(date: Date, _region?: string): ActiveMoment[] {
  const defs: Array<[string, string, number, number]> = [
    ['month_end', 'Month-end staples run', monthEndProximity(date), 1.0],
    ['festive', 'Festive-season bulk buying', festiveProximity(date), 1.0],
    ['back_to_school', 'Back-to-school stock-up', backToSchoolProximity(date), 0.6],
    ['easter', 'Easter', easterProximity(date), 0.7],
    ['heritage', 'Heritage Day', heritageProximity(date), 0.6],
  ];
  return defs
    .filter(([, , proximity]) => proximity > 0)
    .map(([key, label, proximity, staplesWeight]) => ({ key, label, proximity, staplesWeight }))
    .sort((a, b) => b.proximity - a.proximity);
}

/** Calendar relevance for a single product against the active moments (0..1). */
export function calendarRelevance(
  isStaple: boolean,
  category: string,
  moments: ActiveMoment[],
): { value: number; momentKey?: string; label?: string } {
  let best = 0;
  let momentKey: string | undefined;
  let label: string | undefined;
  for (const m of moments) {
    const w = isStaple ? m.staplesWeight : m.categoryWeights?.[category] ?? 0.15;
    const v = m.proximity * w;
    if (v > best) {
      best = v;
      momentKey = m.key;
      label = m.label;
    }
  }
  return { value: clamp01(best), momentKey, label };
}
