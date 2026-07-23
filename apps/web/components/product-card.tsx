import Link from 'next/link';
import type { IProduct } from '@chommie/shared-types';
import { rand } from '@/lib/format';

export function ProductCard({ product }: { product: IProduct }) {
  const id = product.id ?? product._id;
  const memberPrice = product.discountPrice ?? product.price;
  const hasDeal = product.discountPrice != null && product.discountPrice < product.price;
  const image = product.images?.[0];
  // do.md §6 — the retail benchmark is the headline, not the strike-through deal.
  const saved =
    product.retailPrice && product.retailPrice > memberPrice ? product.retailPrice - memberPrice : 0;

  return (
    <Link
      href={`/products/${id}`}
      className="group flex flex-col rounded-sm border border-beige-200 bg-white p-3 transition-shadow hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden rounded-sm bg-beige-200">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-charcoal-800/30">No image</div>
        )}
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-medium text-charcoal">{product.name}</h3>

      {(product.blackOwned || product.localProducer || product.isStaple) && (
        <div className="mt-1 flex flex-wrap gap-1">
          {product.isStaple && (
            <span className="rounded-sm bg-charcoal/5 px-1.5 py-0.5 text-[10px] font-semibold text-charcoal-800/70">
              Staple
            </span>
          )}
          {product.localProducer && (
            <span className="rounded-sm bg-charcoal/5 px-1.5 py-0.5 text-[10px] font-semibold text-charcoal-800/70">
              Local
            </span>
          )}
          {product.blackOwned && (
            <span className="rounded-sm bg-charcoal/5 px-1.5 py-0.5 text-[10px] font-semibold text-charcoal-800/70">
              Black-owned
            </span>
          )}
        </div>
      )}

      {(product.numReviews ?? 0) > 0 && (
        <span className="mt-0.5 text-xs text-brand">
          {'★'.repeat(Math.round(product.ratings ?? 0))}
          <span className="ml-1 text-charcoal-800/40">({product.numReviews})</span>
        </span>
      )}

      <div className="mt-auto pt-2">
        <span className="text-lg font-bold text-charcoal">{rand(memberPrice)}</span>
        {product.unitValue && product.unitMeasure && (
          <span className="ml-1.5 text-xs text-charcoal-800/50">
            {rand(memberPrice / product.unitValue)}/{product.unitMeasure}
          </span>
        )}
        {hasDeal && (
          <span className="ml-2 text-sm text-charcoal-800/50 line-through">{rand(product.price)}</span>
        )}
        {product.badges?.includes('BEST_SELLER') && (
          <span className="ml-2 rounded-sm bg-brand/15 px-1.5 py-0.5 text-[11px] font-semibold text-brand-600">
            Best seller
          </span>
        )}
        {saved > 0 && (
          <p className="mt-1 text-xs font-semibold text-brand-600">
            Save {rand(saved)} vs {rand(product.retailPrice!)} retail
          </p>
        )}
        {(product.stock ?? 0) <= 0 && (
          <p className="mt-1 text-xs font-semibold text-charcoal-800/50">Out of stock</p>
        )}
      </div>
    </Link>
  );
}
