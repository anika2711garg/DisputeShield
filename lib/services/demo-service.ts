import "server-only";

import { HERO_DISPUTE_ID } from "@/lib/demo/constants";
import { ingestWebhook } from "./webhook-service";
import { investigateDispute } from "./investigation-service";
import { getStore, saveStore } from "@/lib/db/local-store";
import { ORG_ID } from "@/lib/demo/constants";

const SCENARIOS: Record<string, { event: string; id: string; amount: number; reason: string; paymentId: string }> = {
  strong: {
    event: "payment.dispute.created",
    id: "disp_rp_replay_strong",
    amount: 6000000,
    reason: "Product not received",
    paymentId: "pay_demo_xyz",
  },
  weak: {
    event: "payment.dispute.created",
    id: "disp_rp_replay_weak",
    amount: 1500000,
    reason: "Product not received",
    paymentId: "pay_weak_15k",
  },
  conflict: {
    event: "payment.dispute.created",
    id: "disp_rp_replay_conflict",
    amount: 2499900,
    reason: "Product not received",
    paymentId: "pay_conflict",
  },
  refunded: {
    event: "payment.dispute.created",
    id: "disp_rp_replay_refund",
    amount: 4599900,
    reason: "Refund not received",
    paymentId: "pay_watch_ref",
  },
  service: {
    event: "payment.dispute.created",
    id: "disp_rp_replay_service",
    amount: 399900,
    reason: "Service not provided",
    paymentId: "pay_careplus",
  },
  random: {
    event: "payment.dispute.action_required",
    id: `disp_rp_rand_${Date.now()}`,
    amount: 1899900,
    reason: "Transaction not recognised",
    paymentId: "pay_demo_xyz",
  },
};

export async function replayDemo(kind: keyof typeof SCENARIOS | "hero") {
  const scenario = kind === "hero" ? SCENARIOS.strong : SCENARIOS[kind];
  if (!scenario) throw new Error("UNKNOWN_SCENARIO");
  const payload = {
    event: scenario.event,
    created_at: Math.floor(Date.now() / 1000),
    payload: {
      dispute: {
        entity: {
          id: scenario.id,
          payment_id: scenario.paymentId,
          amount: scenario.amount,
          currency: "INR",
          reason_code: "product_not_received",
          reason_description: scenario.reason,
          status: kind === "random" ? "action_required" : "open",
        },
      },
    },
  };
  const result = ingestWebhook(payload, true);
  if (result.disputeId) {
    saveStore((store) => {
      const dispute = store.disputes.find((item) => item.id === result.disputeId);
      if (dispute) dispute.rawData = { ...dispute.rawData, simulated: true };
    });
    await investigateDispute(ORG_ID, result.disputeId, "demo");
  }
  return { ...result, simulated: true, scenario: kind };
}

export function existingDemoTargets() {
  const store = getStore();
  return {
    hero: store.disputes.find((item) => item.id === HERO_DISPUTE_ID)?.id,
    weak: store.disputes.find((item) => item.id === "disp_weak_nonreceipt")?.id,
  };
}
