export type PeekDimension = {
  key: string;
  label: string;
  awarded: number;
  max: number;
};

export type PeekTimelinePoint = {
  label: string;
  at?: string;
  detail?: string;
};

export type PeekAction = {
  action: string;
  actor: string;
  at: string;
};

export type CasePeekData = {
  id: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  city?: string;
  state?: string;
  country?: string;
  addressLine?: string;
  amount: number;
  currency?: string;
  paymentAmount?: number;
  orderAmount?: number;
  reason: string;
  reasonCode?: string;
  razorpayReason?: string;
  paymentId?: string;
  razorpayDisputeId?: string;
  razorpayOrderId?: string;
  orderId?: string;
  orderStatus?: string;
  paymentStatus?: string;
  score?: number;
  ai?: string;
  rules?: string;
  final?: string;
  confidence?: number;
  status: string;
  phase?: string;
  respondBy?: string;
  createdAt?: string;
  evidenceCount?: number;
  includedEvidence?: number;
  verifiedCount?: number;
  evidenceTypes?: string[];
  evidenceTitles?: string[];
  missing?: string[];
  reviewer?: string;
  captured?: boolean;
  method?: string;
  disagree?: boolean;
  trackingId?: string;
  carrier?: string;
  shipmentStatus?: string;
  shippedAt?: string;
  deliveredAt?: string;
  deliveryLocation?: string;
  recipientName?: string;
  invoiceNumber?: string;
  refunded?: number;
  productName?: string;
  sku?: string;
  productCount?: number;
  quote?: string;
  summary?: string;
  lastEvent?: string;
  lastEventAt?: string;
  overrides?: string[];
  dimensions?: PeekDimension[];
  timeline?: PeekTimelinePoint[];
  actions?: PeekAction[];
  messageCount?: number;
  lastMessageChannel?: string;
  model?: string;
  latencyMs?: number;
  reasonConfidence?: number;
  daysOpen?: number;
  hoursLeft?: number;
  hero?: boolean;
  approval?: string;
  draftReady?: boolean;
  amountMatch?: boolean;
  strengthAvg?: number;
  billingCity?: string;
  lastMerchantNote?: string;
};

export function disputeIdFromHref(href?: string | null): string | undefined {
  const match = href?.match(/\/disputes\/(disp_[^/?#]+)/);
  return match?.[1];
}

export function disputeIdFromWebhookPayload(payload: Record<string, unknown>): string | undefined {
  if (typeof payload.disputeId === "string" && payload.disputeId.startsWith("disp_")) return payload.disputeId;
  const nested = payload.payload as { dispute?: { entity?: { id?: string } } } | undefined;
  const razorpayId = nested?.dispute?.entity?.id;
  return razorpayId || undefined;
}
