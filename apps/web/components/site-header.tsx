import Link from 'next/link';
import { getUser } from '@/lib/supabase/auth';
import { CartBadge } from './cart-badge';
import { NotificationBell } from './notification-bell';
import { SearchBar } from './search-bar';

const NAV = [
  { href: '/staples', label: 'Staples' },
  { href: '/circles', label: 'Buying Circles' },
  { href: '/membership', label: 'Membership' },
  { href: '/products', label: 'Marketplace' },
];

export async function SiteHeader() {
  const user = await getUser();
  return (
    <header className="sticky top-0 z-40 bg-charcoal text-beige">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          <span className="text-brand">Ch</span>ommie
        </Link>

        <SearchBar />

        <nav className="hidden lg:flex items-center gap-5 text-sm text-beige/80">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="hover:text-beige transition-colors">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 text-sm">
          <NotificationBell />
          <CartBadge />
          {user ? (
            <Link
              href="/account"
              className="rounded-sm bg-brand px-3 py-1.5 font-semibold text-charcoal hover:bg-brand-600 transition-colors"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-sm bg-brand px-3 py-1.5 font-semibold text-charcoal hover:bg-brand-600 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
