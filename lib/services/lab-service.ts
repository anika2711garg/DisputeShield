import "server-only";

import { scoreEvidence } from "@/lib/rules/evidence-score";
import { recommendAction } from "@/lib/rules/recommendation";
import { getDisputeBundle, listDisputes } from "./dispute-service";

export function simulateThreshold(organizationId: string, contestThreshold: number) {
  const items = listDisputes(organizationId);
  const rows = items.map((item) => {
    const bundle = getDisputeBundle(organizationId, item.id);
    if (!bundle) {
      return {
        id: item.id,
        customerName: item.customer?.name,
        score: item.recommendation?.score ?? 0,
        current: item.recommendation?.finalRecommendation ?? "human_review",
        next: item.recommendation?.finalRecommendation ?? "human_review",
        flipped: false,
      };
    }
    const score = scoreEvidence({
      reason: bundle.dispute.reasonCode,
      evidence: bundle.evidence,
      shipment: bundle.shipment,
      refunds: bundle.refunds,
      disputeAmount: bundle.dispute.amount,
      paymentCaptured: Boolean(bundle.payment?.captured),
      paymentAmount: bundle.payment?.amount ?? 0,
    });
    const rec = recommendAction({
      score,
      modelRecommendation: item.recommendation?.modelRecommendation,
      modelConfidence: item.recommendation?.confidence,
      shipmentNeverShipped: bundle.shipment?.status === "never_shipped",
      fullyRefunded: bundle.refunds.reduce((sum, refund) => sum + refund.amount, 0) >= bundle.dispute.amount,
      conflicting: Boolean(bundle.shipment?.rawData.conflicting),
      contestThreshold,
    });
    const current = item.recommendation?.finalRecommendation ?? "human_review";
    return {
      id: item.id,
      customerName: item.customer?.name,
      amount: item.amount,
      score: score.total,
      current,
      next: rec.finalRecommendation,
      rules: rec.rulesRecommendation,
      ai: rec.modelRecommendation,
      flipped: current !== rec.finalRecommendation,
      disagree: rec.modelRecommendation !== rec.rulesRecommendation,
    };
  });

  return {
    contestThreshold,
    contest: rows.filter((item) => item.next === "contest").length,
    accept: rows.filter((item) => item.next === "accept").length,
    review: rows.filter((item) => item.next === "human_review").length,
    flipped: rows.filter((item) => item.flipped).length,
    disagreements: rows.filter((item) => item.disagree).length,
    rows: rows.sort((a, b) => Number(b.flipped) - Number(a.flipped) || b.score - a.score),
  };
}
