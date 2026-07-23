'use client';

import { use, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { rand } from '@/lib/format';
import { authConfigured, authedFetch, safeAuthedFetch } from '@/lib/authed-fetch';
import { ReorderButton } from '@/components/reorder-button';

interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  retailPrice?: number;
}

interface TrackingEntry {
  status: string;
  timestamp: string;
  description: string;
}

interface Order {
  id: string;
  totalAmount: number;
  discountAmount?: number;
  vatAmount?: number;
  savingsAmount?: number;
  status: string;
  createdAt: string;
  shippingAddress?: string;
  paymentMethod?: string;
  items?: OrderItem[];
  trackingHistory?: TrackingEntry[];
}

// Fulfilment journey — we always render the full path so the customer can see
// where the parcel is and what's still ahead.
const JOURNEY = ['PENDING', 'PAID', 'CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const LABEL: Record<string, string> = {
  PENDING: 'Order placed',
  PAID: 'Payment confirmed',
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
};

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);
  const [returning, setReturning] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!authConfigured) {
      setReady(true);
      return;
    }
    setOrder(await safeAuthedFetch<Order | null>(`/orders/${id}`, null));
    setReady(true);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const requestReturn = async () => {
    setReturning(true);
    setMsg(null);
    try {
      await authedFetch('/orders/return', {
        method: 'POST',
        body: JSON.stringify({ returnData: { orderId: id, items: order?.items ?? [] } }),
      });
      setMsg('Return requested — we’ll be in touch to arrange collection.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Could not request a return.');
    } finally {
      setReturning(false);
    }
  };

  if (!ready) return null;

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-charcoal-800/70">
          Order not found.{' '}
          <Link href="/orders" className="font-semibold text-brand-600 hover:underline">
            Back to orders
          </Link>
        </p>
      </div>
    );
  }

  const cancelled = order.status === 'CANCELLED' || order.status === 'RETURNED';
  const reachedIndex = JOURNEY.indexOf(order.status);
  const history = order.trackingHistory ?? [];
  const canReturn = order.status === 'DELIVERED' || order.status === 'PAID';

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/orders" className="text-sm text-brand-600 hover:underline">
        ← Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-2xl font-bold text-charcoal">Order #{String(order.id).slice(0, 8)}</h1>
        <span className="text-sm text-charcoal-800/50">
          {new Date(order.createdAt).toLocaleDateString('en-ZA', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </span>
      </div>

      {/* Tracking timeline */}
      <section className="mt-6 rounded-sm border border-beige-200 bg-white p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-charcoal-800/60">Tracking</h2>
        {cancelled ? (
          <p className="mt-3 rounded-sm bg-red-50 p-3 text-sm text-red-700">
            This order was {order.status.toLowerCase()}.
          </p>
        ) : (
          <ol className="mt-4 space-y-0">
            {JOURNEY.map((step, i) => {
              const done = i <= reachedIndex;
              const current = i === reachedIndex;
              const entry = history.find((h) => h.status === step);
              return (
                <li key={step} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        done ? 'bg-brand text-charcoal' : 'border border-beige-200 bg-white text-transparent'
                      }`}
                    >
                      ✓
                    </span>
                    {i < JOURNEY.length - 1 && (
                      <span className={`h-8 w-px ${i < reachedIndex ? 'bg-brand' : 'bg-beige-200'}`} />
                    )}
                  </div>
                  <div className="pb-3">
                    <p className={`text-sm ${current ? 'font-bold text-charcoal' : done ? 'text-charcoal' : 'text-charcoal-800/40'}`}>
                      {LABEL[step]}
                    </p>
                    {entry && (
                      <p className="text-xs text-charcoal-800/50">
                        {new Date(entry.timestamp).toLocaleString('en-ZA', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {entry.description}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {/* Items */}
      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold text-charcoal">Items</h2>
          <ReorderButton items={order.items ?? []} />
        </div>
        <ul className="mt-3 divide-y divide-beige-200 rounded-sm border border-beige-200 bg-white">
          {(order.items ?? []).map((it) => (
            <li key={it.id ?? it.productId} className="flex items-center gap-3 p-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-beige-200">
                {it.productImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.productImage} alt={it.productName} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${it.productId}`} className="truncate text-sm font-medium text-charcoal hover:underline">
                  {it.productName}
                </Link>
                <p className="text-xs text-charcoal-800/50">
                  {it.quantity} × {rand(Number(it.price))}
                  {it.retailPrice && Number(it.retailPrice) > Number(it.price) && (
                    <span className="ml-1 line-through">{rand(Number(it.retailPrice))}</span>
                  )}
                </p>
              </div>
              <span className="text-sm font-semibold text-charcoal">
                {rand(Number(it.price) * it.quantity)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Totals — price transparency (do.md §6) */}
      <section className="mt-6 rounded-sm border border-beige-200 bg-white p-4 text-sm">
        {Number(order.discountAmount) > 0 && (
          <div className="flex justify-between text-brand-600">
            <span>Discounts (circle, coins, coupons)</span>
            <span>−{rand(Number(order.discountAmount))}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-charcoal">
          <span>Total paid</span>
          <span>{rand(Number(order.totalAmount))}</span>
        </div>
        {Number(order.savingsAmount) > 0 && (
          <p className="mt-2 rounded-sm bg-brand/10 p-2 text-center font-semibold text-brand-600">
            You saved {rand(Number(order.savingsAmount))} vs retail on this order
          </p>
        )}
        {order.shippingAddress && (
          <p className="mt-3 text-xs text-charcoal-800/50">Delivering to {order.shippingAddress}</p>
        )}
      </section>

      {msg && <p className="mt-4 rounded-sm bg-beige-200/60 p-3 text-sm text-charcoal">{msg}</p>}

      {canReturn && (
        <button
          onClick={requestReturn}
          disabled={returning}
          className="mt-4 rounded-sm border border-charcoal/20 px-4 py-2 text-sm font-semibold text-charcoal hover:border-charcoal disabled:opacity-50"
        >
          {returning ? 'Requesting…' : 'Request a return'}
        </button>
      )}
    </div>
  );
}
