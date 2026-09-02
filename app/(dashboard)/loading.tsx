export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 rounded bg-surface shimmer" />
      <div className="grid gap-3 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-surface shimmer" />
        ))}
      </div>
    </div>
  );
}
