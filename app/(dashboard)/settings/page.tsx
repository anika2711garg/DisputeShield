import { requireSession } from "@/lib/auth/session";
import { canManageTeam } from "@/lib/auth/permissions";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { getWorkspaceSettings, razorpayModeSnapshot } from "@/lib/services/settings-service";
import { onboardingProgress } from "@/lib/services/onboarding-service";
import { SettingsControls } from "@/components/settings/controls";
import { OnboardingChecklist } from "@/components/settings/onboarding-checklist";
import { OpsPanel } from "@/components/settings/ops-panel";
import { FileDownload } from "@/components/ui/file-download";

export default async function SettingsPage() {
  const user = await requireSession();
  const settings = getWorkspaceSettings();
  const razorpay = razorpayModeSnapshot();
  const onboarding = onboardingProgress(user.organizationId);
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Theme, Razorpay write mode, team, and go-live checks." />
      <Card>
        <div className="text-sm text-muted">Signed in as</div>
        <div className="mt-1 text-lg font-medium">{user.fullName}</div>
        <div className="text-sm text-muted">
          {user.email} · {user.role}
        </div>
      </Card>
      <OnboardingChecklist steps={onboarding.steps} done={onboarding.done} total={onboarding.total} />
      <SettingsControls settings={settings} razorpay={razorpay} />
      {canManageTeam(user.role) && <OpsPanel />}
      <div className="flex flex-wrap gap-3">
        <Link href="/settings/password" className="rounded-[10px] bg-white px-4 py-2 text-sm hairline">
          Password
        </Link>
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
        <FileDownload href="/api/disputes/export" className="rounded-[10px] bg-white px-4 py-2 text-sm hairline">
          Export disputes CSV
        </FileDownload>
        <FileDownload href="/api/activity/export" className="rounded-[10px] bg-white px-4 py-2 text-sm hairline">
          Export audit CSV
        </FileDownload>
      </div>
    </div>
  );
}
