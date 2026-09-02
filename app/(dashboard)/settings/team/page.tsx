import { requireSession } from "@/lib/auth/session";
import { getStore } from "@/lib/db/local-store";
import { Card } from "@/components/ui/card";

export default async function TeamPage() {
  const user = await requireSession();
  const members = getStore().profiles.filter((item) => item.organizationId === user.organizationId);
  return (
    <div className="space-y-6">
      <h1 className="text-[28px] font-semibold tracking-tight">Team</h1>
      <div className="grid gap-3">
        {members.map((member) => (
          <Card key={member.id}>
            <div className="font-medium">{member.fullName}</div>
            <div className="text-sm text-muted">{member.email} · {member.role}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
