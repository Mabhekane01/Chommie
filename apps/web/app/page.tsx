import Link from 'next/link';
import { api } from '@/lib/api';
import { ProductCard } from '@/components/product-card';
import { DiscoveryCard } from '@/components/discovery-card';

// Home is a Server Component: it renders on the server and streams to the
// client, keeping the initial payload small for metered mobile connections.
export default async function HomePage() {
  // The discovery feed is the moat (do.md §3.5). Fall back to the raw catalogue
  // if the recommendation-service is unavailable — the page never goes blank.
  const [feed, products] = await Promise.all([api.discovery.feed({ limit: 15 }), api.products.list()]);
  const moment = feed.activeMoments[0];

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* Hero — the staples / circles / savings promise, not a generic store */}
      <section className="mt-6 grid gap-6 rounded-sm bg-charcoal px-6 py-10 text-beige md:grid-cols-2 md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
            Staples at <span className="text-brand">cost</span>, not at markup.
          </h1>
          <p className="mt-3 max-w-md text-beige/70">
            Membership funds the platform — so eggs, maize meal, rice and oil sit close to what they
            actually cost. Pool your basket into a <strong className="text-beige">buying circle</strong> and
            the price drops again.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/membership"
              className="rounded-sm bg-brand px-4 py-2 font-semibold text-charcoal hover:bg-brand-600 transition-colors"
            >
              See membership
            </Link>
            <Link
              href="/circles"
              className="rounded-sm border border-beige/30 px-4 py-2 font-semibold text-beige hover:border-beige transition-colors"
            >
              Start a buying circle
            </Link>
          </div>
        </div>
        <ul className="grid gap-3 text-sm">
          {[
            ['Near-cost staples', 'Priced to an auditable margin ceiling — no hidden markup.'],
            ['Stokvel buying circles', 'Pool demand with your family, street or workplace for a deeper tier.'],
            ['Built for how SA shops', 'Circle-, calendar- and area-aware discovery, not a national feed.'],
          ].map(([title, body]) => (
            <li key={title} className="rounded-sm bg-charcoal-800 p-4">
              <p className="font-semibold text-beige">{title}</p>
              <p className="mt-1 text-beige/60">{body}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Discovery feed — circle-, calendar- and area-aware (do.md §3.5) */}
      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-bold text-charcoal">
              {moment ? moment.label : 'Recommended for you'}
            </h2>
            {moment && (
              <p className="text-sm text-charcoal-800/60">
                Surfaced ahead of time so you can stock up and pool your circle.
              </p>
            )}
          </div>
          <Link href="/products" className="text-sm font-semibold text-brand-600 hover:underline">
            View all
          </Link>
        </div>

        {feed.items.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {feed.items.map((item) => (
              <DiscoveryCard
                key={item.product.id ?? item.product._id}
                product={item.product}
                reasons={item.reasons}
                sponsored={item.sponsored}
              />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {products.slice(0, 15).map((p) => (
              <ProductCard key={p.id ?? p._id} product={p} />
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-sm border border-dashed border-beige-200 bg-white p-6 text-sm text-charcoal-800/60">
            No products yet. Start the API gateway (<code>npm run dev</code>) and seed the catalogue
            (<code>npm run seed</code>), or set <code>NEXT_PUBLIC_API_URL</code> to a running gateway.
          </p>
        )}
      </section>
    </div>
  );
}
