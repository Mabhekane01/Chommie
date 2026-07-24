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
      {/* Hero — a friend who's good with money, not a store (design-philosophy §1) */}
      <section className="mt-6 grid gap-8 rounded-card bg-ink px-6 py-12 text-sand md:grid-cols-2 md:items-center md:px-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-sand/45">
            Chommie · your people, your prices
          </p>
          <h1 className="display mt-3 text-[2.6rem] font-extrabold sm:text-5xl">
            Staples at <span className="text-shop">cost</span>.
            <br />
            Not at markup.
          </h1>
          <p className="mt-4 max-w-md text-lg text-sand/70">
            Membership funds the platform, so the food doesn&apos;t have to. Pool your basket with
            your people and the price drops again.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/staples"
              className="rounded-pill bg-shop px-5 py-2.5 font-semibold text-ink transition-[transform,background-color] duration-[120ms] ease-chommie hover:bg-shop-600 active:scale-95"
            >
              Shop the staples
            </Link>
            <Link
              href="/circles"
              className="rounded-pill border border-sand/25 px-5 py-2.5 font-semibold text-sand transition-colors duration-[120ms] ease-chommie hover:border-sand"
            >
              Start a circle
            </Link>
          </div>
        </div>

        {/* Proof over persuasion (§5.1) — the mechanism, stated plainly. */}
        <ul className="grid gap-3 text-sm">
          {[
            ['shop', 'No markup on staples', 'Priced to a stated margin ceiling we hold ourselves to.'],
            ['circles', 'Together is cheaper', 'Three people is 3% off. Eleven is 8%. Same basket.'],
            ['money', 'You keep the difference', 'Every order shows what you saved against retail.'],
          ].map(([world, title, body]) => (
            <li key={title} className="flex gap-3 rounded-card bg-white/[0.06] p-4">
              <span
                aria-hidden
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  world === 'shop' ? 'bg-shop' : world === 'circles' ? 'bg-circles' : 'bg-money'
                }`}
              />
              <div>
                <p className="font-bold text-sand">{title}</p>
                <p className="mt-0.5 text-sand/60">{body}</p>
              </div>
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
