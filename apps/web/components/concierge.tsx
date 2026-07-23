'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const configured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

const ACTION_ROUTES: Record<string, string> = {
  NAVIGATE_ORDERS: '/orders',
  NAVIGATE_BNPL: '/bnpl',
  NAVIGATE_DEALS: '/products',
  NAVIGATE_PRODUCTS: '/products',
  NAVIGATE_CIRCLES: '/circles',
  NAVIGATE_MEMBERSHIP: '/membership',
};

interface Message {
  from: 'you' | 'chommie';
  text: string;
  action?: string;
}

/** Floating AI concierge — grounded Claude via the gateway's /ai/chat. */
export function Concierge() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: 'chommie', text: 'Howzit! I can help you find staples, track orders, or explain buying circles. What do you need?' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async () => {
    const query = input.trim();
    if (!query || busy) return;
    setInput('');
    setMessages((m) => [...m, { from: 'you', text: query }]);
    setBusy(true);
    try {
      let userId: string | undefined;
      if (configured) {
        const { data } = await createClient().auth.getUser();
        userId = data.user?.id;
      }
      const res = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, query }),
      });
      const reply = await res.json();
      setMessages((m) => [
        ...m,
        { from: 'chommie', text: reply?.text ?? 'Eish, something went wrong — try again?', action: reply?.action },
      ]);
    } catch {
      setMessages((m) => [...m, { from: 'chommie', text: 'I could not reach the shop right now — try again in a moment.' }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat with Chommie"
        className="fixed bottom-5 right-5 z-50 flex h-13 w-13 items-center justify-center rounded-full bg-brand p-3.5 text-2xl shadow-lg hover:bg-brand-600 transition-colors"
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex h-[26rem] w-80 flex-col overflow-hidden rounded-sm border border-beige-200 bg-white shadow-2xl">
          <div className="bg-charcoal px-4 py-2.5 text-sm font-semibold text-beige">
            Chommie concierge
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div key={i} className={m.from === 'you' ? 'text-right' : 'text-left'}>
                <span
                  className={`inline-block max-w-[85%] rounded-sm px-3 py-2 text-sm ${
                    m.from === 'you' ? 'bg-charcoal text-beige' : 'bg-beige text-charcoal'
                  }`}
                >
                  {m.text}
                </span>
                {m.action && ACTION_ROUTES[m.action] && (
                  <button
                    onClick={() => router.push(ACTION_ROUTES[m.action!])}
                    className="mt-1 block text-xs font-semibold text-brand-600 hover:underline"
                  >
                    Take me there →
                  </button>
                )}
              </div>
            ))}
            {busy && <p className="text-xs text-charcoal-800/40">Chommie is typing…</p>}
            <div ref={endRef} />
          </div>

          <div className="flex border-t border-beige-200">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask anything…"
              className="w-full px-3 py-2.5 text-sm focus:outline-none"
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              className="bg-brand px-4 text-sm font-semibold text-charcoal hover:bg-brand-600 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
