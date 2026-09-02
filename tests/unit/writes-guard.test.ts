import { describe, expect, it } from "vitest";
import { assertRazorpayWritesEnabled } from "@/lib/razorpay/writes";

describe("razorpay write guard", () => {
  it("simulates writes by default", () => {
    const result = assertRazorpayWritesEnabled();
    expect(result?.simulated).toBe(true);
  });
});
