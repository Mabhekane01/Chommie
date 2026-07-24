import Link from 'next/link';
import { getUser } from '@/lib/supabase/auth';
import { CartBadge } from './cart-badge';
import { NotificationBell } from './notification-bell';
import { SearchBar } from './search-bar';
import { WORLDS } from '@/lib/worlds';

/**
 * The shared skeleton (docs/design-philosophy.md §4). Every world hangs off this
 * same frame — only the accent changes — so a user who learns to read Chommie in
 * the grocery aisle can read it in the banking tab without relearning anything.
 */
export async function SiteHeader() {
  const user = await getUser();

  return (
    <header className="sticky top-0 z-40 bg-ink text-sand">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="display text-2xl font-extrabold tracking-tight">
          <span className="text-shop">Ch</span>ommie
        </Link>

        <SearchBar />

        <div className="ml-auto flex items-center gap-3 text-sm">
          <NotificationBell />
          <CartBadge />
          <Link
            href={user ? '/account' : '/login'}
            className="rounded-pill bg-shop px-4 py-2 font-semibold text-ink transition-[transform,background-color] duration-[120ms] ease-chommie hover:bg-shop-600 active:scale-95"
          >
            {user ? 'Account' : 'Sign in'}
          </Link>
        </div>
      </div>

      {/* World switcher — one row, per-world accent, identical everywhere. */}
      <nav
        aria-label="Chommie worlds"
        className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2 text-sm"
      >
        {WORLDS.map((w) => (
          <Link
            key={w.href}
            href={w.href}
            // Teasers aren't worth a prefetch on a metered connection.
            prefetch={w.comingSoon ? false : undefined}
            aria-disabled={w.comingSoon || undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-pill px-3 py-1.5 font-semibold transition-colors duration-[120ms] ease-chommie ${
              w.comingSoon
                ? 'text-sand/35'
                : 'text-sand/75 hover:bg-white/10 hover:text-sand'
            }`}
          >
            <span aria-hidden className={w.comingSoon ? '' : w.dot} />
            {w.label}
            {w.comingSoon && (
              <span className="rounded-pill bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
                Soon
              </span>
            )}
          </Link>
        ))}
      </nav>
    </header>
  );
}
