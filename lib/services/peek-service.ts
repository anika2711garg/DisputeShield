import "server-only";

import { USERS } from "@/lib/demo/constants";
import { getStore } from "@/lib/db/local-store";
import { scoreEvidence } from "@/lib/rules/evidence-score";
import { toRazorpayReasonCode } from "@/lib/razorpay/reason-codes";
import { getDisputeBundle } from "./dispute-service";
import { listWebhookEventsForDispute } from "./webhook-service";
import type { CasePeekData } from "@/lib/ui/peek";

export function getCasePeek(organizationId: string, id: string): CasePeekData | null {
  const store = getStore();
  const found = store.disputes.find(
    (item) => item.organizationId === organizationId && (item.id === id || item.razorpayDisputeId === id),
  );
  if (!found) return null;
  const bundle = getDisputeBundle(organizationId, found.id);
  if (!bundle) return null;
  const rec = bundle.recommendation;
  const assigneeId = bundle.dispute.assigneeId ?? (bundle.dispute.rawData.hero === true ? USERS.admin.id : undefined);
  const assignee = store.profiles.find((item) => item.id === assigneeId)?.fullName;
  const score = scoreEvidence({
    reason: bundle.dispute.reasonCode,
    evidence: bundle.evidence,
    shipment: bundle.shipment,
    refunds: bundle.refunds,
    disputeAmount: bundle.dispute.amount,
    paymentCaptured: Boolean(bundle.payment?.captured),
    paymentAmount: bundle.payment?.amount ?? 0,
  });
  const quote = bundle.messages
    .slice()
    .reverse()
    .find((item) => item.senderType === "customer" && item.body.trim().length > 8);
  const lastMessage = bundle.messages.slice().sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0];
  const lastWebhook = listWebhookEventsForDispute(bundle.dispute.razorpayDisputeId)[0];
  const actions = store.auditLogs
    .filter((item) => item.disputeId === bundle.dispute.id)
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 4)
    .map((item) => ({ action: item.action, actor: item.actorType, at: item.createdAt }));
  const opened = new Date(bundle.dispute.createdAt).getTime();
  const daysOpen = Number.isFinite(opened) ? Math.max(0, Math.round((Date.now() - opened) / 86_400_000)) : undefined;
  const hoursLeft = bundle.dispute.respondBy
    ? Math.round((new Date(bundle.dispute.respondBy).getTime() - Date.now()) / 3_600_000)
    : undefined;
  const ship = bundle.shipment;
  const addr = bundle.order?.shippingAddress;
  const approval = bundle.approvals.at(-1);
  const merchantNote = bundle.messages
    .slice()
    .reverse()
    .find((item) => item.senderType === "merchant" && item.body.trim().length > 6)?.body;
  const strengthAvg = bundle.evidence.length
    ? Math.round(bundle.evidence.reduce((sum, item) => sum + item.strengthScore, 0) / bundle.evidence.length)
    : undefined;
  return {
    id: bundle.dispute.id,
    customerName: bundle.customer?.name,
    customerEmail: bundle.customer?.email,
    customerPhone: bundle.customer?.phone,
    city: addr?.city,
    state: addr?.state,
    country: addr?.country,
    addressLine: addr ? [addr.line1, addr.city, addr.state].filter(Boolean).join(", ") : undefined,
    amount: bundle.dispute.amount,
    currency: bundle.dispute.currency,
    paymentAmount: bundle.payment?.amount,
    orderAmount: bundle.order?.amount,
    reason: bundle.dispute.reasonDescription,
    reasonCode: bundle.dispute.reasonCode,
    razorpayReason: toRazorpayReasonCode(bundle.dispute.reasonCode),
    paymentId: bundle.payment?.razorpayPaymentId,
    razorpayDisputeId: bundle.dispute.razorpayDisputeId,
    razorpayOrderId: bundle.payment?.razorpayOrderId,
    orderId: bundle.order?.externalId,
    orderStatus: bundle.order?.status,
    paymentStatus: bundle.payment?.status,
    score: rec?.score ?? score.total,
    ai: rec?.modelRecommendation,
    rules: rec?.rulesRecommendation,
    final: rec?.finalRecommendation,
    confidence: rec?.confidence,
    status: bundle.dispute.status,
    phase: bundle.dispute.phase,
    respondBy: bundle.dispute.respondBy,
    createdAt: bundle.dispute.createdAt,
    evidenceCount: bundle.evidence.length,
    includedEvidence: bundle.evidence.filter((item) => item.includedInContest).length,
    verifiedCount: bundle.evidence.filter((item) => item.verified).length,
    evidenceTypes: [...new Set(bundle.evidence.map((item) => item.type.replaceAll("_", " ")))].slice(0, 8),
    evidenceTitles: bundle.evidence
      .slice()
      .sort((a, b) => b.strengthScore - a.strengthScore)
      .slice(0, 4)
      .map((item) => item.title),
    missing: score.missingCritical.map((item) => item.replaceAll("_", " ")).slice(0, 4),
    reviewer: assignee,
    captured: bundle.payment?.captured,
    method: bundle.payment?.method,
    disagree: Boolean(rec && rec.modelRecommendation !== rec.rulesRecommendation),
    trackingId: ship?.trackingId,
    carrier: ship?.provider,
    shipmentStatus: ship?.status,
    shippedAt: ship?.shippedAt,
    deliveredAt: ship?.deliveredAt,
    deliveryLocation: ship?.deliveryLocation,
    recipientName: ship?.recipientName,
    invoiceNumber: bundle.invoice?.invoiceNumber,
    refunded: bundle.refunds.reduce((sum, item) => sum + item.amount, 0),
    productName: bundle.products[0]?.name,
    sku: bundle.products[0]?.sku,
    productCount: bundle.products.length,
    quote: quote?.body.slice(0, 160),
    summary: bundle.investigation?.summary.slice(0, 180),
    lastEvent: lastWebhook?.eventType,
    lastEventAt: lastWebhook?.receivedAt,
    overrides: rec?.overrideReasons.slice(0, 2),
    dimensions: score.dimensions.map((item) => ({
      key: item.key,
      label: item.label,
      awarded: item.awarded,
      max: item.max,
    })),
    timeline: [
      { label: "Opened", at: bundle.dispute.createdAt },
      { label: "Shipped", at: ship?.shippedAt, detail: ship?.provider },
      { label: "Delivered", at: ship?.deliveredAt, detail: ship?.deliveryLocation },
      { label: "Last webhook", at: lastWebhook?.receivedAt, detail: lastWebhook?.eventType?.replace("payment.dispute.", "") },
    ].filter((item) => item.at),
    actions,
    messageCount: bundle.messages.length,
    lastMessageChannel: lastMessage?.channel,
    model: bundle.investigation?.model,
    latencyMs: bundle.investigation?.latencyMs,
    reasonConfidence: bundle.investigation?.reasonConfidence,
    daysOpen,
    hoursLeft,
    hero: bundle.dispute.rawData.hero === true,
    approval: approval?.status,
    draftReady: Boolean(bundle.draft?.selectedEvidenceIds.length),
    amountMatch: Boolean(bundle.payment && bundle.payment.amount >= bundle.dispute.amount),
    strengthAvg,
    billingCity: bundle.order?.billingAddress.city,
    lastMerchantNote: merchantNote?.slice(0, 120),
  };
}
