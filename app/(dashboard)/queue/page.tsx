import { requireSession } from "@/lib/auth/session";
import { assignmentQueue } from "@/lib/services/queue-service";
import { PageHeader } from "@/components/ui/page-header";
import { AssignmentQueue } from "@/components/queue/assignment-queue";

export default async function QueuePage() {
  const user = await requireSession();
  const queue = assignmentQueue(user.organizationId);
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Assignment queue"
        description="Claim the next deadline. Analysts can prepare files; only reviewers and admins appear as owners."
      />
      <AssignmentQueue unassigned={queue.unassigned} assigned={queue.assigned} reviewers={queue.reviewers} me={user.id} />
    </div>
  );
}
