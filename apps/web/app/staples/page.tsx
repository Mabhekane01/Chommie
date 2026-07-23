import { api } from '@/lib/api';
import { DiscoveryCard } from '@/components/discovery-card';
import { ProductFilters } from '@/components/product-filters';
import { applyCatalogueQuery, type CatalogueQuery } from '@/lib/catalogue';

export const metadata = { title: 'Staples — Chommie' };

export default async function StaplesPage({
  searchParams,
}: {
  searchParams: Promise<CatalogueQuery>;
}) {
  const query = await searchParams;
  const feed = await api.discovery.feed({ limit: 40 });
  const staples = feed.items.filter((i) => i.product.isStaple);
  const ranked = staples.length > 0 ? staples : feed.items;
  const items = applyCatalogueQuery(ranked, query, (i) => i.product);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-charcoal">Staples core</h1>
      <p className="mt-1 max-w-2xl text-sm text-charcoal-800/70">
        Priced to an auditable margin ceiling — no hidden markup, never pay-to-rank. Suppliers
        compete here on price, reliability and local/Black-ownership visibility, not ad spend.
      </p>

      <ProductFilters />

      {items.length === 0 ? (
        <p className="mt-6 rounded-sm border border-dashed border-beige-200 bg-white p-6 text-sm text-charcoal-800/60">
          {ranked.length > 0 ? (
            'No staples match those filters. Try clearing a few.'
          ) : (
            <>
              No staples yet — run <code>npm run seed</code> with the gateway + services up.
            </>
          )}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <DiscoveryCard
              key={item.product.id ?? item.product._id}
              product={item.product}
              reasons={item.reasons}
              sponsored={item.sponsored}
            />
          ))}
        </div>
      )}
    </div>
  );
}
