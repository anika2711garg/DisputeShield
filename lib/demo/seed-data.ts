import type {
  Address,
  AppStore,
  AuditLog,
  Customer,
  CustomerMessage,
  Dispute,
  DisputeReason,
  DisputeStatus,
  EvidenceItem,
  Invoice,
  Order,
  Payment,
  Product,
  Recommendation,
  Refund,
  Shipment,
} from "@/types/domain";
import { emptyStore } from "@/types/domain";
import { scoreEvidence } from "@/lib/rules/evidence-score";
import { recommendAction } from "@/lib/rules/recommendation";
import {
  ACTION_REQUIRED_ID,
  CONFLICT_DISPUTE_ID,
  DIGITAL_DISPUTE_ID,
  HERO_DISPUTE_ID,
  HERO_ORDER_ID,
  HERO_PAYMENT_ID,
  NEVER_SHIPPED_ID,
  ORG_ID,
  ORG_SLUG,
  REFUND_DISPUTE_ID,
  SERVICE_DISPUTE_ID,
  USERS,
  WEAK_DISPUTE_ID,
} from "./constants";
import { evaluateFromFacts, generateEvaluationCases } from "./evaluation-dataset";
import { mulberry32, pick } from "./prng";

const BLR: Address = {
  line1: "14 Residency Road",
  city: "Bengaluru",
  state: "Karnataka",
  postalCode: "560025",
  country: "IN",
};

const MUM: Address = {
  line1: "802 Marine Drive",
  city: "Mumbai",
  state: "Maharashtra",
  postalCode: "400002",
  country: "IN",
};

function iso(day: number, hour = 10): string {
  const now = new Date();
  const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hour, 0, 0));
  date.setUTCDate(date.getUTCDate() + (day - 28));
  return date.toISOString();
}

function evidence(partial: Omit<EvidenceItem, "organizationId" | "includedInContest" | "createdAt"> & { createdAt?: string; includedInContest?: boolean }): EvidenceItem {
  return {
    organizationId: ORG_ID,
    includedInContest: partial.includedInContest ?? true,
    createdAt: partial.createdAt ?? iso(24, 10),
    ...partial,
  };
}

export function buildDemoStore(): AppStore {
  const store = emptyStore();
  store.organizations.push({
    id: ORG_ID,
    name: "Northstar Electronics",
    slug: ORG_SLUG,
    createdAt: iso(1),
    updatedAt: iso(24),
  });

  store.profiles.push(
    { id: USERS.admin.id, organizationId: ORG_ID, email: USERS.admin.email, fullName: USERS.admin.name, role: "admin", createdAt: iso(1), password: USERS.admin.password },
    { id: USERS.reviewer.id, organizationId: ORG_ID, email: USERS.reviewer.email, fullName: USERS.reviewer.name, role: "reviewer", createdAt: iso(1), password: USERS.reviewer.password },
    { id: USERS.analyst.id, organizationId: ORG_ID, email: USERS.analyst.email, fullName: USERS.analyst.name, role: "analyst", createdAt: iso(1), password: USERS.analyst.password },
  );

  const products: Product[] = [
    product("prd_mba", "MBA-13-M3", "MacBook Air", "13-inch MacBook Air M3", 60000),
    product("prd_watch", "IW-S10", "Apple Watch", "Series 10 GPS 45mm", 45999),
    product("prd_buds", "WB-PRO", "Wireless Buds Pro", "ANC earbuds", 12999),
    product("prd_phone", "PX-8", "Pixel 8", "Google Pixel 8 256GB", 69999),
    product("prd_saas", "NS-CARE", "Northstar Care+", "2-year device protection", 3999),
    product("prd_keyboard", "MK-87", "Mechanical Keyboard", "Hot-swap 87 key", 8999),
    product("prd_stand", "ST-ALU", "Laptop Stand", "Aluminium stand", 3499),
    product("prd_ssd", "SSD-2T", "2TB SSD", "NVMe Gen4", 14999),
  ];
  store.products.push(...products);

  addHeroCase(store);
  addWeakCase(store);
  addRefundCase(store);
  addServiceCase(store);
  addConflictCase(store);
  addNeverShippedCase(store);
  addDigitalCase(store);
  addActionRequiredCase(store);
  addCatalogCases(store);

  store.evaluationCases = generateEvaluationCases(8291);
  const runId = "erun_heldout_v1";
  const heldOut = store.evaluationCases.filter((item) => item.split === "held_out");
  let correct = 0;
  let fp = 0;
  let fn = 0;
  let escalations = 0;
  let fpCost = 0;
  const confusion = { contest: { contest: 0, accept: 0, human_review: 0 }, accept: { contest: 0, accept: 0, human_review: 0 }, human_review: { contest: 0, accept: 0, human_review: 0 } };

  for (const evaluationCase of heldOut) {
    const prediction = evaluateFromFacts(evaluationCase.inputData);
    const isCorrect = prediction.label === evaluationCase.groundTruth;
    if (isCorrect) correct += 1;
    if (prediction.label === "contest" && evaluationCase.groundTruth === "accept") {
      fp += 1;
      fpCost += Number(evaluationCase.inputData.amount ?? 0) * 0.08 + 450;
    }
    if (prediction.label === "accept" && evaluationCase.groundTruth === "contest") fn += 1;
    if (prediction.label === "human_review") escalations += 1;
    confusion[evaluationCase.groundTruth][prediction.label] += 1;
    store.evaluationPredictions.push({
      id: `epred_${evaluationCase.id}`,
      evaluationCaseId: evaluationCase.id,
      runId,
      predictedLabel: prediction.label,
      confidence: prediction.confidence,
      score: prediction.score,
      correct: isCorrect,
      createdAt: iso(28),
    });
  }

  const contestPred = store.evaluationPredictions.filter((item) => item.predictedLabel === "contest");
  const contestTruth = heldOut.filter((item) => item.groundTruth === "contest");
  const tp = store.evaluationPredictions.filter((item) => item.predictedLabel === "contest" && item.correct && heldOut.find((c) => c.id === item.evaluationCaseId)?.groundTruth === "contest").length;
  const precision = contestPred.length ? tp / contestPred.length : 0;
  const recall = contestTruth.length ? tp / contestTruth.length : 0;

  store.evaluationRuns.push({
    id: runId,
    model: "mock-rules-v1",
    promptVersion: "v1.0.0",
    totalCases: heldOut.length,
    precision,
    recall,
    accuracy: correct / heldOut.length,
    falsePositives: fp,
    falseNegatives: fn,
    humanEscalations: escalations,
    falsePositiveCost: Math.round(fpCost),
    results: { confusion, split: "held_out", notes: "Deterministic rules+mock evaluator. Held-out labels were not used to tune individual answers." },
    createdAt: iso(28, 16),
  });

  store.notifications.push(
    { id: "ntf_1", organizationId: ORG_ID, title: "New ₹60,000 dispute", body: "Rahul Sharma — Product not received", href: `/disputes/${HERO_DISPUTE_ID}`, read: false, createdAt: iso(24, 10) },
    { id: "ntf_2", organizationId: ORG_ID, title: "3 disputes approaching deadline", body: "Action required within 12 hours", href: "/disputes?view=needs-attention", read: false, createdAt: iso(24, 11) },
    { id: "ntf_3", organizationId: ORG_ID, title: "Contest won", body: "disp_won_pixel recovered ₹69,999", href: "/disputes/disp_won_pixel", read: true, createdAt: iso(22, 9) },
  );

  return store;
}

function product(id: string, sku: string, name: string, description: string, unitPrice: number): Product {
  return { id, organizationId: ORG_ID, sku, name, description, unitPrice, createdAt: iso(1) };
}

function addInvestigated(
  store: AppStore,
  dispute: Dispute,
  evidenceItems: EvidenceItem[],
  extras: { shipment?: Shipment | null; refunds?: Refund[]; payment: Payment; model?: Recommendation; confidence?: number },
): void {
  store.disputes.push(dispute);
  store.evidenceItems.push(...evidenceItems);
  const score = scoreEvidence({
    reason: dispute.reasonCode,
    evidence: evidenceItems,
    shipment: extras.shipment,
    refunds: extras.refunds ?? [],
    disputeAmount: dispute.amount,
    paymentCaptured: extras.payment.captured,
    paymentAmount: extras.payment.amount,
  });
  const rec = recommendAction({
    score,
    modelRecommendation: extras.model ?? (score.total >= 80 ? "contest" : "human_review"),
    modelConfidence: extras.confidence ?? 0.9,
    shipmentNeverShipped: extras.shipment?.status === "never_shipped",
    fullyRefunded: (extras.refunds ?? []).reduce((s, r) => s + r.amount, 0) >= dispute.amount,
    conflicting: Boolean(extras.shipment?.rawData.conflicting),
  });
  const investigationId = `ai_${dispute.id}`;
  store.aiInvestigations.push({
    id: investigationId,
    organizationId: ORG_ID,
    disputeId: dispute.id,
    model: "mock-rules-v1",
    promptVersion: "v1.0.0",
    reasonCategory: dispute.reasonDescription,
    reasonConfidence: 0.93,
    summary: rec.finalRecommendation === "contest"
      ? "Fulfillment and customer evidence support contesting."
      : rec.finalRecommendation === "accept"
        ? "Merchant records support accepting this dispute."
        : "Evidence is incomplete or conflicting. A reviewer should decide.",
    recommendation: rec.modelRecommendation,
    recommendationConfidence: rec.confidence,
    evidenceScore: score.total,
    structuredOutput: {
      reasonCategory: dispute.reasonCode,
      missingEvidence: score.missingCritical.map((type) => ({ type, critical: true })),
      contradictions: rec.overrideReasons,
      rationale: rec.overrideReasons[0] ?? "Deterministic scoring completed.",
      caseSummary: `Evidence score ${score.total}/100. Final recommendation ${rec.finalRecommendation}.`,
    },
    inputHash: dispute.id,
    latencyMs: 640,
    createdAt: dispute.updatedAt,
  });
  store.recommendations.push({
    id: `rec_${dispute.id}`,
    organizationId: ORG_ID,
    disputeId: dispute.id,
    aiInvestigationId: investigationId,
    modelRecommendation: rec.modelRecommendation,
    rulesRecommendation: rec.rulesRecommendation,
    finalRecommendation: rec.finalRecommendation,
    confidence: rec.confidence,
    score: score.total,
    overrideReasons: rec.overrideReasons,
    createdAt: dispute.updatedAt,
  });
}

function addHeroCase(store: AppStore): void {
  const customer = cust("cus_rahul", "Rahul Sharma", "rahul.sharma@example.com", "9876543210");
  store.customers.push(customer);
  const order = ord("ord_hero", HERO_ORDER_ID, customer.id, 60000, "fulfilled", iso(10), iso(14));
  store.orders.push(order);
  store.orderItems.push({ id: "oi_hero", orderId: order.id, productId: "prd_mba", quantity: 1, unitPrice: 60000 });
  const payment = pay("pay_hero", HERO_PAYMENT_ID, "order_demo_xyz", order.id, 60000, iso(10, 11));
  store.payments.push(payment);
  const shipment: Shipment = {
    id: "shp_hero",
    organizationId: ORG_ID,
    orderId: order.id,
    provider: "BlueDart",
    trackingId: "BD928312",
    status: "delivered",
    shippedAt: iso(11),
    deliveredAt: iso(14, 16),
    deliveryLocation: "Bengaluru",
    recipientName: "Rahul Sharma",
    rawData: { signed: true },
  };
  store.shipments.push(shipment);
  const invoice = inv("inv_hero", order.id, "INV-8291");
  store.invoices.push(invoice);
  const messages = [
    msg("msg_h1", customer.id, order.id, "customer", "Where is my order?", iso(13, 9)),
    msg("msg_h2", customer.id, order.id, "merchant", "It is scheduled for delivery tomorrow.", iso(13, 9,)),
    msg("msg_h3", customer.id, order.id, "customer", "Got the laptop, thanks!", iso(14, 18)),
  ];
  store.customerMessages.push(...messages);

  const dispute: Dispute = {
    id: HERO_DISPUTE_ID,
    organizationId: ORG_ID,
    razorpayDisputeId: "disp_rp_hero",
    paymentId: payment.id,
    amount: 60000,
    currency: "INR",
    reasonCode: "product_not_received",
    reasonDescription: "Product not received",
    phase: "ready",
    status: "action_required",
    respondBy: iso(28, 20),
    assigneeId: USERS.admin.id,
    rawData: { hero: true },
    createdAt: iso(24, 10),
    updatedAt: iso(24, 10),
  };

  const items = [
    evidence({ id: "E01", disputeId: dispute.id, orderId: order.id, type: "payment", title: "Captured Razorpay payment", source: "Razorpay", contentText: "pay_demo_xyz captured ₹60,000 on 10 Aug.", verified: true, relevanceScore: 96, strengthScore: 95, metadata: { razorpayPaymentId: HERO_PAYMENT_ID } }),
    evidence({ id: "E02", disputeId: dispute.id, orderId: order.id, type: "billing_proof", title: "Invoice INV-8291", source: "Billing", contentText: "Invoice for MacBook Air. Billing and shipping addresses in Bengaluru.", verified: true, relevanceScore: 90, strengthScore: 92, metadata: { invoiceNumber: "INV-8291" } }),
    evidence({ id: "E03", disputeId: dispute.id, orderId: order.id, type: "shipping_proof", title: "BlueDart shipment BD928312", source: "BlueDart", contentText: "Shipped 11 Aug from Bengaluru hub.", verified: true, relevanceScore: 93, strengthScore: 94, metadata: { trackingId: "BD928312" } }),
    evidence({ id: "E04", disputeId: dispute.id, orderId: order.id, type: "delivery_confirmation", title: "Delivery confirmation", source: "BlueDart", contentText: "Delivered 14 Aug, Bengaluru, recipient Rahul Sharma.", verified: true, relevanceScore: 98, strengthScore: 97, metadata: { location: "Bengaluru" } }),
    evidence({ id: "E05", disputeId: dispute.id, orderId: order.id, type: "customer_communication", title: "Customer acknowledgement", source: "Support chat", contentText: "Got the laptop, thanks!", verified: true, relevanceScore: 99, strengthScore: 98, metadata: { extractedFact: "Customer confirmed receipt after delivery.", confidence: 0.98 } }),
    evidence({ id: "E06", disputeId: dispute.id, orderId: order.id, type: "terms_and_conditions", title: "Checkout terms", source: "Policy", contentText: "Title passes on delivery. Chargebacks require proof of non-receipt.", verified: true, relevanceScore: 60, strengthScore: 70, metadata: {} }),
  ];

  addInvestigated(store, dispute, items, { shipment, payment, model: "contest", confidence: 0.94 });
  store.auditLogs.push(
    audit(dispute.id, "system", "webhook", "dispute.received", iso(24, 10), { source: "razorpay" }),
    audit(dispute.id, "system", "pipeline", "payment.retrieved", iso(24, 10), { paymentId: HERO_PAYMENT_ID }),
    audit(dispute.id, "system", "pipeline", "order.matched", iso(24, 10), { orderId: HERO_ORDER_ID }),
    audit(dispute.id, "system", "pipeline", "evidence.discovered", iso(24, 10), { count: 6 }),
    audit(dispute.id, "AI", "investigator", "investigation.completed", iso(24, 10), { score: 92 }),
    audit(dispute.id, "AI", "investigator", "recommendation.contest", iso(24, 10), { confidence: 0.94 }),
  );
}

function addWeakCase(store: AppStore): void {
  const customer = cust("cus_neha", "Neha Kapoor", "neha.kapoor@example.com", "9811100110");
  store.customers.push(customer);
  const order = ord("ord_weak", "ORD-4412", customer.id, 15000, "paid", iso(18));
  store.orders.push(order);
  store.orderItems.push({ id: "oi_weak", orderId: order.id, productId: "prd_ssd", quantity: 1, unitPrice: 15000 });
  const payment = pay("pay_weak", "pay_weak_15k", "order_weak", order.id, 15000, iso(18, 11));
  store.payments.push(payment);
  const shipment: Shipment = {
    id: "shp_weak",
    organizationId: ORG_ID,
    orderId: order.id,
    provider: "Delhivery",
    trackingId: "DL-UNCERTAIN",
    status: "unknown",
    rawData: {},
  };
  store.shipments.push(shipment);
  store.invoices.push(inv("inv_weak", order.id, "INV-4412"));
  const dispute: Dispute = {
    id: WEAK_DISPUTE_ID,
    organizationId: ORG_ID,
    razorpayDisputeId: "disp_rp_weak",
    paymentId: payment.id,
    amount: 15000,
    currency: "INR",
    reasonCode: "product_not_received",
    reasonDescription: "Product not received",
    phase: "investigating",
    status: "action_required",
    respondBy: iso(26, 8),
    rawData: {},
    createdAt: iso(23, 15),
    updatedAt: iso(23, 15),
  };
  const items = [
    evidence({ id: "E11", disputeId: dispute.id, orderId: order.id, type: "payment", title: "Captured payment", source: "Razorpay", contentText: "₹15,000 captured.", verified: true, relevanceScore: 90, strengthScore: 90, metadata: {} }),
    evidence({ id: "E12", disputeId: dispute.id, orderId: order.id, type: "billing_proof", title: "Invoice INV-4412", source: "Billing", contentText: "2TB SSD invoice.", verified: true, relevanceScore: 80, strengthScore: 85, metadata: {} }),
  ];
  addInvestigated(store, dispute, items, { shipment, payment, model: "human_review", confidence: 0.71 });
  store.auditLogs.push(audit(dispute.id, "system", "webhook", "dispute.received", iso(23, 15), {}));
}

function addRefundCase(store: AppStore): void {
  const customer = cust("cus_arjun", "Arjun Desai", "arjun.desai@example.com", "9822002200");
  store.customers.push(customer);
  const order = ord("ord_ref", "ORD-2201", customer.id, 45999, "refunded", iso(5), iso(7));
  store.orders.push(order);
  store.orderItems.push({ id: "oi_ref", orderId: order.id, productId: "prd_watch", quantity: 1, unitPrice: 45999 });
  const payment = pay("pay_ref", "pay_watch_ref", "order_watch", order.id, 45999, iso(5, 12), 45999, "refunded");
  store.payments.push(payment);
  const refund: Refund = { id: "rfd_1", organizationId: ORG_ID, paymentId: payment.id, razorpayRefundId: "rfnd_watch", amount: 45999, status: "processed", rawData: {}, createdAt: iso(8) };
  store.refunds.push(refund);
  store.invoices.push(inv("inv_ref", order.id, "INV-2201"));
  const dispute: Dispute = {
    id: REFUND_DISPUTE_ID,
    organizationId: ORG_ID,
    razorpayDisputeId: "disp_rp_ref",
    paymentId: payment.id,
    amount: 45999,
    currency: "INR",
    reasonCode: "refund_not_received",
    reasonDescription: "Refund not received",
    phase: "ready",
    status: "open",
    respondBy: iso(29),
    rawData: {},
    createdAt: iso(20),
    updatedAt: iso(20),
  };
  const items = [
    evidence({ id: "E21", disputeId: dispute.id, orderId: order.id, type: "payment", title: "Original payment", source: "Razorpay", contentText: "₹45,999 captured then refunded.", verified: true, relevanceScore: 90, strengthScore: 90, metadata: {} }),
    evidence({ id: "E22", disputeId: dispute.id, orderId: order.id, type: "refund_confirmation", title: "Full refund rfnd_watch", source: "Razorpay", contentText: "Full refund processed 8 Aug.", verified: true, relevanceScore: 99, strengthScore: 97, metadata: {} }),
    evidence({ id: "E23", disputeId: dispute.id, orderId: order.id, type: "billing_proof", title: "Invoice INV-2201", source: "Billing", contentText: "Apple Watch invoice.", verified: true, relevanceScore: 70, strengthScore: 80, metadata: {} }),
  ];
  addInvestigated(store, dispute, items, { payment, refunds: [refund], model: "accept", confidence: 0.9 });
}

function addServiceCase(store: AppStore): void {
  const customer = cust("cus_isha", "Isha Nair", "isha.nair@example.com", "9833003300");
  store.customers.push(customer);
  const order = ord("ord_svc", "ORD-9102", customer.id, 3999, "fulfilled", iso(2), iso(2));
  store.orders.push(order);
  store.orderItems.push({ id: "oi_svc", orderId: order.id, productId: "prd_saas", quantity: 1, unitPrice: 3999 });
  const payment = pay("pay_svc", "pay_careplus", "order_care", order.id, 3999, iso(2, 9));
  store.payments.push(payment);
  const dispute: Dispute = {
    id: SERVICE_DISPUTE_ID,
    organizationId: ORG_ID,
    razorpayDisputeId: "disp_rp_svc",
    paymentId: payment.id,
    amount: 3999,
    currency: "INR",
    reasonCode: "service_not_provided",
    reasonDescription: "Service not provided",
    phase: "ready",
    status: "open",
    respondBy: iso(30),
    rawData: {},
    createdAt: iso(21),
    updatedAt: iso(21),
  };
  const items = [
    evidence({ id: "E31", disputeId: dispute.id, orderId: order.id, type: "payment", title: "Care+ payment", source: "Razorpay", contentText: "₹3,999 captured.", verified: true, relevanceScore: 88, strengthScore: 90, metadata: {} }),
    evidence({ id: "E32", disputeId: dispute.id, orderId: order.id, type: "proof_of_service", title: "Policy activated", source: "Care+", contentText: "Northstar Care+ activated on 2 Aug. Claim window open.", verified: true, relevanceScore: 95, strengthScore: 92, metadata: {} }),
    evidence({ id: "E33", disputeId: dispute.id, orderId: order.id, type: "access_activity_log", title: "Portal access log", source: "Product", contentText: "Customer logged in 6 times and filed a protection claim.", verified: true, relevanceScore: 93, strengthScore: 90, metadata: { repeatCustomer: true } }),
    evidence({ id: "E34", disputeId: dispute.id, orderId: order.id, type: "billing_proof", title: "Service invoice", source: "Billing", contentText: "Care+ invoice emailed at checkout.", verified: true, relevanceScore: 80, strengthScore: 82, metadata: {} }),
  ];
  addInvestigated(store, dispute, items, { payment, model: "contest", confidence: 0.89 });
}

function addConflictCase(store: AppStore): void {
  const customer = cust("cus_vikram", "Vikram Bose", "vikram.bose@example.com", "9844004400");
  store.customers.push(customer);
  const order = ord("ord_cf", "ORD-7761", customer.id, 24999, "paid", iso(12));
  store.orders.push(order);
  store.orderItems.push({ id: "oi_cf", orderId: order.id, productId: "prd_buds", quantity: 1, unitPrice: 12999 });
  const payment = pay("pay_cf", "pay_conflict", "order_cf", order.id, 24999, iso(12, 14));
  store.payments.push(payment);
  const shipment: Shipment = {
    id: "shp_cf",
    organizationId: ORG_ID,
    orderId: order.id,
    provider: "XpressBees",
    trackingId: "XB-TWO-STATUS",
    status: "delivered",
    shippedAt: iso(13),
    deliveredAt: iso(16),
    rawData: { conflicting: true, notes: "Carrier marked delivered; warehouse scan shows RTO." },
  };
  store.shipments.push(shipment);
  const dispute: Dispute = {
    id: CONFLICT_DISPUTE_ID,
    organizationId: ORG_ID,
    razorpayDisputeId: "disp_rp_cf",
    paymentId: payment.id,
    amount: 24999,
    currency: "INR",
    reasonCode: "product_not_received",
    reasonDescription: "Product not received",
    phase: "investigating",
    status: "open",
    respondBy: iso(28, 12),
    rawData: {},
    createdAt: iso(22),
    updatedAt: iso(22),
  };
  const items = [
    evidence({ id: "E41", disputeId: dispute.id, orderId: order.id, type: "payment", title: "Payment captured", source: "Razorpay", contentText: "₹24,999 captured.", verified: true, relevanceScore: 85, strengthScore: 88, metadata: {} }),
    evidence({ id: "E42", disputeId: dispute.id, orderId: order.id, type: "shipping_proof", title: "Out for delivery", source: "XpressBees", contentText: "Scan: out for delivery 16 Aug.", verified: false, relevanceScore: 70, strengthScore: 55, metadata: { contradicts: true } }),
    evidence({ id: "E43", disputeId: dispute.id, orderId: order.id, type: "delivery_confirmation", title: "RTO warehouse scan", source: "Warehouse", contentText: "Same-day RTO scan conflicts with delivered status.", verified: false, relevanceScore: 80, strengthScore: 50, metadata: { contradicts: true } }),
  ];
  addInvestigated(store, dispute, items, { shipment, payment, model: "human_review", confidence: 0.64 });
}

function addNeverShippedCase(store: AppStore): void {
  const customer = cust("cus_lara", "Lara D'Souza", "lara.dsouza@example.com", "9855005500");
  store.customers.push(customer);
  const order = ord("ord_ns", "ORD-1008", customer.id, 8999, "paid", iso(19));
  store.orders.push(order);
  store.orderItems.push({ id: "oi_ns", orderId: order.id, productId: "prd_keyboard", quantity: 1, unitPrice: 8999 });
  const payment = pay("pay_ns", "pay_never", "order_ns", order.id, 8999, iso(19, 11));
  store.payments.push(payment);
  const shipment: Shipment = {
    id: "shp_ns",
    organizationId: ORG_ID,
    orderId: order.id,
    provider: "Internal",
    trackingId: "NONE",
    status: "never_shipped",
    rawData: { warehouse: "unpicked" },
  };
  store.shipments.push(shipment);
  const dispute: Dispute = {
    id: NEVER_SHIPPED_ID,
    organizationId: ORG_ID,
    razorpayDisputeId: "disp_rp_ns",
    paymentId: payment.id,
    amount: 8999,
    currency: "INR",
    reasonCode: "product_not_received",
    reasonDescription: "Product not received",
    phase: "ready",
    status: "open",
    respondBy: iso(29, 9),
    rawData: {},
    createdAt: iso(24, 8),
    updatedAt: iso(24, 8),
  };
  const items = [
    evidence({ id: "E51", disputeId: dispute.id, orderId: order.id, type: "payment", title: "Payment captured", source: "Razorpay", contentText: "₹8,999 captured.", verified: true, relevanceScore: 80, strengthScore: 85, metadata: {} }),
    evidence({ id: "E52", disputeId: dispute.id, orderId: order.id, type: "billing_proof", title: "Order confirmation", source: "Orders", contentText: "Keyboard reserved, never picked.", verified: true, relevanceScore: 75, strengthScore: 70, metadata: {} }),
  ];
  addInvestigated(store, dispute, items, { shipment, payment, model: "accept", confidence: 0.92 });
}

function addDigitalCase(store: AppStore): void {
  const customer = cust("cus_dev", "Dev Patel", "dev.patel@example.com", "9866006600");
  store.customers.push(customer);
  const order = ord("ord_dig", "ORD-5550", customer.id, 3999, "fulfilled", iso(6), iso(6));
  store.orders.push(order);
  store.orderItems.push({ id: "oi_dig", orderId: order.id, productId: "prd_saas", quantity: 1, unitPrice: 3999 });
  const payment = pay("pay_dig", "pay_digital", "order_dig", order.id, 3999, iso(6, 8));
  store.payments.push(payment);
  const dispute: Dispute = {
    id: DIGITAL_DISPUTE_ID,
    organizationId: ORG_ID,
    razorpayDisputeId: "disp_rp_dig",
    paymentId: payment.id,
    amount: 3999,
    currency: "INR",
    reasonCode: "transaction_not_recognised",
    reasonDescription: "Transaction not recognised",
    phase: "ready",
    status: "open",
    respondBy: iso(30, 14),
    rawData: {},
    createdAt: iso(19),
    updatedAt: iso(19),
  };
  const items = [
    evidence({ id: "E61", disputeId: dispute.id, orderId: order.id, type: "payment", title: "UPI payment", source: "Razorpay", contentText: "UPI VPA matches customer account.", verified: true, relevanceScore: 90, strengthScore: 90, metadata: {} }),
    evidence({ id: "E62", disputeId: dispute.id, orderId: order.id, type: "access_activity_log", title: "Session history", source: "App", contentText: "Same device used for 14 prior logins.", verified: true, relevanceScore: 94, strengthScore: 91, metadata: { repeatCustomer: true } }),
    evidence({ id: "E63", disputeId: dispute.id, orderId: order.id, type: "billing_proof", title: "Receipt email", source: "Email", contentText: "Receipt opened from the customer's mailbox.", verified: true, relevanceScore: 82, strengthScore: 80, metadata: {} }),
    evidence({ id: "E64", disputeId: dispute.id, orderId: order.id, type: "customer_communication", title: "Prior purchases", source: "CRM", contentText: "Customer bought Care+ last year from the same account.", verified: true, relevanceScore: 70, strengthScore: 72, metadata: {} }),
  ];
  addInvestigated(store, dispute, items, { payment, model: "contest", confidence: 0.87 });
}

function addActionRequiredCase(store: AppStore): void {
  const customer = cust("cus_sara", "Sara Khan", "sara.khan@example.com", "9877007700");
  store.customers.push(customer);
  const order = ord("ord_ar", "ORD-3320", customer.id, 3499, "fulfilled", iso(15), iso(17));
  store.orders.push(order);
  store.orderItems.push({ id: "oi_ar", orderId: order.id, productId: "prd_stand", quantity: 1, unitPrice: 3499 });
  const payment = pay("pay_ar", "pay_action", "order_ar", order.id, 3499, iso(15, 10));
  store.payments.push(payment);
  store.shipments.push({
    id: "shp_ar",
    organizationId: ORG_ID,
    orderId: order.id,
    provider: "DTDC",
    trackingId: "DTDC8821",
    status: "delivered",
    shippedAt: iso(16),
    deliveredAt: iso(17),
    deliveryLocation: "Mumbai",
    rawData: {},
  });
  const dispute: Dispute = {
    id: ACTION_REQUIRED_ID,
    organizationId: ORG_ID,
    razorpayDisputeId: "disp_rp_ar",
    paymentId: payment.id,
    amount: 3499,
    currency: "INR",
    reasonCode: "product_not_as_described",
    reasonDescription: "Product not as described",
    phase: "received",
    status: "action_required",
    respondBy: iso(25, 20),
    rawData: {},
    createdAt: iso(23, 20),
    updatedAt: iso(23, 20),
  };
  const items = [
    evidence({ id: "E71", disputeId: dispute.id, orderId: order.id, type: "payment", title: "Payment", source: "Razorpay", contentText: "₹3,499 captured.", verified: true, relevanceScore: 80, strengthScore: 85, metadata: {} }),
    evidence({ id: "E72", disputeId: dispute.id, orderId: order.id, type: "billing_proof", title: "Listing snapshot", source: "Catalog", contentText: "Stand advertised as aluminium, 8kg rating.", verified: true, relevanceScore: 88, strengthScore: 80, metadata: {} }),
    evidence({ id: "E73", disputeId: dispute.id, orderId: order.id, type: "delivery_confirmation", title: "Delivered Mumbai", source: "DTDC", contentText: "Delivered 17 Aug.", verified: true, relevanceScore: 70, strengthScore: 75, metadata: {} }),
  ];
  addInvestigated(store, dispute, items, { payment, shipment: store.shipments.find((s) => s.id === "shp_ar"), model: "human_review", confidence: 0.6 });
}

function addCatalogCases(store: AppStore): void {
  const rand = mulberry32(4401);
  const names = ["Anika Rao", "Farhan Qureshi", "Priya Menon", "Rohit Jain", "Sana Ali", "Harsh Vyas", "Diya Kulkarni", "Aman Gill", "Tara Bhatt", "Nikhil Rao", "Pooja Iyer", "Aditya Sen"];
  const reasons: DisputeReason[] = ["product_not_received", "transaction_not_recognised", "duplicate_transaction", "product_not_as_described", "refund_not_received", "service_not_provided"];
  const statuses: DisputeStatus[] = ["open", "action_required", "under_review", "won", "lost", "closed"];

  names.forEach((name, index) => {
    const amount = [7999, 12999, 18999, 24999, 32999, 69999, 8999, 15999, 21999, 44999, 5999, 9999][index] ?? 9999;
    const reason = reasons[index % reasons.length] ?? "other";
    const status = statuses[index % statuses.length] ?? "open";
    const customer = cust(`cus_c${index}`, name, `${name.toLowerCase().replace(/[^a-z]/g, ".")}@mail.test`, `98000${1000 + index}`);
    store.customers.push(customer);
    const order = ord(`ord_c${index}`, `ORD-7${200 + index}`, customer.id, amount, status === "won" || status === "lost" ? "fulfilled" : "paid", iso(4 + index), iso(8 + index));
    store.orders.push(order);
    store.orderItems.push({ id: `oi_c${index}`, orderId: order.id, productId: pick(rand, store.products).id, quantity: 1, unitPrice: amount });
    const payment = pay(`pay_c${index}`, `pay_cat_${index}`, `order_cat_${index}`, order.id, amount, iso(4 + index, 12));
    store.payments.push(payment);
    const delivered = index % 3 !== 1;
    const shipment: Shipment = {
      id: `shp_c${index}`,
      organizationId: ORG_ID,
      orderId: order.id,
      provider: pick(rand, ["BlueDart", "Delhivery", "DTDC"]),
      trackingId: `TRK${8000 + index}`,
      status: delivered ? "delivered" : "in_transit",
      shippedAt: iso(5 + index),
      deliveredAt: delivered ? iso(8 + index) : undefined,
      deliveryLocation: pick(rand, ["Bengaluru", "Mumbai", "Pune", "Delhi"]),
      rawData: {},
    };
    store.shipments.push(shipment);
    if (index % 5 === 0) store.invoices.push(inv(`inv_c${index}`, order.id, `INV-7${200 + index}`));
    const id = index === 3 ? "disp_won_pixel" : `disp_cat_${index}`;
    const dispute: Dispute = {
      id,
      organizationId: ORG_ID,
      razorpayDisputeId: `disp_rp_c${index}`,
      paymentId: payment.id,
      amount,
      currency: "INR",
      reasonCode: reason,
      reasonDescription: reason.replaceAll("_", " "),
      phase: status === "won" || status === "lost" ? "closed" : status === "under_review" ? "submitted" : "ready",
      status,
      respondBy: status === "won" || status === "lost" ? undefined : iso(26 + (index % 4), 18),
      rawData: {},
      createdAt: iso(16 + (index % 8)),
      updatedAt: iso(16 + (index % 8), 14),
    };
    const items: EvidenceItem[] = [
      evidence({ id: `E8${index}1`, disputeId: id, orderId: order.id, type: "payment", title: "Payment", source: "Razorpay", contentText: `₹${amount} captured.`, verified: true, relevanceScore: 85, strengthScore: 88, metadata: {} }),
    ];
    if (delivered) {
      items.push(evidence({ id: `E8${index}2`, disputeId: id, orderId: order.id, type: "delivery_confirmation", title: "Delivery", source: shipment.provider, contentText: `Delivered ${shipment.deliveryLocation}.`, verified: true, relevanceScore: 90, strengthScore: 90, metadata: {} }));
      items.push(evidence({ id: `E8${index}3`, disputeId: id, orderId: order.id, type: "shipping_proof", title: "Shipment", source: shipment.provider, contentText: shipment.trackingId, verified: true, relevanceScore: 80, strengthScore: 84, metadata: {} }));
    }
    if (index % 2 === 0) {
      items.push(evidence({ id: `E8${index}4`, disputeId: id, orderId: order.id, type: "billing_proof", title: "Invoice", source: "Billing", contentText: "Invoice issued.", verified: true, relevanceScore: 75, strengthScore: 78, metadata: {} }));
    }
    addInvestigated(store, dispute, items, {
      payment,
      shipment,
      model: delivered && items.length >= 3 ? "contest" : "human_review",
      confidence: delivered ? 0.86 : 0.67,
    });
    if (status === "won") {
      store.auditLogs.push(audit(id, "razorpay", "razorpay", "dispute.won", iso(22), { amount }));
    }
  });
}

function cust(id: string, name: string, email: string, phone: string): Customer {
  return { id, organizationId: ORG_ID, externalId: id.replace("cus_", "rzp_"), name, email, phone, createdAt: iso(2) };
}

function ord(id: string, externalId: string, customerId: string, amount: number, status: Order["status"], createdAt: string, fulfilledAt?: string): Order {
  const address = customerId.includes("sara") || customerId.includes("arjun") ? MUM : BLR;
  return { id, organizationId: ORG_ID, externalId, customerId, currency: "INR", amount, status, shippingAddress: address, billingAddress: address, createdAt, fulfilledAt };
}

function pay(id: string, razorpayPaymentId: string, razorpayOrderId: string, orderId: string, amount: number, createdAt: string, amountRefunded = 0, status: Payment["status"] = "captured"): Payment {
  return {
    id,
    organizationId: ORG_ID,
    razorpayPaymentId,
    razorpayOrderId,
    orderId,
    amount,
    currency: "INR",
    status,
    method: "upi",
    captured: status === "captured" || status === "refunded",
    amountRefunded,
    rawData: {},
    createdAt,
  };
}

function inv(id: string, orderId: string, invoiceNumber: string): Invoice {
  return { id, organizationId: ORG_ID, orderId, invoiceNumber, billingAddress: BLR, shippingAddress: BLR, createdAt: iso(10) };
}

function msg(id: string, customerId: string, orderId: string, senderType: CustomerMessage["senderType"], body: string, sentAt: string): CustomerMessage {
  return { id, organizationId: ORG_ID, customerId, orderId, channel: "chat", senderType, body, sentAt, metadata: {} };
}

function audit(disputeId: string, actorType: AuditLog["actorType"], actorId: string, action: string, createdAt: string, metadata: Record<string, unknown>): AuditLog {
  return {
    id: `aud_${disputeId}_${action}_${createdAt}`,
    organizationId: ORG_ID,
    disputeId,
    actorType,
    actorId,
    action,
    metadata,
    createdAt,
  };
}
