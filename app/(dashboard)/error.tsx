"use client";

export default function ErrorState({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-2xl bg-surface p-8 hairline">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted">The workspace hit an unexpected error. Details stay on the server.</p>
      <button type="button" className="mt-4 text-cyan" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
