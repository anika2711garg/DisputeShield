export const USER_ROLES = ["admin", "reviewer", "analyst"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ACTOR_TYPES = ["system", "AI", "user", "razorpay"] as const;
export type ActorType = (typeof ACTOR_TYPES)[number];

export const EVIDENCE_TYPES = [
  "payment",
  "billing_proof",
  "shipping_proof",
  "delivery_confirmation",
  "customer_communication",
  "proof_of_service",
  "refund_confirmation",
  "access_activity_log",
  "refund_policy",
  "terms_and_conditions",
  "other",
] as const;
export type EvidenceType = (typeof EVIDENCE_TYPES)[number];

export const DISPUTE_REASONS = [
  "product_not_received",
  "transaction_not_recognised",
  "duplicate_transaction",
  "service_not_provided",
  "refund_not_received",
  "product_not_as_described",
  "cancelled_merchandise",
  "other",
] as const;
export type DisputeReason = (typeof DISPUTE_REASONS)[number];

export const DISPUTE_PHASES = [
  "received",
  "investigating",
  "ready",
  "under_review",
  "submitted",
  "closed",
] as const;
export type DisputePhase = (typeof DISPUTE_PHASES)[number];

export const DISPUTE_STATUSES = [
  "open",
  "action_required",
  "under_review",
  "won",
  "lost",
  "closed",
  "accepted",
] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export const RECOMMENDATIONS = ["contest", "accept", "human_review"] as const;
export type Recommendation = (typeof RECOMMENDATIONS)[number];

export const EVALUATION_SPLITS = ["development", "held_out"] as const;
export type EvaluationSplit = (typeof EVALUATION_SPLITS)[number];

export const DIFFICULTIES = ["easy", "medium", "hard", "adversarial"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const MESSAGE_SENDERS = ["customer", "merchant", "system"] as const;
export type MessageSender = (typeof MESSAGE_SENDERS)[number];

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export type Profile = {
  id: string;
  organizationId: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  password?: string;
};

export type Customer = {
  id: string;
  organizationId: string;
  externalId: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
};

export type Product = {
  id: string;
  organizationId: string;
  sku: string;
  name: string;
  description: string;
  unitPrice: number;
  createdAt: string;
};

export type Order = {
  id: string;
  organizationId: string;
  externalId: string;
  customerId: string;
  currency: string;
  amount: number;
  status: "created" | "paid" | "fulfilled" | "cancelled" | "refunded";
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: string;
  fulfilledAt?: string;
};

export type OrderItem = {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type Payment = {
  id: string;
  organizationId: string;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: "captured" | "authorized" | "failed" | "refunded";
  method: string;
  captured: boolean;
  amountRefunded: number;
  rawData: Record<string, unknown>;
  createdAt: string;
};

export type Refund = {
  id: string;
  organizationId: string;
  paymentId: string;
  razorpayRefundId: string;
  amount: number;
  status: "processed" | "pending" | "failed";
  rawData: Record<string, unknown>;
  createdAt: string;
};

export type Shipment = {
  id: string;
  organizationId: string;
  orderId: string;
  provider: string;
  trackingId: string;
  status: "created" | "in_transit" | "delivered" | "failed" | "unknown" | "never_shipped";
  shippedAt?: string;
  deliveredAt?: string;
  deliveryLocation?: string;
  recipientName?: string;
  rawData: Record<string, unknown>;
};

export type Invoice = {
  id: string;
  organizationId: string;
  orderId: string;
  invoiceNumber: string;
  storagePath?: string;
  billingAddress: Address;
  shippingAddress: Address;
  createdAt: string;
};

export type CustomerMessage = {
  id: string;
  organizationId: string;
  customerId: string;
  orderId: string;
  channel: "email" | "chat" | "phone";
  senderType: MessageSender;
  body: string;
  sentAt: string;
  metadata: Record<string, unknown>;
};

export type Dispute = {
  id: string;
  organizationId: string;
  razorpayDisputeId: string;
  paymentId: string;
  amount: number;
  currency: string;
  reasonCode: DisputeReason;
  reasonDescription: string;
  phase: DisputePhase;
  status: DisputeStatus;
  respondBy?: string;
  rawData: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type EvidenceItem = {
  id: string;
  organizationId: string;
  disputeId: string;
  orderId?: string;
  type: EvidenceType;
  title: string;
  source: string;
  storagePath?: string;
  contentText?: string;
  metadata: Record<string, unknown>;
  verified: boolean;
  relevanceScore: number;
  strengthScore: number;
  includedInContest: boolean;
  createdAt: string;
};

export type AiInvestigation = {
  id: string;
  organizationId: string;
  disputeId: string;
  model: string;
  promptVersion: string;
  reasonCategory: string;
  reasonConfidence: number;
  summary: string;
  recommendation: Recommendation;
  recommendationConfidence: number;
  evidenceScore: number;
  structuredOutput: Record<string, unknown>;
  inputHash: string;
  latencyMs: number;
  createdAt: string;
};

export type RecommendationRecord = {
  id: string;
  organizationId: string;
  disputeId: string;
  aiInvestigationId: string;
  modelRecommendation: Recommendation;
  rulesRecommendation: Recommendation;
  finalRecommendation: Recommendation;
  confidence: number;
  score: number;
  overrideReasons: string[];
  createdAt: string;
};

export type Approval = {
  id: string;
  organizationId: string;
  disputeId: string;
  userId: string;
  action: "contest" | "accept" | "draft";
  status: "pending" | "approved" | "rejected" | "simulated";
  notes?: string;
  createdAt: string;
};

export type RazorpayDocument = {
  id: string;
  organizationId: string;
  evidenceItemId: string;
  razorpayDocumentId: string;
  purpose: string;
  mimeType: string;
  createdAt: string;
};

export type WebhookEvent = {
  id: string;
  provider: "razorpay";
  externalEventKey: string;
  eventType: string;
  payload: Record<string, unknown>;
  signatureValid: boolean;
  processed: boolean;
  processingError?: string;
  receivedAt: string;
  processedAt?: string;
};

export type AuditLog = {
  id: string;
  organizationId: string;
  disputeId?: string;
  actorType: ActorType;
  actorId: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type EvaluationCase = {
  id: string;
  caseKey: string;
  split: EvaluationSplit;
  inputData: Record<string, unknown>;
  groundTruth: Recommendation;
  difficulty: Difficulty;
  createdAt: string;
};

export type EvaluationPrediction = {
  id: string;
  evaluationCaseId: string;
  runId: string;
  predictedLabel: Recommendation;
  confidence: number;
  score: number;
  correct: boolean;
  createdAt: string;
};

export type EvaluationRun = {
  id: string;
  model: string;
  promptVersion: string;
  totalCases: number;
  precision: number;
  recall: number;
  accuracy: number;
  falsePositives: number;
  falseNegatives: number;
  humanEscalations: number;
  falsePositiveCost: number;
  results: Record<string, unknown>;
  createdAt: string;
};

export type Notification = {
  id: string;
  organizationId: string;
  title: string;
  body: string;
  href?: string;
  read: boolean;
  createdAt: string;
};

export type ContestDraft = {
  id: string;
  organizationId: string;
  disputeId: string;
  selectedEvidenceIds: string[];
  summary: string;
  updatedAt: string;
};

export type AppStore = {
  organizations: Organization[];
  profiles: Profile[];
  customers: Customer[];
  products: Product[];
  orders: Order[];
  orderItems: OrderItem[];
  payments: Payment[];
  refunds: Refund[];
  shipments: Shipment[];
  invoices: Invoice[];
  customerMessages: CustomerMessage[];
  disputes: Dispute[];
  evidenceItems: EvidenceItem[];
  aiInvestigations: AiInvestigation[];
  recommendations: RecommendationRecord[];
  approvals: Approval[];
  razorpayDocuments: RazorpayDocument[];
  webhookEvents: WebhookEvent[];
  auditLogs: AuditLog[];
  evaluationCases: EvaluationCase[];
  evaluationPredictions: EvaluationPrediction[];
  evaluationRuns: EvaluationRun[];
  notifications: Notification[];
  contestDrafts: ContestDraft[];
};

export function emptyStore(): AppStore {
  return {
    organizations: [],
    profiles: [],
    customers: [],
    products: [],
    orders: [],
    orderItems: [],
    payments: [],
    refunds: [],
    shipments: [],
    invoices: [],
    customerMessages: [],
    disputes: [],
    evidenceItems: [],
    aiInvestigations: [],
    recommendations: [],
    approvals: [],
    razorpayDocuments: [],
    webhookEvents: [],
    auditLogs: [],
    evaluationCases: [],
    evaluationPredictions: [],
    evaluationRuns: [],
    notifications: [],
    contestDrafts: [],
  };
}
