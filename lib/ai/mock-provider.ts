import type { AiInvestigationOutput } from "./schemas";
import type { AIProvider, CopilotRequest, InvestigationRequest } from "./provider";

function extract(tag: string, text: string, fallback = ""): string {
  const match = text.match(new RegExp(`${tag}:(.+)`));
  return match?.[1]?.trim() ?? fallback;
}

export class MockAIProvider implements AIProvider {
  name = "mock" as const;

  async investigate(request: InvestigationRequest) {
    const started = Date.now();
    const user = request.user;
    const reason = extract("REASON", user, "product_not_received");
    const score = Number(extract("SCORE_HINT", user, "70"));
    const missing = extract("MISSING", user, "");
    const refunded = extract("REFUNDED", user, "false") === "true";
    const neverShipped = extract("NEVER_SHIPPED", user, "false") === "true";
    const conflicting = extract("CONFLICTING", user, "false") === "true";
    const evidenceIds = [...user.matchAll(/EVIDENCE_ID:([a-zA-Z0-9_-]+)/g)].map((m) => m[1] ?? "");

    let modelRecommendation: AiInvestigationOutput["modelRecommendation"] = "human_review";
    if (refunded || neverShipped) modelRecommendation = "accept";
    else if (conflicting || missing.includes("delivery") || score < 55) modelRecommendation = "human_review";
    else if (score >= 80) modelRecommendation = "contest";

    const output: AiInvestigationOutput = {
      reasonCategory: reason.replaceAll("_", " "),
      reasonConfidence: 0.9,
      merchantPositionSummary:
        modelRecommendation === "contest"
          ? "Merchant fulfillment and customer communication support contesting the dispute."
          : modelRecommendation === "accept"
            ? "Merchant records support accepting rather than contesting."
            : "Evidence is incomplete or conflicting; a human should review.",
      keyFacts: evidenceIds.slice(0, 6).map((id) => ({
        claim: `Fact derived from ${id}`,
        evidenceId: id,
        effect: conflicting && id.includes("ship") ? "contradicts" : "supports",
        confidence: 0.88,
      })),
      requiredEvidence: [
        { type: "shipping_proof", reason: "Needed for fulfillment disputes", critical: true },
        { type: "delivery_confirmation", reason: "Needed for non-receipt claims", critical: true },
      ],
      missingEvidence: missing
        ? missing.split(",").filter(Boolean).map((type) => ({ type: type.trim(), reason: "Not present in case file", critical: true }))
        : [],
      contradictions: conflicting
        ? [{ summary: "Shipping records conflict with the claimed delivery state.", evidenceIds: evidenceIds.slice(0, 2) }]
        : [],
      modelRecommendation,
      recommendationConfidence: modelRecommendation === "contest" ? 0.94 : 0.78,
      rationale:
        modelRecommendation === "contest"
          ? "Delivery and customer acknowledgement contradict the non-receipt claim."
          : modelRecommendation === "accept"
            ? "A full refund or verified non-shipment makes contesting unsafe."
            : "Critical evidence is missing or records conflict.",
      caseSummary:
        modelRecommendation === "contest"
          ? "Strong merchant evidence supports contesting this dispute."
          : "This case needs caution before any financial action.",
    };

    return { output, raw: JSON.stringify(output), latencyMs: Date.now() - started + 40 };
  }

  async answerCopilot(request: CopilotRequest) {
    const started = Date.now();
    const question = request.user.toLowerCase();
    if (question.includes("missing")) {
      return {
        output: {
          answer: "The weakest gap is any category marked missing on the case file. Contesting without it increases human-review risk.",
          citations: ["Case file — Missing evidence"],
        },
        latencyMs: Date.now() - started,
      };
    }
    if (question.includes("strongest") || question.includes("contest")) {
      return {
        output: {
          answer: "The strongest merchant position is delivery confirmation plus any customer acknowledgement of receipt.",
          citations: ["Delivery confirmation", "Customer communication"],
        },
        latencyMs: Date.now() - started,
      };
    }
    return {
      output: {
        answer: "Use the evidence list and score breakdown. I can only cite items already on this dispute.",
        citations: [],
      },
      latencyMs: Date.now() - started,
    };
  }
}
