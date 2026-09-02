import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md rounded-3xl bg-surface p-8 hairline">
        <h1 className="text-2xl font-semibold">Create a workspace</h1>
        <p className="mt-3 text-sm text-muted">
          For the hackathon demo, use the seeded Northstar Electronics workspace. Signup against Supabase Auth activates when project credentials are present.
        </p>
        <Link href="/login" className="mt-6 inline-flex rounded-lg bg-cyan px-4 py-2 text-sm font-medium text-black">
          Use demo login
        </Link>
      </div>
    </div>
  );
}
