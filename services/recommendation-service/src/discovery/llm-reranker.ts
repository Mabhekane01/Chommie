import { Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { DiscoveryContext, DiscoveryItem } from './discovery.types';

/**
 * Discovery Phase 3 — grounded LLM re-rank (docs/discovery-algorithm.md §5).
 *
 * The LLM is constrained to the deterministic candidate set: it may reorder and
 * explain, never invent products, prices, or stock. It runs only over the top ~30
 * candidates, is cached per context bucket, and degrades to the deterministic
 * order whenever the key is missing or the call fails — a value platform can't
 * show a blank feed because an AI call timed out.
 */

// Per the Anthropic API guidance, default to Opus 4.8; override to a cheaper
// model (e.g. claude-haiku-4-5) via env when running near-cost.
const MODEL = process.env.DISCOVERY_LLM_MODEL || 'claude-opus-4-8';
const CACHE_TTL_MS = 1000 * 60 * 60; // 1h

export interface LlmRerankResult {
  orderedIds: string[];
  rationale: Record<string, string>;
}

const SYSTEM_PROMPT = `You re-rank a South African staples marketplace's discovery feed for one member.
You are given a fixed list of candidate products (already scored by a fair, transparent ranker) and the member's context.
Your job: reorder them into the most helpful feed and give each a short reason.

Hard rules — follow exactly:
- Only use product ids present in the input. Never invent products, prices, or stock.
- Never change any price or number. Pass the member's own framing, not marketing.
- For staple items (is_staple: true), order ONLY by household value (savings, replenishment, circle relevance, calendar fit). Never rank a staple higher because a producer paid — there is no ad signal here and you must not simulate one.
- When two items are close on value, you may prefer Black-owned or local producers (this is the platform's fairness lever) — but never over a materially cheaper or more reliable option for the household.
- Build a coherent feed (e.g. a sensible month-end staples run), avoid near-duplicates back to back.
- Each reason must be <= 90 characters, factual, and in plain language a shopper would use.

Return ONLY JSON matching the schema: { "ordered_ids": [id...], "rationale": [{ "id": id, "reason": string }...] }.`;

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    ordered_ids: { type: 'array', items: { type: 'string' } },
    rationale: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: { id: { type: 'string' }, reason: { type: 'string' } },
        required: ['id', 'reason'],
      },
    },
  },
  required: ['ordered_ids', 'rationale'],
};

export class LlmReranker {
  private readonly logger = new Logger(LlmReranker.name);
  private readonly client: Anthropic | null;
  private readonly cache = new Map<string, { at: number; value: LlmRerankResult }>();

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
    if (!this.client) {
      this.logger.log('ANTHROPIC_API_KEY not set — LLM re-rank disabled, using deterministic order.');
    }
  }

  get enabled(): boolean {
    return this.client !== null;
  }

  async rerank(items: DiscoveryItem[], ctx: DiscoveryContext): Promise<LlmRerankResult | null> {
    if (!this.client || items.length < 2) return null;

    const candidates = items.map((i) => ({
      id: String(i.product._id ?? i.product.id ?? ''),
      name: i.product.name,
      price: i.product.discountPrice ?? i.product.price,
      retail_price: i.product.retailPrice ?? null,
      category: i.product.category,
      is_staple: !!i.product.isStaple,
      black_owned: !!i.product.blackOwned,
      local_producer: !!i.product.localProducer,
      score: i.score,
      reasons: i.reasons,
    }));

    const key = this.cacheKey(candidates, ctx);
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;

    const validIds = new Set(candidates.map((c) => c.id));
    try {
      const params: any = {
        model: MODEL,
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA }, effort: 'low' },
        messages: [
          {
            role: 'user',
            content: JSON.stringify({
              context: { region: ctx.region ?? null, circle: !!ctx.circleId, query: ctx.query ?? null },
              candidates,
            }),
          },
        ],
      };
      const resp: any = await this.client.messages.create(params);
      const text = (resp.content ?? [])
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('');
      const parsed = JSON.parse(text);

      const orderedIds: string[] = (parsed.ordered_ids ?? []).filter((id: string) => validIds.has(id));
      const rationale: Record<string, string> = {};
      for (const r of parsed.rationale ?? []) {
        if (r && validIds.has(r.id) && typeof r.reason === 'string') rationale[r.id] = r.reason;
      }
      if (orderedIds.length === 0) return null;

      const value: LlmRerankResult = { orderedIds, rationale };
      this.cache.set(key, { at: Date.now(), value });
      return value;
    } catch (err) {
      this.logger.warn(`LLM re-rank failed, keeping deterministic order: ${err}`);
      return null;
    }
  }

  private cacheKey(candidates: { id: string }[], ctx: DiscoveryContext): string {
    const ids = candidates
      .map((c) => c.id)
      .sort()
      .join(',');
    const day = (ctx.date ? new Date(ctx.date) : new Date()).toISOString().slice(0, 10);
    return `${ctx.userId ?? 'anon'}|${ctx.region ?? ''}|${ctx.circleId ?? ''}|${ctx.query ?? ''}|${day}|${ids}`;
  }
}
