import "server-only";

import { getStore } from "@/lib/db/local-store";
import type { CaseBundle } from "@/types/case";
import type {
  AiInvestigation,
  Customer,
  Dispute,
  Order,
  Payment,
  Product,
  RecommendationRecord,
} from "@/types/domain";

export type DisputeFilters = {
  q?: string;
  status?: string;
  reason?: string;
  recommendation?: string;
  phase?: string;
  view?: string;
  minScore?: number;
  maxScore?: number;
  minAmount?: number;
  maxAmount?: number;
};

export type DisputeListItem = Dispute & {
  customer?: Customer;
  payment?: Payment;
  order?: Order;
  recommendation?: RecommendationRecord;
  investigation?: AiInvestigation;
  evidenceCount: number;
};

export function listDisputes(organizationId: string, filters: DisputeFilters = {}): DisputeListItem[] {
  const store = getStore();
  return store.disputes
    .filter((dispute) => dispute.organizationId === organizationId)
    .map((dispute) => hydrate(store, dispute))
    .filter((item) => matches(item, filters))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getDisputeBundle(organizationId: string, id: string) {
  const store = getStore();
  const dispute = store.disputes.find((item) => item.id === id && item.organizationId === organizationId);
  if (!dispute) return null;
  const payment = store.payments.find((item) => item.id === dispute.paymentId);
  const order = payment ? store.orders.find((item) => item.id === payment.orderId) : undefined;
  const customer = order ? store.customers.find((item) => item.id === order.customerId) : undefined;
  const shipment = order ? store.shipments.find((item) => item.orderId === order.id) : undefined;
  const invoice = order ? store.invoices.find((item) => item.orderId === order.id) : undefined;
  const refunds = store.refunds.filter((item) => item.paymentId === dispute.paymentId);
  const messages = order ? store.customerMessages.filter((item) => item.orderId === order.id) : [];
  const evidence = store.evidenceItems.filter((item) => item.disputeId === dispute.id);
  const investigation = store.aiInvestigations.filter((item) => item.disputeId === dispute.id).at(-1);
  const recommendation = store.recommendations.filter((item) => item.disputeId === dispute.id).at(-1);
  const products = order
    ? store.orderItems
        .filter((item) => item.orderId === order.id)
        .map((item) => store.products.find((product) => product.id === item.productId))
        .filter((item): item is Product => Boolean(item))
    : [];
  const draft = store.contestDrafts.find((item) => item.disputeId === dispute.id);
  const approvals = store.approvals.filter((item) => item.disputeId === dispute.id);
  return {
    dispute,
    payment,
    order,
    customer,
    shipment,
    invoice,
    refunds,
    messages,
    evidence,
    investigation,
    recommendation,
    products,
    draft,
    approvals,
  };
}

function hydrate(store: ReturnType<typeof getStore>, dispute: Dispute): DisputeListItem {
  const payment = store.payments.find((item) => item.id === dispute.paymentId);
  const order = payment ? store.orders.find((item) => item.id === payment.orderId) : undefined;
  const customer = order ? store.customers.find((item) => item.id === order.customerId) : undefined;
  return {
    ...dispute,
    customer,
    payment,
    order,
    recommendation: store.recommendations.filter((item) => item.disputeId === dispute.id).at(-1),
    investigation: store.aiInvestigations.filter((item) => item.disputeId === dispute.id).at(-1),
    evidenceCount: store.evidenceItems.filter((item) => item.disputeId === dispute.id).length,
  };
}

function matches(item: DisputeListItem, filters: DisputeFilters): boolean {
  if (filters.status && item.status !== filters.status) return false;
  if (filters.reason && item.reasonCode !== filters.reason) return false;
  if (filters.phase && item.phase !== filters.phase) return false;
  if (filters.recommendation && item.recommendation?.finalRecommendation !== filters.recommendation) return false;
  const score = item.recommendation?.score ?? item.investigation?.evidenceScore ?? 0;
  if (filters.minScore !== undefined && score < filters.minScore) return false;
  if (filters.maxScore !== undefined && score > filters.maxScore) return false;
  if (filters.minAmount !== undefined && item.amount < filters.minAmount) return false;
  if (filters.maxAmount !== undefined && item.amount > filters.maxAmount) return false;
  if (filters.view === "needs-attention" && !["action_required", "open"].includes(item.status)) return false;
  if (filters.view === "contest-ready" && item.recommendation?.finalRecommendation !== "contest") return false;
  if (filters.view === "human-review" && item.recommendation?.finalRecommendation !== "human_review") return false;
  if (filters.view === "under-review" && item.status !== "under_review") return false;
  if (filters.view === "won" && item.status !== "won") return false;
  if (filters.view === "lost" && item.status !== "lost") return false;
  if (filters.q) {
    const q = filters.q.toLowerCase();
    const haystack = [
      item.id,
      item.razorpayDisputeId,
      item.payment?.razorpayPaymentId,
      item.order?.externalId,
      item.customer?.name,
      item.customer?.email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

export type { CaseBundle };

export function searchGlobal(organizationId: string, q: string) {
  const store = getStore();
  const query = q.toLowerCase();
  const disputes = store.disputes
    .filter((item) => item.organizationId === organizationId && (item.id.includes(query) || item.razorpayDisputeId.toLowerCase().includes(query)))
    .slice(0, 5)
    .map((item) => ({ id: item.id }));
  const orders = store.orders
    .filter((item) => item.organizationId === organizationId && item.externalId.toLowerCase().includes(query))
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      externalId: item.externalId,
      href: `/disputes?q=${encodeURIComponent(item.externalId)}`,
    }));
  const customers = store.customers
    .filter((item) => item.organizationId === organizationId && (item.name.toLowerCase().includes(query) || item.email.toLowerCase().includes(query)))
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      name: item.name,
      href: `/disputes?q=${encodeURIComponent(item.name)}`,
    }));
  const evidence = store.evidenceItems
    .filter(
      (item) =>
        item.organizationId === organizationId &&
        (item.title.toLowerCase().includes(query) || item.id.toLowerCase().includes(query) || String(item.metadata.trackingId ?? "").toLowerCase().includes(query) || String(item.metadata.invoiceNumber ?? "").toLowerCase().includes(query)),
    )
    .slice(0, 5)
    .map((item) => ({ id: item.id, title: item.title, disputeId: item.disputeId }));
  return { disputes, orders, customers, evidence };
}

export function disputesToCsv(items: DisputeListItem[]): string {
  const header = ["id", "customer", "email", "amount", "reason", "phase", "score", "recommendation", "confidence", "respond_by", "status"];
  const rows = items.map((item) => [
    item.id,
    item.customer?.name ?? "",
    item.customer?.email ?? "",
    String(item.amount),
    item.reasonDescription,
    item.phase,
    String(item.recommendation?.score ?? ""),
    item.recommendation?.finalRecommendation ?? "",
    item.recommendation ? String(Math.round(item.recommendation.confidence * 100)) : "",
    item.respondBy ?? "",
    item.status,
  ]);
  return [header, ...rows].map((line) => line.map(csvCell).join(",")).join("\n");
}

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}
