import type { Metadata } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { CartProvider } from '@/lib/cart';
import { Concierge } from '@/components/concierge';

export const metadata: Metadata = {
  title: 'Chommie — Staples, direct from producers',
  description:
    'Membership-priced staples, stokvel buying circles, and prices as close to cost as we can get them. Built for how South Africa actually shops.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA">
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <Concierge />
          <footer className="mt-16 border-t border-beige-200 bg-charcoal text-beige/80">
            <div className="mx-auto max-w-6xl px-4 py-8 text-sm">
              <p className="font-semibold text-beige">Chommie</p>
              <p className="mt-1 max-w-md text-beige/60">
                Cutting the middle. Rebuilding the pipeline. Putting the consumer first.
              </p>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
