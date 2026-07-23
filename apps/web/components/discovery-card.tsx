import Link from 'next/link';
import type { IProduct } from '@chommie/shared-types';
import { rand } from '@/lib/format';

/**
 * A discovery result: the product plus its "why" reasons. The reason chips make
 * every surfaced item explainable by construction (docs/discovery-algorithm.md §0.5).
 */
export function DiscoveryCard({
  product,
  reasons,
  sponsored,
}: {
  product: IProduct;
  reasons: string[];
  sponsored?: boolean;
}) {
  const id = product.id ?? product._id;
  const memberPrice = product.discountPrice ?? product.price;
  const image = product.images?.[0];
  // "Sponsored" is shown as a badge, not a reason chip.
  const chips = reasons.filter((r) => r !== 'Sponsored');

  return (
    <Link
      href={`/products/${id}`}
      className="group flex flex-col rounded-sm border border-beige-200 bg-white p-3 transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden rounded-sm bg-beige-200">
        {sponsored && (
          <span className="absolute left-1.5 top-1.5 z-10 rounded-sm bg-charcoal/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-beige">
            Sponsored
          </span>
        )}
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

      <div className="mt-1">
        <span className="text-lg font-bold text-charcoal">{rand(memberPrice)}</span>
        {product.retailPrice && product.retailPrice > memberPrice && (
          <span className="ml-2 text-sm text-charcoal-800/50 line-through">{rand(product.retailPrice)}</span>
        )}
      </div>

      {chips.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1">
          {chips.slice(0, 3).map((r) => (
            <li
              key={r}
              className="rounded-sm bg-brand/10 px-1.5 py-0.5 text-[11px] font-medium text-brand-600"
            >
              {r}
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
