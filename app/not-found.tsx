import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Not found</h1>
        <p className="mt-2 text-muted">That case is not in this workspace.</p>
        <Link href="/dashboard" className="mt-4 inline-block text-cyan">Back to overview</Link>
      </div>
    </div>
  );
}
