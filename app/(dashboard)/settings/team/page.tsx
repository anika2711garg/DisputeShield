import { requireSession } from "@/lib/auth/session";
import { canManageTeam } from "@/lib/auth/permissions";
import { listTeam } from "@/lib/services/team-service";
import { PageHeader } from "@/components/ui/page-header";
import { TeamPanel } from "@/components/settings/team-panel";

export default async function TeamPage() {
  const user = await requireSession();
  const members = listTeam(user.organizationId);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="Admins invite reviewers and analysts. Only admin and reviewer can contest or accept."
      />
      <TeamPanel members={members} me={user.id} canManage={canManageTeam(user.role)} />
    </div>
  );
}
