import { describe, expect, it } from "vitest";
import { scoreEvidence } from "@/lib/rules/evidence-score";
import type { EvidenceItem } from "@/types/domain";

function ev(partial: Partial<EvidenceItem> & Pick<EvidenceItem, "id" | "type">): EvidenceItem {
  return {
    organizationId: "org",
    disputeId: "d",
    title: partial.id,
    source: "test",
    metadata: {},
    verified: true,
    relevanceScore: 90,
    strengthScore: 90,
    includedInContest: true,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

describe("evidence score", () => {
  it("scores a strong delivered + acknowledged case highly", () => {
    const result = scoreEvidence({
      reason: "product_not_received",
      paymentCaptured: true,
      paymentAmount: 60000,
      disputeAmount: 60000,
      evidence: [
        ev({ id: "E01", type: "payment" }),
        ev({ id: "E02", type: "billing_proof" }),
        ev({ id: "E03", type: "shipping_proof" }),
        ev({ id: "E04", type: "delivery_confirmation" }),
        ev({ id: "E05", type: "customer_communication" }),
        ev({ id: "E06", type: "terms_and_conditions" }),
      ],
      shipment: {
        id: "s",
        organizationId: "org",
        orderId: "o",
        provider: "BlueDart",
        trackingId: "BD",
        status: "delivered",
        rawData: {},
      },
    });
    expect(result.total).toBeGreaterThanOrEqual(85);
    expect(result.missingCritical).toHaveLength(0);
  });

  it("drops score when delivery evidence is disabled", () => {
    const evidence = [
      ev({ id: "E01", type: "payment" }),
      ev({ id: "E02", type: "billing_proof" }),
      ev({ id: "E03", type: "shipping_proof" }),
      ev({ id: "E04", type: "delivery_confirmation" }),
      ev({ id: "E05", type: "customer_communication" }),
    ];
    const full = scoreEvidence({
      reason: "product_not_received",
      paymentCaptured: true,
      paymentAmount: 60000,
      disputeAmount: 60000,
      evidence,
    });
    const reduced = scoreEvidence({
      reason: "product_not_received",
      paymentCaptured: true,
      paymentAmount: 60000,
      disputeAmount: 60000,
      evidence,
      disabledEvidenceIds: ["E04", "E05"],
    });
    expect(reduced.total).toBeLessThan(full.total);
  });
});
