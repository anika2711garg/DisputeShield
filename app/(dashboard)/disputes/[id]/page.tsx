import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getDisputeBundle } from "@/lib/services/dispute-service";
import { listAudit } from "@/lib/services/audit-service";
import { scoreEvidence } from "@/lib/rules/evidence-score";
import { DisputeWorkspace } from "@/components/disputes/workspace";

export default async function DisputePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await params;
  const bundle = getDisputeBundle(user.organizationId, id);
  if (!bundle) notFound();
  const score = scoreEvidence({
    reason: bundle.dispute.reasonCode,
    evidence: bundle.evidence,
    shipment: bundle.shipment,
    refunds: bundle.refunds,
    disputeAmount: bundle.dispute.amount,
    paymentCaptured: Boolean(bundle.payment?.captured),
    paymentAmount: bundle.payment?.amount ?? 0,
  });
  const audit = listAudit(user.organizationId, id);
  return <DisputeWorkspace bundle={JSON.parse(JSON.stringify(bundle))} score={score} audit={audit} role={user.role} />;
}
