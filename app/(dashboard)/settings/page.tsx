import { requireSession } from "@/lib/auth/session";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { getWorkspaceSettings, razorpayModeSnapshot } from "@/lib/services/settings-service";
import { SettingsControls } from "@/components/settings/controls";

export default async function SettingsPage() {
  const user = await requireSession();
  const settings = getWorkspaceSettings();
  const razorpay = razorpayModeSnapshot();
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Theme, Razorpay write mode, and workspace identity." />
      <Card>
        <div className="text-sm text-muted">Signed in as</div>
        <div className="mt-1 text-lg font-medium">{user.fullName}</div>
        <div className="text-sm text-muted">
          {user.email} · {user.role}
        </div>
      </Card>
      <SettingsControls settings={settings} razorpay={razorpay} />
      <div className="flex flex-wrap gap-3">
        <Link href="/settings/integrations" className="rounded-[10px] bg-white px-4 py-2 text-sm hairline">
          Integrations
        </Link>
        <Link href="/settings/team" className="rounded-[10px] bg-white px-4 py-2 text-sm hairline">
          Team
        </Link>
        <Link href="/lab" className="rounded-[10px] bg-white px-4 py-2 text-sm hairline">
          Rules lab
        </Link>
        <Link href="/webhooks" className="rounded-[10px] bg-white px-4 py-2 text-sm hairline">
          Webhook inbox
        </Link>
      </div>
    </div>
  );
}
