import Link from "next/link";

export default function NotFound() {
  return (
    <div className="app-grid grid min-h-screen place-items-center px-4">
      <div className="sheet relative max-w-md rounded-[6px] p-8 text-center">
        <span className="stamp">Missing</span>
        <h1 className="display mt-4 text-4xl italic">Not found</h1>
        <p className="mt-2 text-muted">That case is not in this workspace.</p>
        <Link href="/dashboard" className="ink-underline mt-5 inline-block text-cyan">
          Back to the desk
        </Link>
      </div>
    </div>
  );
}
