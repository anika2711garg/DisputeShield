"use client";

export default function ErrorState({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="sheet rounded-[6px] p-8">
      <p className="hand text-lg text-violet">desk hiccup</p>
      <h2 className="display mt-1 text-3xl italic">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted">The workspace hit an unexpected error. Details stay on the server.</p>
      <button type="button" className="ticket mt-5 rounded-[4px] px-4 py-2 text-sm" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
