'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const configured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

export function WishlistButton({ productId }: { productId: string }) {
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    setBusy(true);
    try {
      if (!configured) {
        window.location.href = '/login';
        return;
      }
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      const { data: sess } = await supabase.auth.getSession();
      const tok = sess.session?.access_token;
      if (!data.user || !tok) {
        window.location.href = '/login';
        return;
      }
      if (saved) {
        await fetch(`${API}/wishlist/${data.user.id}/${productId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${tok}` } });
        setSaved(false);
      } else {
        await fetch(`${API}/wishlist`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
          body: JSON.stringify({ productId }),
        });
        setSaved(true);
      }
    } catch {
      /* leave state as-is */
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`rounded-sm border px-4 py-2.5 text-xl leading-none transition-colors disabled:opacity-50 ${
        saved ? 'border-brand bg-brand/10 text-brand-600' : 'border-charcoal/20 text-charcoal hover:border-charcoal'
      }`}
    >
      {saved ? '♥' : '♡'}
    </button>
  );
}
