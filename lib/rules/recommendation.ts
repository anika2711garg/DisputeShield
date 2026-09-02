import type { Recommendation } from "@/types/domain";
import type { ScoreBreakdown } from "./evidence-score";

export type RecommendationInput = {
  score: ScoreBreakdown;
  modelRecommendation?: Recommendation;
  modelConfidence?: number;
  shipmentNeverShipped?: boolean;
  fullyRefunded?: boolean;
  conflicting?: boolean;
};

export type RecommendationResult = {
  modelRecommendation: Recommendation;
  rulesRecommendation: Recommendation;
  finalRecommendation: Recommendation;
  overrideReasons: string[];
  confidence: number;
};

const CONFIDENCE_THRESHOLD = 0.62;

export function recommendAction(input: RecommendationInput): RecommendationResult {
  const overrides: string[] = [];
  const modelRecommendation = input.modelRecommendation ?? "human_review";
  const modelConfidence = input.modelConfidence ?? 0.5;

  let rules: Recommendation;
  if (input.fullyRefunded || input.score.override === "full_refund_issued") {
    rules = "accept";
    overrides.push("Full refund already issued.");
  } else if (input.shipmentNeverShipped || input.score.override === "never_shipped") {
    rules = "accept";
    overrides.push("Product was never shipped.");
  } else if (input.conflicting || input.score.penalties.some((p) => p.key === "contradiction")) {
    rules = "human_review";
    overrides.push("Evidence records strongly conflict.");
  } else if (input.score.missingCritical.length > 0) {
    rules = "human_review";
    overrides.push(`Missing critical evidence: ${input.score.missingCritical.join(", ")}.`);
  } else if (input.score.total >= 80) {
    rules = "contest";
  } else if (input.score.total >= 50) {
    rules = "human_review";
  } else {
    rules = "human_review";
    overrides.push("Evidence score is too low to contest safely.");
  }

  if (modelConfidence < CONFIDENCE_THRESHOLD && rules === "contest") {
    rules = "human_review";
    overrides.push("AI confidence below threshold.");
  }

  let finalRecommendation = rules;
  if (rules === "contest" && modelRecommendation === "accept") {
    finalRecommendation = "human_review";
    overrides.push("AI and rules disagree on contest vs accept.");
  }
  if (rules === "accept" && modelRecommendation === "contest") {
    finalRecommendation = "human_review";
    overrides.push("AI wants to contest a case rules would accept.");
  }

  const confidence = Math.max(0.35, Math.min(0.99, modelConfidence * (overrides.length ? 0.85 : 1)));

  return {
    modelRecommendation,
    rulesRecommendation: rules,
    finalRecommendation,
    overrideReasons: overrides,
    confidence,
  };
}
