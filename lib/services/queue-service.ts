import "server-only";

import { getStore, saveStore } from "@/lib/db/local-store";
import { USERS } from "@/lib/demo/constants";
import type { Profile } from "@/types/domain";
import { listDisputes, type DisputeListItem } from "./dispute-service";
import { writeAudit } from "./audit-service";
import { getWorkspaceSettings } from "./settings-service";

export function effectiveAssigneeId(item: DisputeListItem): string | undefined {
  if (item.assigneeId) return item.assigneeId;
  if (item.rawData.hero === true) return USERS.admin.id;
  return undefined;
}

export function listReviewers(organizationId: string): Profile[] {
  return getStore().profiles.filter((item) => item.organizationId === organizationId && (item.role === "admin" || item.role === "reviewer"));
}

export function assignmentQueue(organizationId: string) {
  const reviewers = listReviewers(organizationId);
  const names = Object.fromEntries(reviewers.map((item) => [item.id, item.fullName]));
  const open = listDisputes(organizationId).filter((item) => !["won", "lost", "accepted", "closed"].includes(item.status));
  const rows = open
    .map((item) => {
      const assigneeId = effectiveAssigneeId(item);
      return {
        id: item.id,
        customerName: item.customer?.name,
        amount: item.amount,
        reason: item.reasonDescription,
        score: item.recommendation?.score,
        deadline: item.respondBy,
        status: item.status,
        assigneeId,
        assigneeName: assigneeId ? names[assigneeId] : undefined,
        disagree: Boolean(item.recommendation && item.recommendation.modelRecommendation !== item.recommendation.rulesRecommendation),
      };
    })
    .sort((a, b) => (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999") || b.amount - a.amount);

  return {
    unassigned: rows.filter((item) => !item.assigneeId),
    assigned: rows.filter((item) => item.assigneeId),
    reviewers: reviewers.map((item) => ({ id: item.id, name: item.fullName, role: item.role })),
    autoAssign: getWorkspaceSettings().autoAssign,
  };
}

export function assignDispute(organizationId: string, disputeId: string, assigneeId: string | null, actorId: string) {
  const reviewers = listReviewers(organizationId);
  if (assigneeId && !reviewers.some((item) => item.id === assigneeId)) throw new Error("INVALID_ASSIGNEE");
  let found = false;
  saveStore((store) => {
    const dispute = store.disputes.find((item) => item.id === disputeId && item.organizationId === organizationId);
    if (!dispute) return;
    found = true;
    dispute.assigneeId = assigneeId ?? undefined;
    dispute.updatedAt = new Date().toISOString();
  });
  if (!found) throw new Error("DISPUTE_NOT_FOUND");
  writeAudit({
    organizationId,
    disputeId,
    actorType: "user",
    actorId,
    action: "dispute.assigned",
    metadata: { assigneeId },
  });
}

export function claimNext(organizationId: string, userId: string) {
  const queue = assignmentQueue(organizationId);
  const next = queue.unassigned[0];
  if (!next) return null;
  assignDispute(organizationId, next.id, userId, userId);
  return next.id;
}
