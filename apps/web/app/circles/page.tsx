import { CircleManager } from '@/components/circle-manager';

export const metadata = { title: 'Buying Circles — Chommie' };

const TIERS = [
  ['3–5 households', 'Bronze', '+3%'],
  ['6–10 households', 'Silver', '+5%'],
  ['11+ households', 'Gold', '+8%'],
];

export default function CirclesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">Stokvel, digitized</p>
      <h1 className="mt-1 text-3xl font-extrabold text-charcoal">Buying circles</h1>
      <p className="mt-4 max-w-2xl text-charcoal-800/80">
        A buying circle is a group of households — a family, a street, a workplace, an existing
        stokvel — that pools its combined standing-basket demand. A larger, more reliable, more
        schedulable order is exactly what a supplier will discount harder, so your circle unlocks a
        deeper tier. Chommie handles the pooled collection, order aggregation and delivery split —
        the admin a stokvel used to do by hand.
      </p>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-charcoal">Circle discount tiers</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {TIERS.map(([size, tier, pct]) => (
            <div key={tier} className="rounded-sm border border-beige-200 bg-white p-5">
              <p className="text-2xl font-extrabold text-brand-600">{pct}</p>
              <p className="mt-1 font-semibold text-charcoal">{tier} circle</p>
              <p className="text-sm text-charcoal-800/60">{size}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-charcoal-800/50">
          Household pricing is never worse because a circle exists — the tier only adds discount.
        </p>
      </div>

      <div className="mt-8 rounded-sm bg-beige-200 p-6">
        <h2 className="text-lg font-bold text-charcoal">How it works</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-charcoal-800/80">
          <li>Start a circle or join one with an invite code.</li>
          <li>Everyone adds to a shared, pooled standing basket.</li>
          <li>Discovery learns what your circle stocks together and surfaces it ahead of month-end.</li>
          <li>The circle checks out as one order; Chommie splits the delivery.</li>
        </ol>
        <p className="mt-3 text-xs text-charcoal-800/50">
          Sign in (passkey, Google or phone) to create or join a circle.
        </p>
      </div>

      <CircleManager />
    </div>
  );
}
