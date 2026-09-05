import { describe, expect, it } from "vitest";
import { signSessionId, verifySessionId } from "@/lib/auth/session-token";

describe("session token", () => {
  it("signs and verifies a user id", async () => {
    const token = await signSessionId("usr_admin", "test-secret");
    expect(await verifySessionId(token, "test-secret")).toBe("usr_admin");
    expect(await verifySessionId(token, "other-secret")).toBeNull();
    expect(await verifySessionId("usr_admin", "test-secret")).toBeNull();
  });
});
