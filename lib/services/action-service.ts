import "server-only";

import { assertFinancialRole } from "@/lib/auth/permissions";
import { createId } from "@/lib/db/ids";
import { saveStore } from "@/lib/db/local-store";
import { getRazorpayAdapter } from "@/lib/razorpay/client";
import { isSimulatedWrite } from "@/lib/razorpay/types";
import type { SessionUser } from "@/lib/auth/session";
import { writeAudit } from "./audit-service";
import { getDisputeBundle } from "./dispute-service";
import { notify } from "./notification-service";

export function saveContestDraft(user: SessionUser, disputeId: string, selectedEvidenceIds: string[], summary: string) {
  const bundle = getDisputeBundle(user.organizationId, disputeId);
  if (!bundle) throw new Error("DISPUTE_NOT_FOUND");
  saveStore((store) => {
    const existing = store.contestDrafts.find((item) => item.disputeId === disputeId);
    if (existing) {
      existing.selectedEvidenceIds = selectedEvidenceIds;
      existing.summary = summary;
      existing.updatedAt = new Date().toISOString();
    } else {
      store.contestDrafts.push({
        id: createId("draft"),
        organizationId: user.organizationId,
        disputeId,
        selectedEvidenceIds,
        summary,
        updatedAt: new Date().toISOString(),
      });
    }
  });
  writeAudit({
    organizationId: user.organizationId,
    disputeId,
    actorType: "user",
    actorId: user.id,
    action: "contest.draft_saved",
    metadata: { documents: selectedEvidenceIds.length },
  });
}

export async function submitContest(user: SessionUser, disputeId: string, selectedEvidenceIds: string[], acknowledged: boolean) {
  assertFinancialRole(user.role);
  if (!acknowledged) throw new Error("ACK_REQUIRED");
  const bundle = getDisputeBundle(user.organizationId, disputeId);
  if (!bundle) throw new Error("DISPUTE_NOT_FOUND");

  const existing = bundle.approvals.find((item) => item.action === "contest" && item.status !== "rejected");
  if (existing) {
    return { duplicate: true, simulated: existing.status === "simulated", approval: existing };
  }

  const adapter = getRazorpayAdapter();
  const result = await adapter.contestDispute(bundle.dispute.razorpayDisputeId, {
    amount: bundle.dispute.amount,
    summary: bundle.draft?.summary ?? bundle.investigation?.summary ?? "Merchant contest package",
    documentIds: selectedEvidenceIds,
    action: "submit",
  });
  const simulated = isSimulatedWrite(result);
  const approval = {
    id: createId("apr"),
    organizationId: user.organizationId,
    disputeId,
    userId: user.id,
    action: "contest" as const,
    status: simulated ? ("simulated" as const) : ("approved" as const),
    notes: simulated ? "Simulation mode — no financial action was sent to Razorpay." : "Submitted to Razorpay",
    createdAt: new Date().toISOString(),
  };

  saveStore((store) => {
    store.approvals.push(approval);
    const dispute = store.disputes.find((item) => item.id === disputeId);
    if (dispute) {
      dispute.status = "under_review";
      dispute.phase = "submitted";
      dispute.updatedAt = approval.createdAt;
    }
  });

  writeAudit({
    organizationId: user.organizationId,
    disputeId,
    actorType: "user",
    actorId: user.id,
    action: simulated ? "contest.simulated" : "contest.submitted",
    metadata: { documents: selectedEvidenceIds.length },
  });
  notify({
    organizationId: user.organizationId,
    title: simulated ? "Contest simulated" : "Contest submitted",
    body: `${bundle.dispute.id} sent for review`,
    href: `/disputes/${disputeId}`,
  });
  return { duplicate: false, simulated, approval };
}

export async function acceptDispute(user: SessionUser, disputeId: string, typed: string) {
  assertFinancialRole(user.role);
  if (typed !== "ACCEPT") throw new Error("CONFIRMATION_MISMATCH");
  const bundle = getDisputeBundle(user.organizationId, disputeId);
  if (!bundle) throw new Error("DISPUTE_NOT_FOUND");
  const existing = bundle.approvals.find((item) => item.action === "accept");
  if (existing) return { duplicate: true, simulated: existing.status === "simulated", approval: existing };

  const adapter = getRazorpayAdapter();
  const result = await adapter.acceptDispute(bundle.dispute.razorpayDisputeId);
  const simulated = isSimulatedWrite(result);
  const approval = {
    id: createId("apr"),
    organizationId: user.organizationId,
    disputeId,
    userId: user.id,
    action: "accept" as const,
    status: simulated ? ("simulated" as const) : ("approved" as const),
    notes: simulated ? "Simulation mode — no financial action was sent to Razorpay." : "Accepted on Razorpay",
    createdAt: new Date().toISOString(),
  };
  saveStore((store) => {
    store.approvals.push(approval);
    const dispute = store.disputes.find((item) => item.id === disputeId);
    if (dispute) {
      dispute.status = "accepted";
      dispute.phase = "closed";
      dispute.updatedAt = approval.createdAt;
    }
  });
  writeAudit({
    organizationId: user.organizationId,
    disputeId,
    actorType: "user",
    actorId: user.id,
    action: simulated ? "accept.simulated" : "accept.submitted",
    metadata: {},
  });
  return { duplicate: false, simulated, approval };
}
