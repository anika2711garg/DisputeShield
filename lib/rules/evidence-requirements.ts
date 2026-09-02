import type { DisputeReason, EvidenceType } from "@/types/domain";

export type RequiredEvidence = {
  type: EvidenceType;
  reason: string;
  critical: boolean;
};

const REQUIREMENTS: Record<DisputeReason, RequiredEvidence[]> = {
  product_not_received: [
    { type: "shipping_proof", reason: "Prove the order left the warehouse.", critical: true },
    { type: "delivery_confirmation", reason: "Prove the package reached the customer.", critical: true },
    { type: "billing_proof", reason: "Invoice or order confirmation matching the payment.", critical: true },
    { type: "customer_communication", reason: "Acknowledgement or delivery conversation.", critical: false },
    { type: "payment", reason: "Captured payment matching the disputed amount.", critical: true },
  ],
  transaction_not_recognised: [
    { type: "payment", reason: "Processor payment record and method details.", critical: true },
    { type: "billing_proof", reason: "Order identity and billing match.", critical: true },
    { type: "customer_communication", reason: "Prior customer contact or account activity.", critical: false },
    { type: "access_activity_log", reason: "Login or device history if digital.", critical: false },
  ],
  duplicate_transaction: [
    { type: "payment", reason: "Both payment references and timestamps.", critical: true },
    { type: "billing_proof", reason: "Distinct orders or a single legitimate charge.", critical: true },
    { type: "refund_confirmation", reason: "Any already-issued duplicate refund.", critical: false },
  ],
  service_not_provided: [
    { type: "proof_of_service", reason: "Booking, fulfillment, or access proof.", critical: true },
    { type: "access_activity_log", reason: "Usage or session logs.", critical: false },
    { type: "customer_communication", reason: "Service confirmation conversation.", critical: false },
    { type: "billing_proof", reason: "Service invoice or booking confirmation.", critical: true },
    { type: "payment", reason: "Captured payment for the service.", critical: true },
  ],
  refund_not_received: [
    { type: "refund_confirmation", reason: "Processor refund reference and timestamp.", critical: true },
    { type: "payment", reason: "Original captured payment.", critical: true },
    { type: "customer_communication", reason: "Refund communication with the customer.", critical: false },
  ],
  product_not_as_described: [
    { type: "billing_proof", reason: "Listing snapshot or invoice description.", critical: true },
    { type: "terms_and_conditions", reason: "Published product terms.", critical: false },
    { type: "delivery_confirmation", reason: "What was actually delivered.", critical: false },
    { type: "customer_communication", reason: "Complaint details and merchant response.", critical: false },
    { type: "refund_policy", reason: "Return or refund policy shown at checkout.", critical: false },
    { type: "payment", reason: "Captured payment.", critical: true },
  ],
  cancelled_merchandise: [
    { type: "shipping_proof", reason: "Whether fulfillment had already begun.", critical: false },
    { type: "refund_confirmation", reason: "Cancellation refund if issued.", critical: true },
    { type: "customer_communication", reason: "Cancellation request timeline.", critical: true },
    { type: "payment", reason: "Original payment.", critical: true },
  ],
  other: [
    { type: "payment", reason: "Captured payment.", critical: true },
    { type: "billing_proof", reason: "Order or invoice.", critical: true },
    { type: "customer_communication", reason: "Customer claim context.", critical: false },
  ],
};

export function requiredEvidenceFor(reason: DisputeReason): RequiredEvidence[] {
  return REQUIREMENTS[reason];
}

export function criticalEvidenceTypes(reason: DisputeReason): EvidenceType[] {
  return REQUIREMENTS[reason].filter((item) => item.critical).map((item) => item.type);
}

export function evidenceCategoryLabel(type: EvidenceType): string {
  const labels: Record<EvidenceType, string> = {
    payment: "Payment",
    billing_proof: "Billing",
    shipping_proof: "Shipping",
    delivery_confirmation: "Delivery",
    customer_communication: "Customer communication",
    proof_of_service: "Service",
    refund_confirmation: "Refund",
    access_activity_log: "Activity logs",
    refund_policy: "Policies",
    terms_and_conditions: "Terms",
    other: "Other",
  };
  return labels[type];
}
