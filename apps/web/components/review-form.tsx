'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const configured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

export function ReviewForm({ productId }: { productId: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    if (!comment.trim()) return;
    setBusy(true);
    setMsg(null);
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
      const res = await fetch(`${API}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
        body: JSON.stringify({ productId, rating, title, comment }),
      });
      if (!res.ok) throw new Error();
      setMsg('Thanks — your review is live.');
      setOpen(false);
      setTitle('');
      setComment('');
    } catch {
      setMsg('Could not post your review — please try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <div className="mt-4">
        <button
          onClick={() => setOpen(true)}
          className="rounded-sm border border-charcoal/20 px-4 py-2 text-sm font-semibold text-charcoal hover:border-charcoal"
        >
          Write a review
        </button>
        {msg && <p className="mt-2 text-sm text-brand-600">{msg}</p>}
        {!configured && (
          <p className="mt-1 text-xs text-charcoal-800/50">
            You&apos;ll need to <Link href="/login" className="text-brand-600 hover:underline">sign in</Link>.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-sm border border-beige-200 bg-white p-4">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setRating(n)}
            aria-label={`${n} star`}
            className={`text-2xl ${n <= rating ? 'text-brand' : 'text-charcoal-800/20'}`}
          >
            ★
          </button>
        ))}
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="mt-3 w-full rounded-sm border border-beige-200 px-3 py-2 text-sm"
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        placeholder="What did you think?"
        className="mt-2 w-full rounded-sm border border-beige-200 px-3 py-2 text-sm"
      />
      {msg && <p className="mt-2 text-sm text-red-700">{msg}</p>}
      <div className="mt-3 flex gap-2">
        <button
          onClick={submit}
          disabled={busy || !comment.trim()}
          className="rounded-sm bg-brand px-4 py-2 text-sm font-semibold text-charcoal hover:bg-brand-600 disabled:opacity-50"
        >
          {busy ? 'Posting…' : 'Post review'}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="rounded-sm px-4 py-2 text-sm text-charcoal-800/60 hover:text-charcoal"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
