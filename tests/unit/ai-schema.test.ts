import { describe, expect, it } from "vitest";
import { aiInvestigationOutputSchema } from "@/lib/ai/schemas";

describe("AI schema", () => {
  it("rejects fabricated unstructured output", () => {
    const parsed = aiInvestigationOutputSchema.safeParse({ hello: "world" });
    expect(parsed.success).toBe(false);
  });

  it("accepts a complete investigation payload", () => {
    const parsed = aiInvestigationOutputSchema.safeParse({
      reasonCategory: "product not received",
      reasonConfidence: 0.97,
      merchantPositionSummary: "Delivered",
      keyFacts: [{ claim: "Delivered", evidenceId: "E04", effect: "supports", confidence: 0.9 }],
      requiredEvidence: [{ type: "shipping_proof", reason: "needed", critical: true }],
      missingEvidence: [],
      contradictions: [],
      modelRecommendation: "contest",
      recommendationConfidence: 0.94,
      rationale: "Delivery + ack",
      caseSummary: "Strong",
    });
    expect(parsed.success).toBe(true);
  });
});
