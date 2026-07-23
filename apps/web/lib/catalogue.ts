import type { IProduct } from '@chommie/shared-types';

export interface CatalogueQuery {
  sort?: string;
  staples?: string;
  deal?: string;
  local?: string;
  black?: string;
  instock?: string;
}

const effectivePrice = (p: IProduct) => p.discountPrice ?? p.price;

/** Price per base unit — the Costco-style comparison our members actually shop on. */
const unitPrice = (p: IProduct) =>
  p.unitValue && p.unitValue > 0 ? effectivePrice(p) / p.unitValue : Number.POSITIVE_INFINITY;

/** Absolute rand saved against the retail benchmark (do.md §6). */
const savings = (p: IProduct) =>
  p.retailPrice && p.retailPrice > effectivePrice(p) ? p.retailPrice - effectivePrice(p) : 0;

/**
 * Filters and sorts a catalogue listing. Generic over the row type so the
 * staples feed (which wraps products in discovery metadata) can reuse it;
 * `sort` defaults to leaving the incoming order alone, which on the staples
 * page means the discovery ranking is preserved.
 */
export function applyCatalogueQuery<T>(
  rows: T[],
  q: CatalogueQuery,
  select: (row: T) => IProduct = (row) => row as unknown as IProduct,
): T[] {
  let out = rows;
  const keep = (fn: (p: IProduct) => unknown) => (out = out.filter((r) => fn(select(r))));

  if (q.staples === '1') keep((p) => p.isStaple);
  if (q.deal === '1') keep((p) => p.discountPrice != null && p.discountPrice < p.price);
  if (q.local === '1') keep((p) => p.localProducer);
  if (q.black === '1') keep((p) => p.blackOwned);
  if (q.instock === '1') keep((p) => (p.stock ?? 0) > 0);

  const by = (fn: (p: IProduct) => number) =>
    // Copy before sorting so we never mutate the cached fetch result.
    [...out].sort((a, b) => fn(select(a)) - fn(select(b)));

  switch (q.sort) {
    case 'unit':
      return by(unitPrice);
    case 'price-asc':
      return by(effectivePrice);
    case 'price-desc':
      return by((p) => -effectivePrice(p));
    case 'savings':
      return by((p) => -savings(p));
    case 'rating':
      return by((p) => -((p.ratings ?? 0) * 1000 + (p.numReviews ?? 0)));
    default:
      return out;
  }
}
