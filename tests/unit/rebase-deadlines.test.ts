import { describe, expect, it } from "vitest";
import { emptyStore } from "@/types/domain";
import { rebaseOpenDeadlines } from "@/lib/demo/rebase-deadlines";

function dispute(id: string, respondBy: string, status: "open" | "won" = "open") {
  return {
    id,
    organizationId: "org",
    razorpayDisputeId: `rp_${id}`,
    paymentId: `pay_${id}`,
    amount: 1000,
    currency: "INR" as const,
    reasonCode: "product_not_received" as const,
    reasonDescription: "Product not received",
    phase: "ready" as const,
    status,
    respondBy,
    createdAt: "2026-08-10T10:00:00.000Z",
    updatedAt: "2026-08-10T10:00:00.000Z",
    rawData: {},
  };
}

describe("rebaseOpenDeadlines", () => {
  it("shifts stale open cases so the latest deadline is 36 hours out", () => {
    const store = emptyStore();
    store.disputes.push(dispute("disp_a", "2026-08-20T10:00:00.000Z"));
    const now = Date.parse("2026-09-05T01:00:00.000Z");
    expect(rebaseOpenDeadlines(store, now)).toBe(true);
    expect(new Date(store.disputes[0]?.respondBy ?? "").getTime()).toBe(now + 36 * 3_600_000);
  });

  it("leaves current deadlines alone", () => {
    const store = emptyStore();
    const now = Date.parse("2026-09-05T01:00:00.000Z");
    store.disputes.push(dispute("disp_b", new Date(now + 8 * 3_600_000).toISOString()));
    expect(rebaseOpenDeadlines(store, now)).toBe(false);
  });
});
