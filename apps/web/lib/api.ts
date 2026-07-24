import type { IProduct } from '@chommie/shared-types';

/**
 * Thin client for the NestJS api-gateway (the same REST surface the Angular
 * app consumes). Server components call these directly; client components
 * call route handlers that proxy here when auth headers are needed.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3000';

type FetchOpts = RequestInit & { revalidate?: number };

/**
 * Server renders block on these calls, so a gateway that hangs would stall the
 * whole response until the router gives up — which shows in the browser as an
 * opaque "Failed to fetch". Fail fast instead and let `safe()` degrade.
 */
const TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS ?? 4000);

async function request<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const { revalidate, ...init } = opts;
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    signal: init.signal ?? AbortSignal.timeout(TIMEOUT_MS),
    // ISR-style caching by default; discovery endpoints pass revalidate: 0
    next: revalidate === undefined ? undefined : { revalidate },
  });
  if (!res.ok) {
    throw new ApiError(`${init.method ?? 'GET'} ${path} → ${res.status}`, res.status);
  }
  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Returns [] / null instead of throwing, so a down gateway degrades gracefully
 * rather than 500-ing the render. Logs once per failure in development — a
 * silently empty page is much harder to debug than a noisy one.
 */
async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      const why = e instanceof Error ? e.message : String(e);
      console.warn(`[chommie] API unreachable at ${API_URL} — using fallback. (${why})`);
    }
    return fallback;
  }
}

export const api = {
  products: {
    list: (revalidate = 60) => safe<IProduct[]>(request('/products', { revalidate }), []),
    get: (id: string) => safe<IProduct | null>(request(`/products/${id}`, { revalidate: 60 }), null),
    byCategory: (category: string) =>
      safe<IProduct[]>(request(`/products/category/${encodeURIComponent(category)}`, { revalidate: 60 }), []),
    search: (q: string) =>
      safe<IProduct[]>(request(`/products/search/query?q=${encodeURIComponent(q)}`, { revalidate: 0 }), []),
    /** Batch lookup used to revalidate a stored basket against live pricing. */
    byIds: (ids: string[]) =>
      ids.length === 0
        ? Promise.resolve([])
        : safe<IProduct[]>(
            request(`/products/batch?ids=${encodeURIComponent(ids.join(','))}`, { revalidate: 0 }),
            [],
          ),
  },
  reviews: {
    byProduct: (productId: string) =>
      safe<ProductReview[]>(request(`/reviews/product/${productId}`, { revalidate: 30 }), []),
  },
  delivery: {
    estimate: (productId: string, zipCode?: string) =>
      safe<DeliveryEstimate | null>(
        request(
          `/products/${productId}/delivery-estimation${zipCode ? `?zipCode=${zipCode}` : ''}`,
          { revalidate: 0 },
        ),
        null,
      ),
  },
  circles: {
    mine: (userId: string) => safe<Circle[]>(request(`/circles/mine?userId=${encodeURIComponent(userId)}`, { revalidate: 0 }), []),
    get: (id: string) => safe<Circle | null>(request(`/circles/${id}`, { revalidate: 0 }), null),
    create: (data: { name: string; type?: string; region?: string; userId: string; payoutCycle?: string }) =>
      request<Circle>('/circles', { method: 'POST', body: JSON.stringify(data), revalidate: 0 }),
    join: (data: { inviteCode: string; userId: string }) =>
      request<Circle>('/circles/join', { method: 'POST', body: JSON.stringify(data), revalidate: 0 }),
  },
  discovery: {
    /** Circle-/calendar-/geo-aware discovery feed — see docs/discovery-algorithm.md. */
    feed: (params: { userId?: string; region?: string; query?: string; limit?: number } = {}) => {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]),
      ).toString();
      return safe<DiscoveryResult>(request(`/ai/discovery${qs ? `?${qs}` : ''}`, { revalidate: 0 }), {
        generatedAt: '',
        context: params,
        activeMoments: [],
        items: [],
      });
    },
    /** Grounded concierge — see docs/discovery-algorithm.md §5. */
    chat: (query: string, userId?: string) =>
      request<{ text: string; action: string }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ query, userId }),
        revalidate: 0,
      }),
  },
};

export interface DiscoveryResult {
  generatedAt: string;
  context: Record<string, unknown>;
  activeMoments: { key: string; label: string; proximity: number }[];
  items: {
    product: IProduct;
    score: number;
    reasons: string[];
    breakdown: Record<string, number>;
    sponsored?: boolean;
  }[];
}

export interface ProductReview {
  _id?: string;
  id?: string;
  userName: string;
  rating: number;
  title?: string;
  comment: string;
  verified?: boolean;
  helpfulVotes?: number;
  createdAt?: string;
}

export interface DeliveryEstimate {
  estimatedDate: string;
  days: number;
  formattedDate: string;
}

export interface Circle {
  id: string;
  name: string;
  type: string;
  region?: string;
  inviteCode: string;
  discountTier: string;
  extraDiscountPct: number;
  payoutCycle?: string;
  memberCount?: number;
  basket?: { id: string; productId: string; quantity: number }[];
}
