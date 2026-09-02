import { describe, expect, it } from "vitest";
import { assertFinancialRole, canSubmitFinancialAction } from "@/lib/auth/permissions";

describe("roles", () => {
  it("blocks analysts from financial actions", () => {
    expect(canSubmitFinancialAction("analyst")).toBe(false);
    expect(() => assertFinancialRole("analyst")).toThrow("PERMISSION_DENIED");
  });

  it("allows reviewers and admins", () => {
    expect(canSubmitFinancialAction("reviewer")).toBe(true);
    expect(canSubmitFinancialAction("admin")).toBe(true);
  });
});
