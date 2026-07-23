'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { createClient } from '@/lib/supabase/client';
import { rand } from '@/lib/format';
import { AddressBook } from '@/components/address-book';
import { formatAddress, type Address } from '@/lib/address';
import { safeAuthedFetch } from '@/lib/authed-fetch';

const configured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

const RAILS = [
  { id: 'OZOW', label: 'Ozow — instant EFT (bank login)' },
  { id: 'PAYSHAP', label: 'PayShap — pay by phone number' },
  { id: 'YOCO', label: 'Card (Yoco)' },
  { id: 'PAYFAST', label: 'PayFast — card / EFT / SnapScan' },
  { id: 'BNPL', label: 'Pay later — installments (uses your Trust Score)' },
];

interface AuthedUser {
  id: string;
  email?: string;
}

function postForm(url: string, fields: Record<string, string>) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  for (const [k, v] of Object.entries(fields)) {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = k;
    input.value = String(v);
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export default function CheckoutPage() {
  const { items, subtotal, savings, clear } = useCart();
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthedUser | null>(null);
  const [address, setAddress] = useState<Address | null>(null);
  const [rail, setRail] = useState('OZOW');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [coins, setCoins] = useState(0);
  const [useCoins, setUseCoins] = useState(false);

  // 100 Trust Coins = R1, never more than the basket total.
  const coinDiscount = useCoins ? Math.min(coins / 100, subtotal) : 0;
  const pointsRedeemed = Math.round(coinDiscount * 100);
  const payable = Math.max(0, subtotal - coinDiscount);

  useEffect(() => {
    if (!configured) {
      setReady(true);
      return;
    }
    (async () => {
      const supabase = createClient();
      const { data: sess } = await supabase.auth.getSession();
      const { data: u } = await supabase.auth.getUser();
      setToken(sess.session?.access_token ?? null);
      setUser(u.user ? { id: u.user.id, email: u.user.email ?? undefined } : null);
      if (u.user) {
        const profile = await safeAuthedFetch<{ coins?: number; trustCoins?: number }>(
          `/bnpl/trust-score/${u.user.id}`,
          {},
        );
        setCoins(profile?.coins ?? profile?.trustCoins ?? 0);
      }
      setReady(true);
    })();
  }, []);

  const placeOrder = async () => {
    if (!token || !user) {
      window.location.href = '/login';
      return;
    }
    if (!address) {
      setMsg('Please choose a delivery address.');
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const orderRes = await fetch(`${API}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: user.id,
          email: user.email ?? '',
          // BNPL is handled by the order-service (creates the installment plan);
          // the external rails settle via /payments/initiate below.
          paymentMethod: rail === 'BNPL' ? 'BNPL' : 'EFT',
          shippingAddress: formatAddress(address),
          pointsRedeemed,
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.name,
            quantity: i.quantity,
            price: i.price,
            supplierId: i.supplierId ?? 'chommie',
          })),
        }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok || !order?.id) {
        throw new Error(order?.message || 'Could not create your order.');
      }

      if (rail === 'BNPL') {
        clear();
        setDone(
          `Order #${String(order.id).slice(0, 8)} placed with a payment plan — track your installments on the Pay Later page.`,
        );
        return;
      }

      const payRes = await fetch(`${API}/payments/initiate`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          method: rail,
          orderId: order.id,
          userId: user.id,
          // Server-computed total (circle discount, member pricing, coins applied).
          amount: order.totalAmount ?? payable,
          email: user.email ?? '',
        }),
      });
      const pay = await payRes.json();

      if (pay?.status === 'ERROR') {
        setMsg(pay.error || `${rail} isn't configured yet (needs provider credentials). Your order was created.`);
        return;
      }

      clear();
      if (pay?.redirectUrl) {
        window.location.href = pay.redirectUrl;
        return;
      }
      if (pay?.postUrl && pay?.form) {
        postForm(pay.postUrl, pay.form);
        return;
      }
      if (pay?.instructions) {
        setDone(pay.instructions);
        return;
      }
      setDone(`Order #${String(order.id).slice(0, 8)} placed — payment pending.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Checkout failed.');
    } finally {
      setBusy(false);
    }
  };

  if (!ready) return null;

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-charcoal">Almost there</h1>
        <p className="mt-3 rounded-sm bg-brand/10 p-4 text-sm text-charcoal-800/80">{done}</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link href="/orders" className="font-semibold text-brand-600 hover:underline">
            View your orders →
          </Link>
          <Link href="/bnpl" className="font-semibold text-brand-600 hover:underline">
            Pay later plans →
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-charcoal-800/70">
          Your basket is empty.{' '}
          <Link href="/staples" className="font-semibold text-brand-600 hover:underline">
            Browse staples
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-bold text-charcoal">Checkout</h1>

      {!configured || !user ? (
        <p className="mt-4 rounded-sm border border-beige-200 bg-white p-4 text-sm text-charcoal-800/70">
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>{' '}
          to place your order.
        </p>
      ) : (
        <>
          <div className="mt-6 space-y-1 rounded-sm border border-beige-200 bg-white p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-charcoal-800/60">{items.length} item(s)</span>
              <span className="text-charcoal">{rand(subtotal)}</span>
            </div>
            {coinDiscount > 0 && (
              <div className="flex justify-between text-brand-600">
                <span>Trust Coins ({pointsRedeemed})</span>
                <span>−{rand(coinDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-beige-200 pt-1 font-bold text-charcoal">
              <span>To pay</span>
              <span>{rand(payable)}</span>
            </div>
            {savings > 0 && (
              <p className="pt-1 text-xs font-semibold text-brand-600">
                {rand(savings)} below retail before circle &amp; member pricing.
              </p>
            )}
            <p className="pt-1 text-xs text-charcoal-800/50">
              Circle &amp; member pricing is applied when your order is placed.
            </p>
          </div>

          {coins > 0 && (
            <label className="mt-4 flex cursor-pointer items-center gap-2 rounded-sm border border-beige-200 bg-white p-3 text-sm">
              <input
                type="checkbox"
                checked={useCoins}
                onChange={(e) => setUseCoins(e.target.checked)}
                className="accent-brand"
              />
              Use {coins} Trust Coins ({rand(Math.min(coins / 100, subtotal))} off)
            </label>
          )}

          <p className="mt-6 text-sm font-semibold text-charcoal">Delivery address</p>
          <div className="mt-2">
            <AddressBook selectable selectedId={address?.id ?? null} onSelect={setAddress} />
          </div>

          <p className="mt-6 text-sm font-semibold text-charcoal">Pay with</p>
          <div className="mt-2 space-y-2">
            {RAILS.map((r) => (
              <label
                key={r.id}
                className={`flex cursor-pointer items-center gap-3 rounded-sm border p-3 text-sm ${
                  rail === r.id ? 'border-brand bg-brand/5' : 'border-beige-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="rail"
                  checked={rail === r.id}
                  onChange={() => setRail(r.id)}
                  className="accent-brand"
                />
                {r.label}
              </label>
            ))}
          </div>

          {msg && <p className="mt-4 rounded-sm bg-red-50 p-3 text-sm text-red-700">{msg}</p>}

          <button
            onClick={placeOrder}
            disabled={busy}
            className="mt-6 w-full rounded-sm bg-brand px-6 py-3 font-semibold text-charcoal hover:bg-brand-600 disabled:opacity-50"
          >
            {busy ? 'Placing order…' : `Pay ${rand(payable)}`}
          </button>
        </>
      )}
    </div>
  );
}
