import { ComingSoon } from '@/components/coming-soon';

export const metadata = { title: 'Ride — Chommie' };

export default function RidePage() {
  return (
    <ComingSoon
      world="Ride"
      headline="Getting there shouldn't cost you the groceries."
      body="The same Chommie account that buys your staples will book your trip — and the delivery van that drops your basket is already going that way."
      accent={{ text: 'text-ride', bg: 'bg-ride', soft: 'bg-ride/10' }}
      points={[
        ['Fare up front', 'You see the price before you get in. No surge surprises.'],
        ['Pay how you shop', 'Wallet, PayShap or coins — same rails as your basket.'],
        ['Trust travels', 'Your Trust Score comes with you, so good history means better terms.'],
      ]}
    />
  );
}
