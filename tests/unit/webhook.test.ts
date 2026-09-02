import { describe, expect, it } from "vitest";
import { createHmac } from "crypto";
import { verifyRazorpaySignature, webhookEventKey } from "@/lib/razorpay/webhooks";

describe("webhook signatures", () => {
  it("accepts a valid HMAC SHA-256 signature", () => {
    const body = '{"event":"payment.dispute.created"}';
    const secret = "whsec_test";
    const signature = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyRazorpaySignature(body, signature, secret)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const secret = "whsec_test";
    const signature = createHmac("sha256", secret).update('{"event":"a"}').digest("hex");
    expect(verifyRazorpaySignature('{"event":"b"}', signature, secret)).toBe(false);
  });

  it("builds a stable idempotency key", () => {
    const key = webhookEventKey({
      event: "payment.dispute.created",
      created_at: 1,
      payload: { dispute: { entity: { id: "disp_1" } } },
    });
    expect(key).toBe("payment.dispute.created:disp_1:1");
  });
});
