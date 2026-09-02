import { z } from "zod";

export const aiKeyFactSchema = z.object({
  claim: z.string(),
  evidenceId: z.string(),
  effect: z.enum(["supports", "contradicts", "neutral"]),
  confidence: z.number().min(0).max(1),
});

export const aiRequiredEvidenceSchema = z.object({
  type: z.string(),
  reason: z.string(),
  critical: z.boolean(),
});

export const aiContradictionSchema = z.object({
  summary: z.string(),
  evidenceIds: z.array(z.string()),
});

export const aiInvestigationOutputSchema = z.object({
  reasonCategory: z.string(),
  reasonConfidence: z.number().min(0).max(1),
  merchantPositionSummary: z.string(),
  keyFacts: z.array(aiKeyFactSchema),
  requiredEvidence: z.array(aiRequiredEvidenceSchema),
  missingEvidence: z.array(aiRequiredEvidenceSchema),
  contradictions: z.array(aiContradictionSchema),
  modelRecommendation: z.enum(["contest", "accept", "human_review"]),
  recommendationConfidence: z.number().min(0).max(1),
  rationale: z.string(),
  caseSummary: z.string(),
});

export type AiInvestigationOutput = z.infer<typeof aiInvestigationOutputSchema>;

export const copilotAnswerSchema = z.object({
  answer: z.string(),
  citations: z.array(z.string()),
});

export type CopilotAnswer = z.infer<typeof copilotAnswerSchema>;
