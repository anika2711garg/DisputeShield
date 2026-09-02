import type {
  AiInvestigation,
  Approval,
  ContestDraft,
  Customer,
  CustomerMessage,
  Dispute,
  EvidenceItem,
  Invoice,
  Order,
  Payment,
  Product,
  RecommendationRecord,
  Refund,
  Shipment,
} from "./domain";

export type CaseBundle = {
  dispute: Dispute;
  payment?: Payment;
  order?: Order;
  customer?: Customer;
  shipment?: Shipment;
  invoice?: Invoice;
  refunds: Refund[];
  messages: CustomerMessage[];
  evidence: EvidenceItem[];
  investigation?: AiInvestigation;
  recommendation?: RecommendationRecord;
  products: Product[];
  draft?: ContestDraft;
  approvals: Approval[];
};
