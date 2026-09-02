import type { Customer, CustomerMessage, Dispute, EvidenceItem, Invoice, Order, Payment, Refund, Shipment } from "@/types/domain";

export type CaseContext = {
  dispute: Dispute;
  payment?: Payment;
  order?: Order;
  customer?: Customer;
  shipment?: Shipment | null;
  refunds: Refund[];
  invoice?: Invoice | null;
  messages: CustomerMessage[];
  evidence: EvidenceItem[];
};

export function buildAiContext(input: CaseContext): string {
  const refunded = input.refunds.reduce((sum, refund) => sum + refund.amount, 0);
  const missing = summarizeMissing(input.evidence);
  const lines = [
    `REASON: ${input.dispute.reasonCode}`,
    `REASON_TEXT: ${input.dispute.reasonDescription}`,
    `AMOUNT: ${input.dispute.amount}`,
    `PAYMENT_STATUS: ${input.payment?.status ?? "unknown"}`,
    `PAYMENT_CAPTURED: ${input.payment?.captured ?? false}`,
    `ORDER_STATUS: ${input.order?.status ?? "unknown"}`,
    `SHIPMENT_STATUS: ${input.shipment?.status ?? "none"}`,
    `TRACKING: ${input.shipment?.trackingId ?? "none"}`,
    `REFUNDED: ${refunded >= input.dispute.amount && refunded > 0}`,
    `NEVER_SHIPPED: ${input.shipment?.status === "never_shipped"}`,
    `CONFLICTING: ${Boolean(input.shipment?.rawData.conflicting)}`,
    `MISSING: ${missing}`,
    `SCORE_HINT: ${hintScore(input)}`,
    `CUSTOMER: ${input.customer?.name ?? "unknown"}`,
    `INVOICE: ${input.invoice?.invoiceNumber ?? "none"}`,
    "EVIDENCE:",
    ...input.evidence.map(
      (item) =>
        `EVIDENCE_ID:${item.id} TYPE:${item.type} TITLE:${item.title} FACT:${(item.contentText ?? "").slice(0, 180)} VERIFIED:${item.verified}`,
    ),
    "MESSAGES:",
    ...input.messages.map((message) => `${message.senderType}: ${message.body.slice(0, 160)}`),
  ];
  return lines.join("\n");
}

export function buildCopilotContext(input: CaseContext): string {
  return buildAiContext(input);
}

function summarizeMissing(evidence: EvidenceItem[]): string {
  const types = new Set(evidence.map((item) => item.type));
  const needed = ["shipping_proof", "delivery_confirmation", "billing_proof", "payment"];
  return needed.filter((type) => !types.has(type as EvidenceItem["type"])).join(",");
}

function hintScore(input: CaseContext): number {
  let score = 20;
  if (input.payment?.captured) score += 15;
  if (input.invoice) score += 10;
  if (input.shipment?.status === "delivered") score += 30;
  if (input.messages.some((message) => /got|received|thanks|working/i.test(message.body))) score += 15;
  if (input.shipment?.rawData.conflicting) score -= 25;
  if (input.shipment?.status === "never_shipped") score -= 30;
  return Math.max(5, Math.min(96, score));
}
