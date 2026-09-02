import { requireSession } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function SettingsPage() {
  const user = await requireSession();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Settings</h1>
      <Card>
        <div className="text-sm text-muted">Signed in as</div>
        <div className="mt-1 text-lg">{user.fullName}</div>
        <div className="text-sm text-muted">{user.email} · {user.role}</div>
      </Card>
      <div className="flex gap-3">
        <Link href="/settings/integrations" className="rounded-lg px-4 py-2 hairline">Integrations</Link>
        <Link href="/settings/team" className="rounded-lg px-4 py-2 hairline">Team</Link>
      </div>
    </div>
  );
}
