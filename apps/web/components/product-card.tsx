import Link from 'next/link';
import type { IProduct } from '@chommie/shared-types';
import { rand } from '@/lib/format';

/**
 * The most repeated unit in the product, so it carries the philosophy hardest:
 * price is calm and tabular (§2, §6.2), the savings proof is the loud part
 * (§5.1), and provenance is stated in words rather than colour alone (§5.6).
 */
export function ProductCard({ product }: { product: IProduct }) {
  const id = product.id ?? product._id;
  const memberPrice = product.discountPrice ?? product.price;
  const hasDeal = product.discountPrice != null && product.discountPrice < product.price;
  const image = product.images?.[0];
  // do.md §6 — the retail benchmark is the headline, not the strike-through deal.
  const saved =
    product.retailPrice && product.retailPrice > memberPrice ? product.retailPrice - memberPrice : 0;
  const outOfStock = (product.stock ?? 0) <= 0;

  const tags = [
    product.isStaple && 'Staple',
    product.localProducer && 'Local',
    product.blackOwned && 'Black-owned',
  ].filter(Boolean) as string[];

  return (
    <Link
      href={`/products/${id}`}
      className="group flex flex-col rounded-card border border-sand-200 bg-paper p-3 shadow-card transition-[box-shadow,transform] duration-[220ms] ease-chommie hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="relative aspect-square overflow-hidden rounded-sm bg-sand-200">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-[380ms] ease-chommie group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-500">
            No image
          </div>
        )}

        {saved > 0 && (
          <span className="money absolute left-2 top-2 rounded-pill bg-shop px-2 py-0.5 text-[11px] font-bold text-ink">
            Save {rand(saved)}
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/75 py-1 text-center text-[11px] font-bold uppercase tracking-wide text-sand">
            Out of stock
          </span>
        )}
      </div>

      <h3 className="mt-2.5 line-clamp-2 text-sm font-semibold text-ink">{product.name}</h3>

      {tags.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-pill bg-sand-200 px-2 py-0.5 text-[10px] font-bold text-ink-700"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      {(product.numReviews ?? 0) > 0 && (
        <span className="mt-1 text-xs text-shop">
          {'★'.repeat(Math.round(product.ratings ?? 0))}
          <span className="money ml-1 text-ink-500">({product.numReviews})</span>
        </span>
      )}

      {/* Calm at the till: the number is quiet, precise and tabular. */}
      <div className="mt-auto pt-2.5">
        <div className="flex items-baseline gap-1.5">
          <span className="money text-lg font-bold text-ink">{rand(memberPrice)}</span>
          {hasDeal && (
            <span className="money text-sm text-ink-500 line-through">{rand(product.price)}</span>
          )}
        </div>

        {product.unitValue && product.unitMeasure && (
          <p className="money mt-0.5 text-xs text-ink-500">
            {rand(memberPrice / product.unitValue)} per {product.unitMeasure}
          </p>
        )}

        {saved > 0 && (
          <p className="money mt-1 text-xs font-semibold text-shop-600">
            {rand(product.retailPrice!)} at retail
          </p>
        )}

        {product.badges?.includes('BEST_SELLER') && (
          <span className="mt-1.5 inline-block rounded-pill bg-shop/12 px-2 py-0.5 text-[11px] font-bold text-shop-600">
            Best seller
          </span>
        )}
      </div>
    </Link>
  );
}
