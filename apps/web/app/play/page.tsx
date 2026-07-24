import { ComingSoon } from '@/components/coming-soon';

export const metadata = { title: 'Play — Chommie' };

export default function PlayPage() {
  return (
    <ComingSoon
      world="Play"
      headline="Something to watch while the basket lands."
      body="Data is expensive and airtime is money. Play is entertainment priced like a staple — and your circle can pool for it, the same way you pool for maize meal."
      accent={{ text: 'text-play', bg: 'bg-play', soft: 'bg-play/10' }}
      points={[
        ['Pooled with your circle', 'Split a subscription across the people you already buy with.'],
        ['Local first', 'SA creators and stories, not just imported catalogues.'],
        ['Priced honestly', 'The same margin ceiling we hold ourselves to on staples.'],
      ]}
    />
  );
}
