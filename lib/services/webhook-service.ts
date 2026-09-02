import "server-only";

import { createId } from "@/lib/db/ids";
import { getStore, saveStore } from "@/lib/db/local-store";
import { ORG_ID } from "@/lib/demo/constants";
import { isDisputeEvent, webhookEventKey } from "@/lib/razorpay/webhooks";
import type { Dispute, DisputeStatus, Payment } from "@/types/domain";
import { writeAudit } from "./audit-service";
import { notify } from "./notification-service";

type RazorpayWebhook = {
  event: string;
  created_at?: number;
  payload?: {
    dispute?: {
      entity?: {
        id?: string;
        payment_id?: string;
        amount?: number;
        currency?: string;
        reason_code?: string;
        reason_description?: string;
        status?: string;
        phase?: string;
        respond_by?: number;
      };
    };
    payment?: { entity?: { id?: string; amount?: number; currency?: string; status?: string; captured?: boolean } };
  };
};

export function ingestWebhook(raw: unknown, signatureValid: boolean): { duplicate: boolean; disputeId?: string } {
  const payload = raw as RazorpayWebhook;
  const key = webhookEventKey(payload);
  const store = getStore();
  const existing = store.webhookEvents.find((item) => item.externalEventKey === key);
  if (existing?.processed) return { duplicate: true, disputeId: String(existing.payload.disputeId ?? "") };

  const eventId = existing?.id ?? createId("wh");
  saveStore((next) => {
    if (!existing) {
      next.webhookEvents.push({
        id: eventId,
        provider: "razorpay",
        externalEventKey: key,
        eventType: payload.event,
        payload: payload as Record<string, unknown>,
        signatureValid,
        processed: false,
        receivedAt: new Date().toISOString(),
      });
    }
  });

  if (!signatureValid || !isDisputeEvent(payload.event)) {
    saveStore((next) => {
      const row = next.webhookEvents.find((item) => item.id === eventId);
      if (row) {
        row.processed = true;
        row.processingError = signatureValid ? "ignored_event" : "invalid_signature";
        row.processedAt = new Date().toISOString();
      }
    });
    return { duplicate: false };
  }

  const entity = payload.payload?.dispute?.entity;
  if (!entity?.id) return { duplicate: false };

  let disputeId = "";
  saveStore((next) => {
    let payment = next.payments.find((item) => item.razorpayPaymentId === entity.payment_id);
    if (!payment && entity.payment_id) {
      payment = {
        id: createId("pay"),
        organizationId: ORG_ID,
        razorpayPaymentId: entity.payment_id,
        razorpayOrderId: "order_unknown",
        orderId: "",
        amount: (entity.amount ?? 0) / 100,
        currency: entity.currency ?? "INR",
        status: "captured",
        method: "upi",
        captured: true,
        amountRefunded: 0,
        rawData: {},
        createdAt: new Date().toISOString(),
      } satisfies Payment;
      next.payments.push(payment);
    }

    const mappedStatus = mapStatus(entity.status);
    const found = next.disputes.find((item) => item.razorpayDisputeId === entity.id);
    if (found) {
      found.status = mappedStatus;
      found.updatedAt = new Date().toISOString();
      if (entity.reason_description) found.reasonDescription = entity.reason_description;
      disputeId = found.id;
    } else {
      const dispute: Dispute = {
        id: createId("disp"),
        organizationId: ORG_ID,
        razorpayDisputeId: entity.id ?? "unknown",
        paymentId: payment?.id ?? "",
        amount: (entity.amount ?? 0) > 1000 ? Math.round((entity.amount ?? 0) / 100) : (entity.amount ?? 0),
        currency: entity.currency ?? "INR",
        reasonCode: "product_not_received",
        reasonDescription: entity.reason_description ?? "Product not received",
        phase: "received",
        status: mappedStatus,
        respondBy: entity.respond_by ? new Date(entity.respond_by * 1000).toISOString() : undefined,
        rawData: entity as Record<string, unknown>,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      next.disputes.push(dispute);
      disputeId = dispute.id;
    }

    const row = next.webhookEvents.find((item) => item.id === eventId);
    if (row) {
      row.processed = true;
      row.processedAt = new Date().toISOString();
      row.payload = { ...(row.payload as object), disputeId };
    }
  });

  writeAudit({
    organizationId: ORG_ID,
    disputeId,
    actorType: "razorpay",
    actorId: "webhook",
    action: payload.event,
    metadata: { razorpayDisputeId: entity.id },
  });
  notify({
    organizationId: ORG_ID,
    title: `Dispute ${payload.event.replace("payment.dispute.", "")}`,
    body: entity.reason_description ?? entity.id,
    href: `/disputes/${disputeId}`,
  });
  return { duplicate: false, disputeId };
}

function mapStatus(status?: string): DisputeStatus {
  if (status === "action_required") return "action_required";
  if (status === "under_review") return "under_review";
  if (status === "won") return "won";
  if (status === "lost") return "lost";
  if (status === "closed") return "closed";
  return "open";
}
