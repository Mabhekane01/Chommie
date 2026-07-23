import Link from 'next/link';
import { MembershipManager } from '@/components/membership-manager';

export const metadata = { title: 'Membership — Chommie' };

export default function MembershipPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-charcoal">
        Membership funds the platform — <span className="text-brand">not the product</span>.
      </h1>
      <p className="mt-4 max-w-2xl text-charcoal-800/80">
        Like Costco and Thrive Market, Chommie earns from a flat membership fee, not from marking up
        your staples. That single choice is what makes genuinely lower shelf prices possible — the
        fee should always be smaller than the savings you can prove versus retail.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ['Near-cost staples', 'Core basket categories priced to a stated, auditable margin ceiling.'],
          ['Provable savings', 'Every order shows your saving versus retail — value you can check, not claims.'],
          ['One standing basket', 'One monthly staples basket, editable anytime. No maze of subscriptions.'],
        ].map(([title, body]) => (
          <div key={title} className="rounded-sm border border-beige-200 bg-white p-5">
            <p className="font-semibold text-charcoal">{title}</p>
            <p className="mt-1 text-sm text-charcoal-800/70">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-sm bg-charcoal p-6 text-beige">
        <p className="font-semibold">Buy together, save more.</p>
        <p className="mt-1 text-sm text-beige/70">
          Pool your standing basket into a stokvel buying circle to unlock a deeper discount tier —
          because a group order is a larger, more reliable unit of demand.
        </p>
        <Link
          href="/circles"
          className="mt-4 inline-block rounded-sm bg-brand px-4 py-2 font-semibold text-charcoal hover:bg-brand-600 transition-colors"
        >
          Explore buying circles
        </Link>
      </div>

      <MembershipManager />
    </div>
  );
}
