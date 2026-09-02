import { describe, expect, it } from "vitest";
import { recommendAction } from "@/lib/rules/recommendation";
import { scoreEvidence } from "@/lib/rules/evidence-score";

describe("recommendation rules", () => {
  it("escalates conflicting evidence to human review", () => {
    const score = scoreEvidence({
      reason: "product_not_received",
      paymentCaptured: true,
      paymentAmount: 10000,
      disputeAmount: 10000,
      evidence: [],
      shipment: {
        id: "s",
        organizationId: "o",
        orderId: "ord",
        provider: "X",
        trackingId: "1",
        status: "delivered",
        rawData: { conflicting: true },
      },
    });
    const rec = recommendAction({
      score,
      modelRecommendation: "contest",
      modelConfidence: 0.9,
      conflicting: true,
    });
    expect(rec.finalRecommendation).toBe("human_review");
    expect(rec.rulesRecommendation).toBe("human_review");
  });

  it("accepts a full refund override", () => {
    const score = scoreEvidence({
      reason: "refund_not_received",
      paymentCaptured: true,
      paymentAmount: 10000,
      disputeAmount: 10000,
      evidence: [],
      refunds: [
        {
          id: "r",
          organizationId: "o",
          paymentId: "p",
          razorpayRefundId: "rf",
          amount: 10000,
          status: "processed",
          rawData: {},
          createdAt: new Date().toISOString(),
        },
      ],
    });
    const rec = recommendAction({ score, fullyRefunded: true, modelRecommendation: "contest", modelConfidence: 0.9 });
    expect(rec.rulesRecommendation).toBe("accept");
  });

  it("respects a higher contest threshold", () => {
    const score = {
      total: 75,
      dimensions: [],
      penalties: [],
      missingCritical: [],
    };
    const loose = recommendAction({ score, modelRecommendation: "contest", modelConfidence: 0.9, contestThreshold: 70 });
    const tight = recommendAction({ score, modelRecommendation: "contest", modelConfidence: 0.9, contestThreshold: 90 });
    expect(loose.rulesRecommendation).toBe("contest");
    expect(tight.rulesRecommendation).toBe("human_review");
  });

  it("accepts never shipped", () => {
    const score = scoreEvidence({
      reason: "product_not_received",
      paymentCaptured: true,
      paymentAmount: 1000,
      disputeAmount: 1000,
      evidence: [],
      shipment: {
        id: "s",
        organizationId: "o",
        orderId: "ord",
        provider: "X",
        trackingId: "none",
        status: "never_shipped",
        rawData: {},
      },
    });
    const rec = recommendAction({ score, shipmentNeverShipped: true, modelRecommendation: "contest" });
    expect(rec.rulesRecommendation).toBe("accept");
  });
});
