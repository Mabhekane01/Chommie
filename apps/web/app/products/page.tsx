import Link from 'next/link';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/product-card';
import { ProductFilters } from '@/components/product-filters';
import { applyCatalogueQuery, type CatalogueQuery } from '@/lib/catalogue';

export const metadata = { title: 'Marketplace — Chommie' };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string } & CatalogueQuery>;
}) {
  const { q, category, ...query } = await searchParams;
  const all = await api.products.list();
  const matched = q
    ? await api.products.search(q)
    : category
      ? all.filter((p) => p.category === category)
      : all;
  const products = applyCatalogueQuery(matched, query);
  const categories = [...new Set(all.map((p) => p.category).filter(Boolean))].sort();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-charcoal">
        {q ? `Results for “${q}”` : category ? category : 'Marketplace'}
      </h1>

      {!q && categories.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/products"
            className={`rounded-full px-3 py-1 text-xs font-semibold ${!category ? 'bg-charcoal text-beige' : 'border border-beige-200 bg-white text-charcoal'}`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/products?category=${encodeURIComponent(c)}`}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${category === c ? 'bg-charcoal text-beige' : 'border border-beige-200 bg-white text-charcoal'}`}
            >
              {c}
            </Link>
          ))}
        </div>
      )}
      <ProductFilters />

      <p className="mt-3 text-sm text-charcoal-800/60">
        {products.length} {products.length === 1 ? 'product' : 'products'}
        {products.length !== matched.length && ` of ${matched.length}`}
      </p>

      {products.length === 0 ? (
        <p className="mt-6 rounded-sm border border-dashed border-beige-200 bg-white p-6 text-sm text-charcoal-800/60">
          {matched.length > 0
            ? 'No products match those filters. Try clearing a few.'
            : 'Nothing to show. Make sure the API gateway is running and the catalogue is seeded.'}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id ?? p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
