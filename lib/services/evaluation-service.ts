import "server-only";

import { evaluateFromFacts } from "@/lib/demo/evaluation-dataset";
import { attachEvaluationBenchmark } from "@/lib/demo/seed-data";
import { createId } from "@/lib/db/ids";
import { getStore, saveStore } from "@/lib/db/local-store";
import type { EvaluationRun, Recommendation } from "@/types/domain";

export function ensureEvaluationData(): void {
  const store = getStore();
  if (store.evaluationCases.length) return;
  saveStore((next) => {
    attachEvaluationBenchmark(next);
  });
}

export function latestEvaluationRun(): EvaluationRun | undefined {
  ensureEvaluationData();
  return getStore().evaluationRuns.at(-1);
}

export function runHeldOutEvaluation(model = "mock-rules-v1", promptVersion = "v1.0.0"): EvaluationRun {
  ensureEvaluationData();
  const store = getStore();
  const heldOut = store.evaluationCases.filter((item) => item.split === "held_out");
  const runId = createId("erun");
  let correct = 0;
  let fp = 0;
  let fn = 0;
  let escalations = 0;
  let fpCost = 0;
  const confusion: Record<Recommendation, Record<Recommendation, number>> = {
    contest: { contest: 0, accept: 0, human_review: 0 },
    accept: { contest: 0, accept: 0, human_review: 0 },
    human_review: { contest: 0, accept: 0, human_review: 0 },
  };

  const predictions = heldOut.map((evaluationCase) => {
    const prediction = evaluateFromFacts(evaluationCase.inputData);
    const isCorrect = prediction.label === evaluationCase.groundTruth;
    if (isCorrect) correct += 1;
    if (prediction.label === "contest" && evaluationCase.groundTruth === "accept") {
      fp += 1;
      fpCost += Number(evaluationCase.inputData.amount ?? 0) * 0.08 + 450;
    }
    if (prediction.label === "accept" && evaluationCase.groundTruth === "contest") fn += 1;
    if (prediction.label === "human_review") escalations += 1;
    confusion[evaluationCase.groundTruth][prediction.label] += 1;
    return {
      id: createId("epred"),
      evaluationCaseId: evaluationCase.id,
      runId,
      predictedLabel: prediction.label,
      confidence: prediction.confidence,
      score: prediction.score,
      correct: isCorrect,
      createdAt: new Date().toISOString(),
    };
  });

  const contestPred = predictions.filter((item) => item.predictedLabel === "contest");
  const contestTruth = heldOut.filter((item) => item.groundTruth === "contest");
  const tp = predictions.filter((item) => {
    const truth = heldOut.find((row) => row.id === item.evaluationCaseId)?.groundTruth;
    return item.predictedLabel === "contest" && truth === "contest";
  }).length;

  const run: EvaluationRun = {
    id: runId,
    model,
    promptVersion,
    totalCases: heldOut.length,
    precision: contestPred.length ? tp / contestPred.length : 0,
    recall: contestTruth.length ? tp / contestTruth.length : 0,
    accuracy: heldOut.length ? correct / heldOut.length : 0,
    falsePositives: fp,
    falseNegatives: fn,
    humanEscalations: escalations,
    falsePositiveCost: Math.round(fpCost),
    results: { confusion, split: "held_out" },
    createdAt: new Date().toISOString(),
  };

  saveStore((next) => {
    next.evaluationPredictions.push(...predictions);
    next.evaluationRuns.push(run);
  });
  return run;
}
