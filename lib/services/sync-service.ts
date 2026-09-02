import "server-only";

import { createId } from "@/lib/db/ids";
import { getStore, saveStore } from "@/lib/db/local-store";
import { getRazorpayAdapter } from "@/lib/razorpay/client";
import { seedMockRazorpay } from "@/lib/razorpay/mock";
import { fromRazorpayReasonCode, toRazorpayReasonCode } from "@/lib/razorpay/reason-codes";
import type { RazorpayDispute, RazorpayPayment } from "@/lib/razorpay/types";
import type { Dispute, Payment } from "@/types/domain";
import { writeAudit } from "./audit-service";
import { notify } from "./notification-service";

function toUnix(iso?: string) {
  return iso ? Math.floor(new Date(iso).getTime() / 1000) : Math.floor(Date.now() / 1000);
}

export function seedMockFromStore(): void {
  const store = getStore();
  const payments: RazorpayPayment[] = store.payments.map((item) => ({
    id: item.razorpayPaymentId,
    order_id: item.razorpayOrderId,
    amount: Math.round(item.amount * 100),
    currency: item.currency,
    status: item.status,
    method: item.method,
    captured: item.captured,
    amount_refunded: Math.round(item.amountRefunded * 100),
    created_at: toUnix(item.createdAt),
  }));
  const disputes: RazorpayDispute[] = store.disputes.map((item) => {
    const payment = store.payments.find((row) => row.id === item.paymentId);
    return {
      id: item.razorpayDisputeId,
      payment_id: payment?.razorpayPaymentId ?? "pay_unknown",
      amount: Math.round(item.amount * 100),
      currency: item.currency,
      reason_code: toRazorpayReasonCode(item.reasonCode),
      reason_description: item.reasonDescription,
      status:
        item.status === "accepted"
          ? "lost"
          : item.status === "action_required"
            ? "action_required"
            : item.status === "under_review"
              ? "under_review"
              : item.status === "won"
                ? "won"
                : item.status === "lost"
                  ? "lost"
                  : item.status === "closed"
                    ? "closed"
                    : "open",
      phase: item.phase,
      respond_by: item.respondBy ? toUnix(item.respondBy) : undefined,
      created_at: toUnix(item.createdAt),
    };
  });
  seedMockRazorpay({ disputes, payments });
}

export async function syncFromRazorpay(organizationId: string, actorId: string) {
  seedMockFromStore();
  const adapter = getRazorpayAdapter();
  const remote = await adapter.fetchDisputes();
  let created = 0;
  let updated = 0;

  saveStore((store) => {
    for (const entity of remote) {
      let payment = store.payments.find((item) => item.razorpayPaymentId === entity.payment_id);
      if (!payment) {
        payment = {
          id: createId("pay"),
          organizationId,
          razorpayPaymentId: entity.payment_id,
          razorpayOrderId: "order_synced",
          orderId: "",
          amount: entity.amount / 100,
          currency: entity.currency,
          status: "captured",
          method: "upi",
          captured: true,
          amountRefunded: 0,
          rawData: { synced: true },
          createdAt: new Date().toISOString(),
        } satisfies Payment;
        store.payments.push(payment);
      }
      const existing = store.disputes.find((item) => item.razorpayDisputeId === entity.id);
      if (existing) {
        existing.updatedAt = new Date().toISOString();
        existing.reasonDescription = entity.reason_description;
        updated += 1;
      } else {
        const dispute: Dispute = {
          id: createId("disp"),
          organizationId,
          razorpayDisputeId: entity.id,
          paymentId: payment.id,
          amount: entity.amount > 1000 ? Math.round(entity.amount / 100) : entity.amount,
          currency: entity.currency,
          reasonCode: fromRazorpayReasonCode(entity.reason_code),
          reasonDescription: entity.reason_description,
          phase: "received",
          status: entity.status === "action_required" ? "action_required" : "open",
          respondBy: entity.respond_by ? new Date(entity.respond_by * 1000).toISOString() : undefined,
          rawData: { synced: true, razorpay: entity as unknown as Record<string, unknown> },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        store.disputes.push(dispute);
        created += 1;
      }
    }
  });

  writeAudit({
    organizationId,
    actorType: "razorpay",
    actorId,
    action: "razorpay.sync",
    metadata: { created, updated, mode: adapter.mode, pulled: remote.length },
  });
  notify({
    organizationId,
    title: "Razorpay sync complete",
    body: `${remote.length} disputes pulled · ${created} new · ${updated} refreshed`,
    href: "/disputes",
  });
  return { mode: adapter.mode, pulled: remote.length, created, updated };
}
