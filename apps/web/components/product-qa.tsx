'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const configured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

interface Question {
  _id?: string;
  id?: string;
  text: string;
  userName?: string;
  answers?: { userName: string; text: string; isVendor?: boolean }[];
  createdAt?: string;
}

export function ProductQA({ productId }: { productId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/products/${productId}/questions`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(Array.isArray(data) ? data : []);
      }
    } catch {
      /* keep empty */
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const ask = async () => {
    if (!text.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      if (!configured) {
        window.location.href = '/login';
        return;
      }
      const supabase = createClient();
      const { data: sess } = await supabase.auth.getSession();
      const tok = sess.session?.access_token;
      if (!tok) {
        window.location.href = '/login';
        return;
      }
      const res = await fetch(`${API}/products/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
        body: JSON.stringify({ productId, text }),
      });
      if (!res.ok) throw new Error();
      setText('');
      await load();
    } catch {
      setMsg('Could not post your question — please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-charcoal">
        Questions &amp; answers{questions.length > 0 && ` (${questions.length})`}
      </h2>

      <div className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder="Ask about this product…"
          className="w-full rounded-sm border border-beige-200 bg-white px-3 py-2 text-sm"
        />
        <button
          onClick={ask}
          disabled={busy || !text.trim()}
          className="whitespace-nowrap rounded-sm bg-charcoal px-4 py-2 text-sm font-semibold text-beige hover:bg-charcoal-800 disabled:opacity-50"
        >
          {busy ? '…' : 'Ask'}
        </button>
      </div>
      {msg && <p className="mt-2 text-sm text-red-700">{msg}</p>}

      {questions.length > 0 && (
        <ul className="mt-4 space-y-3">
          {questions.map((q) => (
            <li key={q._id ?? q.id} className="rounded-sm border border-beige-200 bg-white p-4">
              <p className="text-sm font-semibold text-charcoal">Q: {q.text}</p>
              {q.userName && <p className="text-xs text-charcoal-800/50">{q.userName}</p>}
              {(q.answers ?? []).map((a, i) => (
                <p key={i} className="mt-2 text-sm text-charcoal-800/80">
                  <span className="font-semibold">A:</span> {a.text}
                  <span className="ml-2 text-xs text-charcoal-800/50">
                    — {a.isVendor ? 'Chommie' : a.userName}
                  </span>
                </p>
              ))}
              {(q.answers ?? []).length === 0 && (
                <p className="mt-1 text-xs text-charcoal-800/40">No answers yet.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
