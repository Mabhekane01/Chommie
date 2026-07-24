import Link from 'next/link';

/**
 * Teaser for a world we haven't shipped yet (docs/design-philosophy.md §4).
 * Deliberately on-brand rather than a placeholder: it teaches people early that
 * Chommie is heading somewhere bigger than a grocery run.
 */
export function ComingSoon({
  world,
  headline,
  body,
  accent,
  points,
}: {
  world: string;
  headline: string;
  body: string;
  /** Tailwind text/bg accent classes for this world. */
  accent: { text: string; bg: string; soft: string };
  points: [string, string][];
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <span
        className={`inline-flex items-center gap-2 rounded-pill ${accent.soft} px-3 py-1 text-xs font-bold uppercase tracking-wide ${accent.text}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${accent.bg}`} aria-hidden />
        {world} · coming soon
      </span>

      <h1 className="display mt-5 text-4xl font-extrabold text-ink sm:text-5xl">{headline}</h1>
      <p className="mt-4 max-w-xl text-lg text-ink-700">{body}</p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {points.map(([title, desc]) => (
          <li key={title} className="rounded-card bg-paper p-4 shadow-card">
            <p className="font-bold text-ink">{title}</p>
            <p className="mt-1 text-sm text-ink-700">{desc}</p>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-ink-700">
        One Chommie account, one wallet, one Trust Score — across everything.{' '}
        <Link href="/staples" className="font-semibold text-shop hover:underline">
          Start with the staples
        </Link>
        .
      </p>
    </div>
  );
}
