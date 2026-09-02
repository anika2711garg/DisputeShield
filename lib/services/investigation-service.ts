import "server-only";

import { getAIProvider } from "@/lib/ai";
import { buildAiContext } from "@/lib/ai/context-builder";
import { DISPUTE_ANALYSIS_PROMPT_VERSION, SYSTEM_GUARDRAILS, analysisUserPrompt } from "@/lib/ai/prompts";
import { getOpenAiModel } from "@/lib/env";
import { createId } from "@/lib/db/ids";
import { hashString } from "@/lib/utils";
import { saveStore } from "@/lib/db/local-store";
import { scoreEvidence } from "@/lib/rules/evidence-score";
import { recommendAction } from "@/lib/rules/recommendation";
import { requiredEvidenceFor } from "@/lib/rules/evidence-requirements";
import { writeAudit } from "./audit-service";
import { getDisputeBundle } from "./dispute-service";
import type { AiInvestigation, RecommendationRecord } from "@/types/domain";

export async function investigateDispute(organizationId: string, disputeId: string, actorId = "system") {
  const bundle = getDisputeBundle(organizationId, disputeId);
  if (!bundle) throw new Error("DISPUTE_NOT_FOUND");

  const score = scoreEvidence({
    reason: bundle.dispute.reasonCode,
    evidence: bundle.evidence,
    shipment: bundle.shipment,
    refunds: bundle.refunds,
    disputeAmount: bundle.dispute.amount,
    paymentCaptured: Boolean(bundle.payment?.captured),
    paymentAmount: bundle.payment?.amount ?? 0,
  });

  const context = buildAiContext({
    dispute: bundle.dispute,
    payment: bundle.payment,
    order: bundle.order,
    customer: bundle.customer,
    shipment: bundle.shipment,
    refunds: bundle.refunds,
    invoice: bundle.invoice,
    messages: bundle.messages,
    evidence: bundle.evidence,
  });

  let modelRecommendation = recommendAction({ score }).modelRecommendation;
  let modelConfidence = 0.55;
  let structured: Record<string, unknown> = {
    fallback: true,
    requiredEvidence: requiredEvidenceFor(bundle.dispute.reasonCode),
    missingEvidence: score.missingCritical.map((type) => ({ type, critical: true })),
  };
  let summary = "Deterministic evidence checks completed. AI was unavailable.";
  let reasonConfidence = 0.5;
  const provider = getAIProvider();
  const started = Date.now();
  let latency = 0;
  try {
    const result = await provider.investigate({
      system: SYSTEM_GUARDRAILS,
      user: analysisUserPrompt(context),
      model: getOpenAiModel(),
    });
    latency = result.latencyMs;
    const knownIds = new Set(bundle.evidence.map((item) => item.id));
    const facts = result.output.keyFacts.filter((fact) => knownIds.has(fact.evidenceId) || fact.evidenceId.startsWith("E"));
    modelRecommendation = result.output.modelRecommendation;
    modelConfidence = result.output.recommendationConfidence;
    summary = result.output.caseSummary;
    reasonConfidence = result.output.reasonConfidence;
    structured = { ...result.output, keyFacts: facts };
  } catch {
    structured = {
      ...structured,
      error: "AI_UNAVAILABLE",
    };
  }

  const rec = recommendAction({
    score,
    modelRecommendation,
    modelConfidence,
    shipmentNeverShipped: bundle.shipment?.status === "never_shipped",
    fullyRefunded: bundle.refunds.reduce((sum, refund) => sum + refund.amount, 0) >= bundle.dispute.amount,
    conflicting: Boolean(bundle.shipment?.rawData.conflicting),
  });

  const investigation: AiInvestigation = {
    id: createId("ai"),
    organizationId,
    disputeId,
    model: provider.name === "openai" ? getOpenAiModel() : "mock-rules-v1",
    promptVersion: DISPUTE_ANALYSIS_PROMPT_VERSION,
    reasonCategory: bundle.dispute.reasonDescription,
    reasonConfidence,
    summary,
    recommendation: rec.modelRecommendation,
    recommendationConfidence: rec.confidence,
    evidenceScore: score.total,
    structuredOutput: structured,
    inputHash: hashString(context),
    latencyMs: latency || Date.now() - started,
    createdAt: new Date().toISOString(),
  };

  const recommendation: RecommendationRecord = {
    id: createId("rec"),
    organizationId,
    disputeId,
    aiInvestigationId: investigation.id,
    modelRecommendation: rec.modelRecommendation,
    rulesRecommendation: rec.rulesRecommendation,
    finalRecommendation: rec.finalRecommendation,
    confidence: rec.confidence,
    score: score.total,
    overrideReasons: rec.overrideReasons,
    createdAt: investigation.createdAt,
  };

  saveStore((store) => {
    store.aiInvestigations.push(investigation);
    store.recommendations.push(recommendation);
    const dispute = store.disputes.find((item) => item.id === disputeId);
    if (dispute && dispute.phase === "received") dispute.phase = "investigating";
    if (dispute && rec.finalRecommendation === "contest") dispute.phase = "ready";
  });

  writeAudit({
    organizationId,
    disputeId,
    actorType: "AI",
    actorId,
    action: "investigation.completed",
    metadata: { score: score.total, recommendation: rec.finalRecommendation, model: investigation.model },
  });

  return { investigation, recommendation, score };
}

export function scoreWhatIf(organizationId: string, disputeId: string, disabledEvidenceIds: string[]) {
  const bundle = getDisputeBundle(organizationId, disputeId);
  if (!bundle) throw new Error("DISPUTE_NOT_FOUND");
  const score = scoreEvidence({
    reason: bundle.dispute.reasonCode,
    evidence: bundle.evidence,
    disabledEvidenceIds,
    shipment: bundle.shipment,
    refunds: bundle.refunds,
    disputeAmount: bundle.dispute.amount,
    paymentCaptured: Boolean(bundle.payment?.captured),
    paymentAmount: bundle.payment?.amount ?? 0,
  });
  const rec = recommendAction({
    score,
    modelRecommendation: bundle.recommendation?.modelRecommendation,
    modelConfidence: bundle.recommendation?.confidence,
    shipmentNeverShipped: bundle.shipment?.status === "never_shipped",
    fullyRefunded: bundle.refunds.reduce((sum, refund) => sum + refund.amount, 0) >= bundle.dispute.amount,
    conflicting: Boolean(bundle.shipment?.rawData.conflicting),
  });
  return { score, recommendation: rec };
}
