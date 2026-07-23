import { Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';

/**
 * Chommie AI Concierge — grounded conversational layer (docs/discovery-algorithm.md §5).
 * Uses the same Anthropic client + structured-output contract as the discovery re-rank,
 * and degrades to the caller's heuristic when ANTHROPIC_API_KEY is unset or the call fails.
 */
const MODEL = process.env.DISCOVERY_LLM_MODEL || 'claude-opus-4-8';

export const CONCIERGE_ACTIONS = [
  'NONE',
  'NAVIGATE_ORDERS',
  'NAVIGATE_BNPL',
  'NAVIGATE_DEALS',
  'NAVIGATE_PRODUCTS',
  'NAVIGATE_CIRCLES',
  'NAVIGATE_MEMBERSHIP',
] as const;

export interface ConciergeReply {
  text: string;
  action: string;
}

const SYSTEM_PROMPT = `You are the Chommie concierge. Chommie is a South African direct-to-consumer staples platform: membership funds the platform so staples (eggs, maize meal, rice, oil) sit close to cost; households pool demand into stokvel "buying circles" for a deeper discount tier; discovery is tuned to how SA households actually shop (month-end, festive, ceremony seasons, local & Black-owned producers).

Be warm, brief, and practical, in natural South African English. Help members find staples, understand membership and buying circles, track orders, and boost their Trust Score. Keep replies to 1-3 sentences. Never invent prices, stock, or savings figures — speak generally about them.

If the member would be better served on a specific screen, set "action" to the matching value; otherwise use "NONE".`;

const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    text: { type: 'string' },
    action: { type: 'string', enum: [...CONCIERGE_ACTIONS] },
  },
  required: ['text', 'action'],
};

export class Concierge {
  private readonly logger = new Logger(Concierge.name);
  private readonly client: Anthropic | null;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    this.client = apiKey ? new Anthropic({ apiKey }) : null;
  }

  get enabled(): boolean {
    return this.client !== null;
  }

  async chat(query: string, _userId?: string): Promise<ConciergeReply | null> {
    if (!this.client || !query?.trim()) return null;
    try {
      const params: any = {
        model: MODEL,
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
        messages: [{ role: 'user', content: query }],
      };
      const resp: any = await this.client.messages.create(params);
      const text = (resp.content ?? [])
        .filter((b: any) => b.type === 'text')
        .map((b: any) => b.text)
        .join('');
      const parsed = JSON.parse(text);
      const action = (CONCIERGE_ACTIONS as readonly string[]).includes(parsed.action)
        ? parsed.action
        : 'NONE';
      return { text: String(parsed.text ?? ''), action };
    } catch (err) {
      this.logger.warn(`concierge LLM failed, falling back to heuristic: ${err}`);
      return null;
    }
  }
}
