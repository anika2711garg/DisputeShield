import { describe, expect, it } from "vitest";
import { attachEvaluationBenchmark, buildDemoStore } from "@/lib/demo/seed-data";

describe("demo seed", () => {
  it("keeps login-time seed free of the 150-case evaluation bench", () => {
    const store = buildDemoStore();
    expect(store.evaluationCases).toHaveLength(0);
    expect(store.evaluationRuns).toHaveLength(0);
    expect(store.profiles.some((item) => item.email === "admin@disputeshield.dev")).toBe(true);
    expect(store.disputes.some((item) => item.id === "disp_hero_macbook")).toBe(true);
  });

  it("attaches the held-out bench only when asked", () => {
    const store = attachEvaluationBenchmark(buildDemoStore());
    expect(store.evaluationCases).toHaveLength(150);
    expect(store.evaluationRuns.length).toBeGreaterThan(0);
  });
});
