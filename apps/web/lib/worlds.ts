/**
 * The five Chommie worlds (docs/design-philosophy.md §4).
 *
 * Adding a sixth vertical is one entry here plus one accent token — not a
 * redesign. Shop is the brand default because staples are the front door.
 *
 * `comingSoon` worlds are shown deliberately: the roadmap is part of the pitch,
 * and it teaches people early that Chommie is more than a grocery run.
 */
export interface World {
  href: string;
  label: string;
  /** Tailwind classes for the accent dot — colour is never the sole signal. */
  dot: string;
  comingSoon?: boolean;
}

const DOT = 'h-1.5 w-1.5 rounded-full';

export const WORLDS: World[] = [
  { href: '/staples', label: 'Shop', dot: `${DOT} bg-shop` },
  { href: '/circles', label: 'Circles', dot: `${DOT} bg-circles` },
  { href: '/bnpl', label: 'Money', dot: `${DOT} bg-money` },
  { href: '/ride', label: 'Ride', dot: `${DOT} bg-ride`, comingSoon: true },
  { href: '/play', label: 'Play', dot: `${DOT} bg-play`, comingSoon: true },
];
