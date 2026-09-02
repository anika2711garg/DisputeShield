import { describe, expect, it } from "vitest";
import { evaluateFromFacts, generateEvaluationCases } from "@/lib/demo/evaluation-dataset";

describe("held-out evaluation", () => {
  it("generates 150 reproducible cases", () => {
    const a = generateEvaluationCases(8291);
    const b = generateEvaluationCases(8291);
    expect(a).toHaveLength(150);
    expect(a.filter((item) => item.split === "held_out")).toHaveLength(50);
    expect(a.map((item) => item.caseKey)).toEqual(b.map((item) => item.caseKey));
  });

  it("does not contest a never-shipped ground-truth accept case", () => {
    const result = evaluateFromFacts({ neverShipped: true, paymentCaptured: true, amount: 8999 });
    expect(result.label).toBe("accept");
  });
});
