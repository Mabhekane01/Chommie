'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';

/** Amazon-style header search with live suggestions from the gateway. */
export function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/products/search/suggest?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        const names: string[] = (Array.isArray(data) ? data : [])
          .map((s: { name?: string } | string) => (typeof s === 'string' ? s : s?.name ?? ''))
          .filter(Boolean)
          .slice(0, 6);
        setSuggestions(names);
        setOpen(names.length > 0);
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const go = (term: string) => {
    setOpen(false);
    if (term.trim()) router.push(`/products?q=${encodeURIComponent(term.trim())}`);
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(q);
        }}
        className="flex overflow-hidden rounded-sm"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Search staples, groceries…"
          className="w-full bg-beige px-3 py-1.5 text-sm text-charcoal placeholder:text-charcoal-800/50 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className="bg-brand px-3 font-semibold text-charcoal hover:bg-brand-600 transition-colors"
        >
          ⌕
        </button>
      </form>

      {open && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-sm border border-beige-200 bg-white shadow-lg">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                onClick={() => go(s)}
                className="block w-full px-3 py-2 text-left text-sm text-charcoal hover:bg-beige"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
