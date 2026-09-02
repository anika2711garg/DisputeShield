export const RAZORPAY_DISPUTE_EVENTS = [
  "payment.dispute.created",
  "payment.dispute.action_required",
  "payment.dispute.under_review",
  "payment.dispute.won",
  "payment.dispute.lost",
  "payment.dispute.closed",
] as const;

export type RazorpayDisputeEvent = (typeof RAZORPAY_DISPUTE_EVENTS)[number];

export function isDisputeEvent(event: string): event is RazorpayDisputeEvent {
  return (RAZORPAY_DISPUTE_EVENTS as readonly string[]).includes(event);
}
