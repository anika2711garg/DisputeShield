import { describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env";

describe("parseEnv", () => {
  it("uses safe defaults when the host leaves variables blank", () => {
    const env = parseEnv({
      RAZORPAY_MODE: "",
      ENABLE_RAZORPAY_WRITES: "   ",
      OPENAI_API_KEY: "",
      DEMO_AUTH_SECRET: "",
    });
    expect(env.RAZORPAY_MODE).toBe("mock");
    expect(env.ENABLE_RAZORPAY_WRITES).toBe("false");
    expect(env.OPENAI_API_KEY).toBe("");
    expect(env.DEMO_AUTH_SECRET).toBe("disputeshield-demo-secret");
  });

  it("does not crash on an unknown Razorpay mode", () => {
    expect(parseEnv({ RAZORPAY_MODE: "sandbox" }).RAZORPAY_MODE).toBe("mock");
  });
});
