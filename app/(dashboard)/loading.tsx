export default function Loading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <div className="h-9 w-56 rounded-[4px] bg-surface shimmer" />
      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="sheet h-24 rounded-[6px] shimmer" />
        ))}
      </div>
    </div>
  );
}
