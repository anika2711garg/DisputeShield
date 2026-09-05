import { describe, expect, it } from "vitest";
import { hashPassword, isHashedPassword, verifyPassword } from "@/lib/auth/password";

describe("passwords", () => {
  it("hashes and verifies", () => {
    const hash = hashPassword("demo1234");
    expect(isHashedPassword(hash)).toBe(true);
    expect(verifyPassword("demo1234", hash)).toBe(true);
    expect(verifyPassword("wrong", hash)).toBe(false);
  });

  it("accepts legacy plaintext once", () => {
    expect(verifyPassword("demo1234", "demo1234")).toBe(true);
    expect(verifyPassword("demo1234", "nope")).toBe(false);
  });
});
