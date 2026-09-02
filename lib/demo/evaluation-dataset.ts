import type { Difficulty, EvaluationCase, Recommendation } from "@/types/domain";
import { mulberry32, pick } from "./prng";

const REASONS = [
  "product_not_received",
  "transaction_not_recognised",
  "duplicate_transaction",
  "service_not_provided",
  "refund_not_received",
  "product_not_as_described",
] as const;

export function generateEvaluationCases(seed = 8291): EvaluationCase[] {
  const rand = mulberry32(seed);
  const cases: EvaluationCase[] = [];

  for (let i = 0; i < 150; i += 1) {
    const split = i < 100 ? "development" : "held_out";
    const difficulty = difficultyFor(i);
    const reason = REASONS[i % REASONS.length] ?? "product_not_received";
    const scenario = scenarioFor(i, difficulty, rand);
    cases.push({
      id: `eval_${String(i + 1).padStart(3, "0")}`,
      caseKey: `case_${reason}_${difficulty}_${i + 1}`,
      split,
      inputData: {
        reason,
        amount: scenario.amount,
        paymentCaptured: scenario.paymentCaptured,
        hasInvoice: scenario.hasInvoice,
        shipmentStatus: scenario.shipmentStatus,
        hasDeliveryProof: scenario.hasDeliveryProof,
        hasAcknowledgement: scenario.hasAcknowledgement,
        fullyRefunded: scenario.fullyRefunded,
        conflicting: scenario.conflicting,
        neverShipped: scenario.neverShipped,
        conversationTone: scenario.conversationTone,
      },
      groundTruth: scenario.groundTruth,
      difficulty,
      createdAt: "2026-08-01T00:00:00.000Z",
    });
  }

  return cases;
}

function difficultyFor(index: number): Difficulty {
  if (index % 17 === 0) return "adversarial";
  if (index % 5 === 0) return "hard";
  if (index % 3 === 0) return "medium";
  return "easy";
}

function scenarioFor(
  index: number,
  difficulty: Difficulty,
  rand: () => number,
): {
  amount: number;
  paymentCaptured: boolean;
  hasInvoice: boolean;
  shipmentStatus: string;
  hasDeliveryProof: boolean;
  hasAcknowledgement: boolean;
  fullyRefunded: boolean;
  conflicting: boolean;
  neverShipped: boolean;
  conversationTone: string;
  groundTruth: Recommendation;
} {
  const amount = [4999, 12999, 15000, 24999, 39999, 60000, 89999][index % 7] ?? 15000;
  const base = {
    amount,
    paymentCaptured: true,
    hasInvoice: true,
    shipmentStatus: "delivered",
    hasDeliveryProof: true,
    hasAcknowledgement: true,
    fullyRefunded: false,
    conflicting: false,
    neverShipped: false,
    conversationTone: "grateful",
    groundTruth: "contest" as Recommendation,
  };

  if (index % 11 === 0) {
    return {
      ...base,
      fullyRefunded: true,
      conversationTone: "refund_requested",
      groundTruth: "accept",
    };
  }
  if (index % 13 === 0) {
    return {
      ...base,
      neverShipped: true,
      shipmentStatus: "never_shipped",
      hasDeliveryProof: false,
      hasAcknowledgement: false,
      conversationTone: "angry",
      groundTruth: "accept",
    };
  }
  if (difficulty === "adversarial" || index % 9 === 0) {
    return {
      ...base,
      conflicting: true,
      shipmentStatus: pick(rand, ["delivered", "in_transit", "unknown"]),
      hasDeliveryProof: rand() > 0.4,
      conversationTone: "inconsistent",
      groundTruth: "human_review",
    };
  }
  if (difficulty === "hard" || index % 4 === 0) {
    return {
      ...base,
      shipmentStatus: "unknown",
      hasDeliveryProof: false,
      hasAcknowledgement: false,
      conversationTone: "sparse",
      groundTruth: "human_review",
    };
  }
  if (index % 8 === 0) {
    return {
      ...base,
      hasInvoice: true,
      hasDeliveryProof: false,
      hasAcknowledgement: false,
      shipmentStatus: "in_transit",
      conversationTone: "waiting",
      groundTruth: "human_review",
    };
  }
  return base;
}

export function evaluateFromFacts(input: EvaluationCase["inputData"]): { label: Recommendation; score: number; confidence: number } {
  const facts = input as {
    paymentCaptured?: boolean;
    hasInvoice?: boolean;
    shipmentStatus?: string;
    hasDeliveryProof?: boolean;
    hasAcknowledgement?: boolean;
    fullyRefunded?: boolean;
    conflicting?: boolean;
    neverShipped?: boolean;
    amount?: number;
  };

  let score = 18;
  if (facts.paymentCaptured) score += 15;
  if (facts.hasInvoice) score += 10;
  if (facts.shipmentStatus === "delivered") score += 22;
  else if (facts.shipmentStatus === "in_transit") score += 8;
  if (facts.hasDeliveryProof) score += 14;
  if (facts.hasAcknowledgement) score += 14;
  if (facts.conflicting) score -= 20;
  if (facts.neverShipped) score -= 25;
  if (facts.fullyRefunded) score -= 15;
  score = Math.max(0, Math.min(100, score));

  if (facts.fullyRefunded || facts.neverShipped) return { label: "accept", score, confidence: 0.91 };
  if (facts.conflicting || score < 80) return { label: "human_review", score, confidence: 0.76 };
  return { label: "contest", score, confidence: 0.93 };
}
