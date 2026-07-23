/**
 * Types for the Chommie Discovery Engine ("Ubuntu Discovery").
 * See docs/discovery-algorithm.md — this file implements Phase 1 (deterministic core).
 */

export interface DiscoveryContext {
  userId?: string;
  /** Member region / township, e.g. "Khayelitsha", "Gauteng". Powers geo weighting. */
  region?: string;
  circleId?: string;
  /** Optional search / browse intent. */
  query?: string;
  /** ISO date; defaults to now. Lets us preview calendar behaviour for any date. */
  date?: string;
  limit?: number;

  // --- Pluggable signals. Empty until orders/circles are wired; the engine
  //     degrades gracefully without them (docs/discovery-algorithm.md §0.4). ---

  /** SKUs in the member's standing basket → Route A replenishment. */
  standingBasketSkus?: string[];
  /** sku → 0..1 co-purchase strength within the member's circle → Route B. */
  circleSkuAffinity?: Record<string, number>;
}

export interface ScoreBreakdown {
  replenishment: number;
  circle: number;
  calendar: number;
  savings: number;
  locality: number;
  reliability: number;
  stock: number;
  /** Sponsored-placement contribution — ALWAYS 0 for staples (do.md §3.6 guardrail). */
  ad: number;
  /** 1 if the item was promoted by the Black-owned/local tie-break, else 0. */
  blackOwnedBoost: number;
  total: number;
}

export interface DiscoveryItem {
  product: any;
  score: number;
  breakdown: ScoreBreakdown;
  /** True only for a sponsored marketplace-tier item (never a staple). */
  sponsored?: boolean;
  /** Human-readable "why" — drives the UI and seeds the future LLM rationale (Phase 3). */
  reasons: string[];
}

export interface DiscoveryResult {
  generatedAt: string;
  context: DiscoveryContext;
  activeMoments: { key: string; label: string; proximity: number }[];
  /** True when the grounded LLM re-rank (Phase 3) was applied on top of the deterministic order. */
  llmApplied?: boolean;
  items: DiscoveryItem[];
}
