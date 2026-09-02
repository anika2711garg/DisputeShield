import { createHmac, timingSafeEqual } from "crypto";

export { RAZORPAY_DISPUTE_EVENTS, isDisputeEvent, type RazorpayDisputeEvent } from "./events";

export function verifyRazorpaySignature(rawBody: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export function webhookEventKey(payload: { event?: string; created_at?: number; payload?: { dispute?: { entity?: { id?: string } } } }): string {
  const disputeId = payload.payload?.dispute?.entity?.id ?? "unknown";
  return `${payload.event ?? "unknown"}:${disputeId}:${payload.created_at ?? 0}`;
}
