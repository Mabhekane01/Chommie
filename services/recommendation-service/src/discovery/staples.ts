/**
 * Staple detection. The blueprint's `isStaple` flag on the product is authoritative;
 * this keyword/category fallback lets discovery work today over a catalogue that
 * hasn't been fully tagged yet (docs/discovery-algorithm.md §0.4 — graceful degradation).
 */

const STAPLE_KEYWORDS = [
  'egg', 'maize', 'mielie', 'mealie', 'samp', 'rice', 'flour', 'cake flour',
  'bread', 'sugar', 'salt', 'cooking oil', 'sunflower oil', 'oil', 'beans',
  'sugar beans', 'lentil', 'milk', 'maas', 'amasi', 'tea', 'coffee', 'pap',
  'porridge', 'tinned', 'canned', 'pilchard', 'soup', 'margarine', 'paraffin',
  'washing powder', 'candle',
];

const STAPLE_CATEGORIES = ['staple', 'grocer', 'food', 'pantry', 'essential'];

export function isStapleProduct(p: { name?: string; category?: string; isStaple?: boolean }): boolean {
  if (p.isStaple === true) return true;
  const category = (p.category ?? '').toLowerCase();
  if (STAPLE_CATEGORIES.some((c) => category.includes(c))) return true;
  const hay = `${p.name ?? ''} ${category}`.toLowerCase();
  return STAPLE_KEYWORDS.some((k) => hay.includes(k));
}
