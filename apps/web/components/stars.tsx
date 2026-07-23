export function Stars({ rating, count }: { rating: number; count?: number }) {
  const full = Math.round(rating || 0);
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="tracking-tight text-brand" aria-label={`${rating?.toFixed(1)} out of 5`}>
        {'★'.repeat(full)}
        <span className="text-charcoal-800/20">{'★'.repeat(5 - full)}</span>
      </span>
      {count !== undefined && (
        <span className="text-xs text-charcoal-800/50">({count})</span>
      )}
    </span>
  );
}
