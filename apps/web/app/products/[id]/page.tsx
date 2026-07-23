import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { AddToStandingBasket } from '@/components/add-to-standing-basket';
import { AddToCart } from '@/components/add-to-cart';
import { Stars } from '@/components/stars';
import { ReviewForm } from '@/components/review-form';
import { ProductQA } from '@/components/product-qa';
import { WishlistButton } from '@/components/wishlist-button';
import { ProductGallery } from '@/components/product-gallery';

const rand = (n: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, reviews, delivery] = await Promise.all([
    api.products.get(id),
    api.reviews.byProduct(id),
    api.delivery.estimate(id),
  ]);
  if (!product) notFound();

  const memberPrice = product.discountPrice ?? product.price;
  const saving =
    product.retailPrice && product.retailPrice > memberPrice ? product.retailPrice - memberPrice : 0;
  const perUnit =
    product.unitValue && product.unitMeasure
      ? `${rand(memberPrice / product.unitValue)}/${product.unitMeasure}`
      : null;
  const specs = Object.entries(product.specifications ?? {});
  const bulk = product.bulkPricing ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/products" className="text-sm text-brand-600 hover:underline">
        ← Back to marketplace
      </Link>

      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.images ?? []} name={product.name} />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {product.brand ? `${product.brand} · ` : ''}
            {product.category}
            {product.isStaple && ' · Staple'}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-charcoal">{product.name}</h1>

          {(product.badges ?? []).length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {product.badges!.map((b) => (
                <span
                  key={b}
                  className="rounded-sm bg-charcoal px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-beige"
                >
                  {b.replaceAll('_', ' ')}
                </span>
              ))}
            </div>
          )}

          {(product.numReviews ?? 0) > 0 && (
            <div className="mt-1">
              <Stars rating={product.ratings ?? 0} count={product.numReviews} />
            </div>
          )}

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-charcoal">{rand(memberPrice)}</span>
            {saving > 0 && (
              <>
                <span className="text-lg text-charcoal-800/50 line-through">{rand(product.retailPrice!)}</span>
                <span className="rounded-sm bg-brand/15 px-2 py-0.5 text-sm font-semibold text-brand-600">
                  Save {rand(saving)} vs retail
                </span>
              </>
            )}
          </div>
          {perUnit && <p className="mt-0.5 text-sm text-charcoal-800/60">{perUnit}</p>}

          {product.producerName && (
            <p className="mt-2 text-sm text-charcoal-800/70">
              From <strong>{product.producerName}</strong>
              {product.blackOwned && ' · Black-owned'}
              {product.localProducer && ' · Local producer'}
            </p>
          )}

          <p className="mt-4 text-sm leading-relaxed text-charcoal-800/80">{product.description}</p>

          <div className="mt-6 flex flex-wrap items-start gap-3">
            <AddToCart product={product} />
            <AddToStandingBasket productId={String(id)} />
            <WishlistButton productId={String(id)} />
          </div>
          <p className="mt-2 text-xs text-charcoal-800/50">
            {(product.stock ?? 0) > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          {delivery && (product.stock ?? 0) > 0 && (
            <p className="mt-3 rounded-sm bg-beige-200/60 px-3 py-2 text-sm text-charcoal">
              🚚 Get it by <strong>{delivery.formattedDate}</strong>
            </p>
          )}

          {bulk.length > 0 && (
            <div className="mt-4 rounded-sm border border-beige-200 bg-white p-3">
              <p className="text-sm font-semibold text-charcoal">Buy more, pay less</p>
              <ul className="mt-1 space-y-0.5 text-sm text-charcoal-800/70">
                {bulk.map((t) => (
                  <li key={t.minQuantity}>
                    {t.minQuantity}+ units · <strong>{t.discountPercentage}% off</strong> (
                    {rand(memberPrice * (1 - t.discountPercentage / 100))} each)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {specs.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-charcoal">Specifications</h2>
          <div className="mt-3 overflow-hidden rounded-sm border border-beige-200 bg-white">
            <table className="w-full text-left text-sm">
              <tbody>
                {specs.map(([k, v]) => (
                  <tr key={k} className="border-t border-beige-200 first:border-t-0">
                    <th className="w-1/3 bg-beige-200/40 px-3 py-2 font-semibold text-charcoal">{k}</th>
                    <td className="px-3 py-2 text-charcoal-800/80">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-charcoal">
          Customer reviews{reviews.length > 0 && ` (${reviews.length})`}
        </h2>
        {reviews.length === 0 ? (
          <p className="mt-2 text-sm text-charcoal-800/60">
            No reviews yet — be the first after your delivery.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {reviews.slice(0, 10).map((r) => (
              <li key={r._id ?? r.id} className="rounded-sm border border-beige-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <Stars rating={r.rating} />
                  {r.title && <span className="text-sm font-semibold text-charcoal">{r.title}</span>}
                </div>
                <p className="mt-1 text-xs text-charcoal-800/50">
                  {r.userName}
                  {r.verified && (
                    <span className="ml-2 font-semibold text-brand-600">Verified purchase</span>
                  )}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-charcoal-800/80">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
        <ReviewForm productId={String(id)} />
      </section>

      <ProductQA productId={String(id)} />
    </div>
  );
}
