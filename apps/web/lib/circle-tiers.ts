/**
 * Circle discount tiers (do.md §3.3). Mirrors the thresholds in
 * circle-service/src/circle/circle.service.ts — the server remains the
 * authority; this exists so the UI can show members what the next tier costs
 * them in recruits.
 */
export const CIRCLE_TIERS = [
  { tier: 'CIRCLE_BRONZE', label: 'Bronze', minMembers: 3, pct: 3 },
  { tier: 'CIRCLE_SILVER', label: 'Silver', minMembers: 6, pct: 5 },
  { tier: 'CIRCLE_GOLD', label: 'Gold', minMembers: 11, pct: 8 },
] as const;

export interface TierProgress {
  /** The tier above the current one, or null once Gold is reached. */
  next: (typeof CIRCLE_TIERS)[number] | null;
  /** Members still needed to reach `next`. */
  needed: number;
  /** 0–1 progress toward `next`, for the bar. */
  fraction: number;
}

export function tierProgress(memberCount: number): TierProgress {
  const next = CIRCLE_TIERS.find((t) => memberCount < t.minMembers) ?? null;
  if (!next) return { next: null, needed: 0, fraction: 1 };

  // Progress is measured from the previous threshold, so a circle that just
  // hit Bronze doesn't appear to be most of the way to Silver already.
  const prevMin = [...CIRCLE_TIERS].reverse().find((t) => memberCount >= t.minMembers)?.minMembers ?? 0;
  const span = next.minMembers - prevMin;
  return {
    next,
    needed: next.minMembers - memberCount,
    fraction: span > 0 ? Math.min(1, Math.max(0, (memberCount - prevMin) / span)) : 0,
  };
}
