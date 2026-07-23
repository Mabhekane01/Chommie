import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout } from 'rxjs';
import {
  DiscoveryContext,
  DiscoveryItem,
  DiscoveryResult,
  ScoreBreakdown,
} from './discovery.types';
import { getActiveMoments, calendarRelevance, ActiveMoment } from './sa-calendar';
import { isStapleProduct } from './staples';
import { LlmReranker, LlmRerankResult } from './llm-reranker';

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/**
 * Discovery Engine — Phase 1 (deterministic core). Cascading pipeline:
 * candidate generation → transparent weighted ranker (with guardrails) →
 * near-tie Black-owned/local promotion. LLM re-rank (Phase 3) layers on top later.
 * See docs/discovery-algorithm.md.
 */
@Injectable()
export class DiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);

  /** Signal weights. Hand-tuned for launch; replaced by a learned ranker in Phase 4. */
  private readonly W = {
    replenishment: 0.28,
    circle: 0.22,
    calendar: 0.18,
    savings: 0.2,
    locality: 0.06,
    reliability: 0.04,
    stock: 0.02,
    // Sponsored placement — marketplace tier only; forced to 0 for staples.
    ad: 0.06,
    // Tie-break weight — applied ONLY when items are otherwise near-tied.
    blackOwnedTieBreak: 0.05,
  };

  /** Two items are "tied" when base scores are within this band (auditable fairness lever). */
  private readonly TIE_EPSILON = 0.02;

  /** Phase 3 grounded LLM re-rank; disabled (no-op) when ANTHROPIC_API_KEY is unset. */
  private readonly reranker = new LlmReranker();

  constructor(
    @Inject('PRODUCT_SERVICE') private readonly productClient: ClientProxy,
    @Inject('CIRCLE_SERVICE') private readonly circleClient: ClientProxy,
    @Inject('MEMBERSHIP_SERVICE') private readonly membershipClient: ClientProxy,
    @Inject('AD_SERVICE') private readonly adClient: ClientProxy,
  ) {}

  async getFeed(ctx: DiscoveryContext): Promise<DiscoveryResult> {
    const date = ctx.date ? new Date(ctx.date) : new Date();
    const limit = ctx.limit ?? 24;
    const moments = getActiveMoments(date, ctx.region);

    // Route B: pull real circle co-purchase affinity when a circle is selected.
    // Degrades gracefully — a missing/slow circle-service just means circle=0.
    if (ctx.circleId && !ctx.circleSkuAffinity) {
      try {
        ctx.circleSkuAffinity = await lastValueFrom(
          this.circleClient
            .send({ cmd: 'get_circle_affinity' }, { circleId: ctx.circleId })
            .pipe(timeout(2000)),
        );
      } catch (err) {
        this.logger.warn(`circle affinity unavailable for ${ctx.circleId}: ${err}`);
      }
    }

    // Route A: pull the member's standing-basket SKUs (replenishment, do.md §3.2).
    if (ctx.userId && !ctx.standingBasketSkus) {
      try {
        ctx.standingBasketSkus = await lastValueFrom(
          this.membershipClient
            .send({ cmd: 'get_standing_basket_skus' }, { userId: ctx.userId })
            .pipe(timeout(2000)),
        );
      } catch (err) {
        this.logger.warn(`standing basket unavailable for ${ctx.userId}: ${err}`);
      }
    }

    // Sponsored placements (do.md §3.6) — marketplace tier only. The ranker
    // applies these to non-staples only, so ads can never touch the staples core.
    const sponsored: { map: Record<string, number>; maxBid: number } = { map: {}, maxBid: 0 };
    try {
      const list: Array<{ productId: string; bidCents: number }> = await lastValueFrom(
        this.adClient.send({ cmd: 'get_active_sponsored' }, {}).pipe(timeout(2000)),
      );
      if (Array.isArray(list) && list.length) {
        for (const s of list) sponsored.map[s.productId] = s.bidCents;
        sponsored.maxBid = Math.max(...list.map((s) => s.bidCents));
      }
    } catch (err) {
      this.logger.warn(`sponsored placements unavailable: ${err}`);
    }

    const candidates = await this.generateCandidates(ctx);
    const scored = candidates.map((p) => this.scoreItem(p, ctx, moments, sponsored));

    const ranked = this.rankWithTieBreak(scored);
    let items = ranked.slice(0, limit);
    let llmApplied = false;

    // Phase 3: grounded LLM re-rank over the top candidates (cached, degrades gracefully).
    if (this.reranker.enabled && items.length > 1) {
      const llm = await this.reranker.rerank(items.slice(0, 30), ctx);
      if (llm) {
        items = this.applyRerank(items, llm);
        llmApplied = true;
      }
    }

    return {
      generatedAt: new Date().toISOString(),
      context: ctx,
      activeMoments: moments.map((m) => ({ key: m.key, label: m.label, proximity: round(m.proximity) })),
      llmApplied,
      items,
    };
  }

  /** Reorder deterministic items by the LLM's ordering and fold in its per-item rationale. */
  private applyRerank(items: DiscoveryItem[], llm: LlmRerankResult): DiscoveryItem[] {
    const byId = new Map<string, DiscoveryItem>();
    for (const it of items) byId.set(String(it.product._id ?? it.product.id ?? ''), it);

    const ordered: DiscoveryItem[] = [];
    const used = new Set<string>();
    for (const id of llm.orderedIds) {
      const it = byId.get(id);
      if (it && !used.has(id)) {
        const reason = llm.rationale[id];
        if (reason) it.reasons = [reason, ...it.reasons.filter((r) => r !== reason)];
        ordered.push(it);
        used.add(id);
      }
    }
    // Append anything the LLM omitted, preserving the deterministic order.
    for (const it of items) {
      const id = String(it.product._id ?? it.product.id ?? '');
      if (!used.has(id)) ordered.push(it);
    }
    return ordered;
  }

  // --- Stage 1: candidate generation (multi-route; Phase 1 uses the catalogue pool) ---
  private async generateCandidates(ctx: DiscoveryContext): Promise<any[]> {
    let products: any[] = [];
    try {
      products = await lastValueFrom(
        this.productClient.send({ cmd: 'findAllProducts' }, { bypassApproval: false }).pipe(timeout(4000)),
      );
    } catch (err) {
      this.logger.warn(`candidate generation failed, returning empty feed: ${err}`);
      return [];
    }
    if (!Array.isArray(products)) return [];

    // Light semantic filter when there's explicit browse/search intent.
    if (ctx.query) {
      const q = ctx.query.toLowerCase();
      const hits = products.filter((p) =>
        `${p.name ?? ''} ${p.description ?? ''} ${p.category ?? ''}`.toLowerCase().includes(q),
      );
      if (hits.length) return hits;
    }
    return products;
  }

  // --- Stage 2: transparent weighted scoring ---
  private scoreItem(
    p: any,
    ctx: DiscoveryContext,
    moments: ActiveMoment[],
    sponsored: { map: Record<string, number>; maxBid: number },
  ): DiscoveryItem {
    const id = String(p._id ?? p.id ?? '');
    const staple = isStapleProduct(p);
    const reasons: string[] = [];

    const replenishment = ctx.standingBasketSkus?.includes(id) ? 1 : 0;
    if (replenishment) reasons.push('In your standing basket — time to restock');

    const circle = clamp01(ctx.circleSkuAffinity?.[id] ?? 0);
    if (circle > 0.3) reasons.push('Households in your circle stock this');

    const cal = calendarRelevance(staple, p.category ?? '', moments);
    if (cal.value > 0.25 && cal.label) reasons.push(`${cal.label} — stock up ahead`);

    const savings = this.savingsSignal(p, reasons);
    const locality = this.localitySignal(p, ctx.region, reasons);
    const reliability = this.reliabilitySignal(p);
    const stock = (p.stock ?? 0) > 0 ? 1 : 0;

    // Guardrail: staples core is NEVER pay-to-rank (do.md §3.6). The ad term is
    // structurally forced to 0 for staples — a paid bid on a staple has no effect
    // (and the ad-service also refuses to create such a campaign).
    const adBid = staple ? 0 : sponsored.map[id] ?? 0;
    const adBoost = adBid > 0 && sponsored.maxBid > 0 ? adBid / sponsored.maxBid : 0;
    const isSponsored = adBoost > 0;
    if (isSponsored) reasons.push('Sponsored');

    if (p.blackOwned) reasons.push('Black-owned producer');
    if (p.localProducer) reasons.push('Local producer');

    const total =
      this.W.replenishment * replenishment +
      this.W.circle * circle +
      this.W.calendar * cal.value +
      this.W.savings * savings +
      this.W.locality * locality +
      this.W.reliability * reliability +
      this.W.stock * stock +
      this.W.ad * adBoost;

    const breakdown: ScoreBreakdown = {
      replenishment: round(this.W.replenishment * replenishment),
      circle: round(this.W.circle * circle),
      calendar: round(this.W.calendar * cal.value),
      savings: round(this.W.savings * savings),
      locality: round(this.W.locality * locality),
      reliability: round(this.W.reliability * reliability),
      stock: round(this.W.stock * stock),
      ad: round(this.W.ad * adBoost),
      blackOwnedBoost: 0, // set during tie-break
      total: round(total),
    };

    return { product: p, score: round(total), breakdown, sponsored: isSponsored, reasons };
  }

  /** Savings-vs-retail (the core value proposition). Prefers a real retailPrice. */
  private savingsSignal(p: any, reasons: string[]): number {
    const price = p.discountPrice ?? p.price;
    let frac = 0;
    if (p.retailPrice && p.retailPrice > price) {
      frac = (p.retailPrice - price) / p.retailPrice;
      reasons.push(`R${Math.round(p.retailPrice - price)} under retail`);
    } else if (p.discountPrice != null && p.discountPrice < p.price) {
      frac = (p.price - p.discountPrice) / p.price;
    }
    // Normalise: a 60%+ saving saturates the signal.
    return clamp01(frac / 0.6);
  }

  /** Geo weighting: does this producer deliver to the member's area? */
  private localitySignal(p: any, region: string | undefined, reasons: string[]): number {
    if (!region) return 0.5;
    const regions: string[] = p.deliveryRegions ?? [];
    if (regions.length === 0) return 0.5; // national / unspecified
    const match = regions.some((r) => r.toLowerCase() === region.toLowerCase());
    if (match) reasons.push(`Delivers in ${region}`);
    return match ? 1 : 0;
  }

  private reliabilitySignal(p: any): number {
    const base = typeof p.reliabilityScore === 'number' ? p.reliabilityScore : 0.7;
    const ratingConf = clamp01((p.ratings ?? 0) / 5) * clamp01((p.numReviews ?? 0) / 20);
    return clamp01(0.7 * base + 0.3 * ratingConf);
  }

  /**
   * Stage 2b: sort by base score, then within near-tied groups promote Black-owned /
   * local producers. The lever only breaks ties — it never overrides a materially
   * better price or reliability for the household (do.md §3.5). Fully auditable:
   * `breakdown.blackOwnedBoost` records whether an item was promoted.
   */
  private rankWithTieBreak(items: DiscoveryItem[]): DiscoveryItem[] {
    const sorted = [...items].sort((a, b) => b.score - a.score);
    const out: DiscoveryItem[] = [];
    let i = 0;
    while (i < sorted.length) {
      const leader = sorted[i].score;
      let j = i;
      while (j < sorted.length && leader - sorted[j].score <= this.TIE_EPSILON) j++;
      const group = sorted.slice(i, j);
      if (group.length > 1) {
        group.sort((a, b) => rankOwnership(b.product) - rankOwnership(a.product));
        for (const item of group) {
          if (rankOwnership(item.product) > 0) item.breakdown.blackOwnedBoost = 1;
        }
      }
      out.push(...group);
      i = j;
    }
    return out;
  }
}

const round = (n: number) => Math.round(n * 1000) / 1000;

/** Ownership priority for the tie-break: Black-owned + local > Black-owned/local > neither. */
function rankOwnership(p: any): number {
  return (p.blackOwned ? 1 : 0) + (p.localProducer ? 1 : 0);
}
