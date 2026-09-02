import type { DisputeReason, EvidenceItem, EvidenceType, Refund, Shipment } from "@/types/domain";
import { criticalEvidenceTypes } from "./evidence-requirements";

export type ScoreDimension = {
  key: string;
  label: string;
  max: number;
  awarded: number;
  note: string;
};

export type ScorePenalty = {
  key: string;
  label: string;
  amount: number;
  note: string;
};

export type ScoreBreakdown = {
  total: number;
  dimensions: ScoreDimension[];
  penalties: ScorePenalty[];
  missingCritical: EvidenceType[];
  override?: string;
};

export type ScoreableFacts = {
  reason: DisputeReason;
  evidence: EvidenceItem[];
  disabledEvidenceIds?: string[];
  shipment?: Shipment | null;
  refunds?: Refund[];
  disputeAmount: number;
  paymentCaptured: boolean;
  paymentAmount: number;
};

const BASE_WEIGHTS = {
  payment: 15,
  billing: 10,
  shippingOrService: 25,
  deliveryOrCompletion: 15,
  acknowledgement: 15,
  history: 5,
  policy: 5,
  consistency: 10,
};

function hasType(evidence: EvidenceItem[], type: EvidenceType): EvidenceItem | undefined {
  return evidence.find((item) => item.type === type);
}

function strength(item: EvidenceItem | undefined, max: number): number {
  if (!item) return 0;
  const verifiedBoost = item.verified ? 1 : 0.75;
  return Math.round(max * Math.min(1, item.strengthScore / 100) * verifiedBoost);
}

export function scoreEvidence(facts: ScoreableFacts): ScoreBreakdown {
  const disabled = new Set(facts.disabledEvidenceIds ?? []);
  const evidence = facts.evidence.filter((item) => !disabled.has(item.id));
  const missingCritical = criticalEvidenceTypes(facts.reason).filter((type) => !hasType(evidence, type));

  const paymentItem = hasType(evidence, "payment");
  const billingItem = hasType(evidence, "billing_proof");
  const shippingItem = hasType(evidence, "shipping_proof") ?? hasType(evidence, "proof_of_service");
  const deliveryItem = hasType(evidence, "delivery_confirmation") ?? hasType(evidence, "access_activity_log");
  const ackItem = hasType(evidence, "customer_communication");
  const policyItem = hasType(evidence, "refund_policy") ?? hasType(evidence, "terms_and_conditions");

  const paymentAwarded = facts.paymentCaptured
    ? strength(paymentItem, BASE_WEIGHTS.payment) || (facts.paymentAmount >= facts.disputeAmount ? BASE_WEIGHTS.payment : 8)
    : 0;

  const dimensions: ScoreDimension[] = [
    {
      key: "payment",
      label: "Payment validity",
      max: BASE_WEIGHTS.payment,
      awarded: paymentAwarded,
      note: facts.paymentCaptured ? "Payment captured and matches the dispute." : "Payment is not captured.",
    },
    {
      key: "billing",
      label: "Billing / invoice",
      max: BASE_WEIGHTS.billing,
      awarded: strength(billingItem, BASE_WEIGHTS.billing),
      note: billingItem ? "Invoice or order proof is present." : "No invoice or billing proof.",
    },
    {
      key: "shipping",
      label: "Shipping / service proof",
      max: BASE_WEIGHTS.shippingOrService,
      awarded: strength(shippingItem, BASE_WEIGHTS.shippingOrService),
      note: shippingItem ? "Fulfillment proof exists." : "No shipping or service proof.",
    },
    {
      key: "delivery",
      label: "Delivery / completion proof",
      max: BASE_WEIGHTS.deliveryOrCompletion,
      awarded: strength(deliveryItem, BASE_WEIGHTS.deliveryOrCompletion),
      note: deliveryItem ? "Completion evidence exists." : "No delivery or completion proof.",
    },
    {
      key: "acknowledgement",
      label: "Customer acknowledgement",
      max: BASE_WEIGHTS.acknowledgement,
      awarded: strength(ackItem, BASE_WEIGHTS.acknowledgement),
      note: ackItem ? "Customer communication is available." : "No customer acknowledgement.",
    },
    {
      key: "history",
      label: "Customer / account history",
      max: BASE_WEIGHTS.history,
      awarded: evidence.some((item) => item.type === "access_activity_log" || item.metadata.repeatCustomer)
        ? BASE_WEIGHTS.history
        : 2,
      note: "Prior account or order history signal.",
    },
    {
      key: "policy",
      label: "Terms / policy",
      max: BASE_WEIGHTS.policy,
      awarded: strength(policyItem, BASE_WEIGHTS.policy),
      note: policyItem ? "Policy documents attached." : "No policy snapshot.",
    },
  ];

  const contradictions = evidence.filter((item) => item.metadata.contradicts === true);
  const shipmentConflict =
    facts.shipment?.status === "unknown" ||
    Boolean(facts.shipment?.rawData.conflicting) ||
    contradictions.length > 0;

  const consistencyAwarded = shipmentConflict ? 0 : BASE_WEIGHTS.consistency;
  dimensions.push({
    key: "consistency",
    label: "Evidence consistency",
    max: BASE_WEIGHTS.consistency,
    awarded: consistencyAwarded,
    note: shipmentConflict ? "Records conflict or are uncertain." : "No material contradictions detected.",
  });

  const penalties: ScorePenalty[] = [];
  if (contradictions.length > 0 || Boolean(facts.shipment?.rawData.conflicting)) {
    penalties.push({
      key: "contradiction",
      label: "Major contradiction",
      amount: -20,
      note: "Evidence records conflict with each other or the merchant position.",
    });
  }
  if (facts.shipment?.status === "never_shipped") {
    penalties.push({
      key: "never_shipped",
      label: "Verified non-shipment",
      amount: -25,
      note: "Merchant records show the product was never shipped.",
    });
  }

  const refundedTotal = (facts.refunds ?? []).reduce((sum, refund) => sum + refund.amount, 0);
  const fullyRefunded = refundedTotal >= facts.disputeAmount && refundedTotal > 0;
  if (fullyRefunded) {
    penalties.push({
      key: "full_refund",
      label: "Full refund already issued",
      amount: -15,
      note: "Merchant already returned the disputed amount.",
    });
  }

  const raw = dimensions.reduce((sum, dim) => sum + dim.awarded, 0) + penalties.reduce((sum, p) => sum + p.amount, 0);
  const total = Math.max(0, Math.min(100, raw));

  let override: string | undefined;
  if (fullyRefunded) override = "full_refund_issued";
  if (facts.shipment?.status === "never_shipped") override = "never_shipped";

  return { total, dimensions, penalties, missingCritical, override };
}
