import type { DisputeReason } from "@/types/domain";

export const RAZORPAY_REASON_CODES = [
  { code: "product_not_received", label: "Product not received", mapsTo: "product_not_received" },
  { code: "unrecognized", label: "Transaction not recognised", mapsTo: "transaction_not_recognised" },
  { code: "duplicate", label: "Duplicate transaction", mapsTo: "duplicate_transaction" },
  { code: "credit_not_processed", label: "Refund not received", mapsTo: "refund_not_received" },
  { code: "product_unacceptable", label: "Product not as described", mapsTo: "product_not_as_described" },
  { code: "subscription_cancelled", label: "Service not provided", mapsTo: "service_not_provided" },
  { code: "cancelled_merchandise", label: "Cancelled merchandise", mapsTo: "cancelled_merchandise" },
  { code: "other", label: "Other", mapsTo: "other" },
] as const;

export function toRazorpayReasonCode(reason: DisputeReason | string): string {
  const found = RAZORPAY_REASON_CODES.find((item) => item.mapsTo === reason);
  return found?.code ?? "other";
}

export function fromRazorpayReasonCode(code?: string): DisputeReason {
  const found = RAZORPAY_REASON_CODES.find((item) => item.code === code);
  return (found?.mapsTo ?? "other") as DisputeReason;
}
