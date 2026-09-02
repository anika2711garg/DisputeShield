import { describe, expect, it } from "vitest";
import { fromRazorpayReasonCode, toRazorpayReasonCode } from "@/lib/razorpay/reason-codes";

describe("razorpay reason codes", () => {
  it("round-trips product not received", () => {
    expect(toRazorpayReasonCode("product_not_received")).toBe("product_not_received");
    expect(fromRazorpayReasonCode("unrecognized")).toBe("transaction_not_recognised");
  });
});
