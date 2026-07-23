'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export const SORTS = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'unit', label: 'Best value per unit' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'savings', label: 'Biggest saving vs retail' },
  { id: 'rating', label: 'Customer rating' },
];

// Toggles that map to our differentiators (do.md §3.5, §6) rather than generic facets.
const TOGGLES = [
  { id: 'staples', label: 'Staples only' },
  { id: 'deal', label: 'On deal' },
  { id: 'local', label: 'Local producer' },
  { id: 'black', label: 'Black-owned' },
  { id: 'instock', label: 'In stock' },
];

export function ProductFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value === null) next.delete(key);
      else next.set(key, value);
      router.push(`?${next.toString()}`, { scroll: false });
    },
    [params, router],
  );

  const sort = params.get('sort') ?? 'relevance';
  const active = (id: string) => params.get(id) === '1';

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2 text-xs text-charcoal-800/60">
        Sort
        <select
          value={sort}
          onChange={(e) => update('sort', e.target.value === 'relevance' ? null : e.target.value)}
          className="rounded-sm border border-beige-200 bg-white px-2 py-1 text-xs font-semibold text-charcoal"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <span className="mx-1 h-4 w-px bg-beige-200" />

      {TOGGLES.map((t) => (
        <button
          key={t.id}
          onClick={() => update(t.id, active(t.id) ? null : '1')}
          aria-pressed={active(t.id)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            active(t.id)
              ? 'bg-charcoal text-beige'
              : 'border border-beige-200 bg-white text-charcoal hover:border-charcoal/40'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
